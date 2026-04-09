---
title: "TypeScript Era & Migration"
weight: 6
---

## Overview

The Codex CLI was originally built in TypeScript using React/Ink for the terminal UI. This implementation shipped from launch through August 2025, when it was replaced by the current Rust rewrite (commit `408c7ca`, August 8, 2025)[^1]. The TypeScript architecture is well-documented because the original source files were open and remained the basis for many derivative projects. Understanding it illuminates the design decisions in the Rust rewrite and shows how the project evolved from a Node.js prototype to a production Rust system.

## Tech Stack (TypeScript Version)

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js >= 22 |
| Language | TypeScript 5.x |
| UI Framework | React 18 + Ink 5 (terminal React renderer) |
| API Client | `openai` npm package (^4.95.1) |
| CLI Parser | `meow` (^13.2.0) |
| Build | `esbuild` |
| Testing | `vitest` |
| Shell Parsing | `shell-quote` |
| Config | JSON or YAML (`js-yaml`) |
| Markdown | `marked` + `marked-terminal` |
| Schema Validation | `zod` |

## CLI Entry Point (`cli.tsx`)

The entry point was a `#!/usr/bin/env node` script with this startup sequence:

1. Load `dotenv/config` for environment variables
2. Validate Node.js >= 22 (hard exit if older)
3. Suppress deprecation warnings (`process.noDeprecation = true`)
4. Parse CLI flags via `meow`
5. Resolve authentication (OAuth token or API key)
6. Render the React/Ink `<App>` component (interactive) or create an `AgentLoop` directly (quiet mode)

### CLI Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--model` / `-m` | Model selection | `codex-mini-latest` |
| `--provider` / `-p` | Provider selection | `openai` |
| `--approval-mode` / `-a` | `suggest`, `auto-edit`, `full-auto` | `suggest` |
| `--writable-root` / `-w` | Extra sandbox-writable directories | — |
| `--quiet` / `-q` | Non-interactive mode | false |
| `--full-auto` | Auto-approve everything in sandbox | false |
| `--dangerously-auto-approve-everything` | No sandbox, no prompts | false |
| `--reasoning` | Effort level (low/medium/high) | `high` |
| `--full-context` / `-f` | Single-pass full-repo editing mode | false |
| `--flex-mode` | OpenAI flex service tier | false |
| `--notify` | Desktop notifications | false |

### Authentication

- Tokens stored in `~/.codex/auth.json` (refresh token, access token, API key)
- Tokens expired after 28 days
- OAuth issuer: `https://auth.openai.com`, client ID: `app_EMoamEEZ73f0CkXaXp7hrann`
- Fallback to `OPENAI_API_KEY` environment variable
- Provider-specific env vars: `GEMINI_API_KEY`, `OLLAMA_API_KEY`, etc.

## React/Ink UI

### Component Hierarchy

```
<App>
  ├── Git repo check + <ConfirmInput> warning
  └── <TerminalChat>
        ├── <TerminalChatInput>        # User input
        ├── <TerminalMessageHistory>   # Conversation display
        ├── <TerminalMessage>          # Individual messages
        └── Overlay system             # Slash command overlays
```

### TerminalChat State

| State | Purpose |
|-------|---------|
| `model`, `provider` | Current model and API provider |
| `lastResponseId` | For response chaining (server-side context) |
| `items` | `ResponseItem[]` conversation history |
| `loading` | Whether the agent is active |
| `approvalPolicy` | Current approval mode |
| `thinkingSeconds` | Timer for reasoning display |
| `overlayMode` | Active overlay (`none`, `history`, `model`, `approval`, `help`, `diff`) |

### Overlay System

Slash commands surfaced overlays:

| Command | Overlay |
|---------|---------|
| `/history` | Conversation history browser |
| `/sessions` | Saved sessions browser |
| `/model` | Model switcher (also changes provider) |
| `/approval` | Approval mode switcher |
| `/help` | Help screen |
| `/diff` | `git diff` output |
| `/compact` | Summarize conversation to reduce context |

### Desktop Notifications

On macOS, when `config.notify` was enabled and the agent finished a turn, the UI spawned `osascript` to show a native notification with the last assistant message (truncated to 100 characters).

## The Agent Loop (`agent-loop.ts`)

This was the core of the harness — a class managing the conversation with the OpenAI Responses API.

### Constructor Parameters

```typescript
type AgentLoopParams = {
  model: string;
  provider?: string;
  config?: AppConfig;
  instructions?: string;
  approvalPolicy: ApprovalPolicy;
  disableResponseStorage?: boolean;
  onItem: (item: ResponseItem) => void;
  onLoading: (loading: boolean) => void;
  additionalWritableRoots: ReadonlyArray<string>;
  getCommandConfirmation: (...) => Promise<CommandConfirmation>;
  onLastResponseId: (lastResponseId: string) => void;
};
```

### Key Instance Fields

| Field | Purpose |
|-------|---------|
| `generation: number` | Incremented per `run()` call; used to ignore stale events |
| `execAbortController` | For aborting in-progress tool calls |
| `canceled` / `terminated` | Lifecycle flags |
| `hardAbort` | Master abort signal, fires on `terminate()` |
| `transcript` | Local conversation history (when `disableResponseStorage === true`) |
| `pendingAborts` | Tracks unresolved function call IDs from cancelled runs |

### Tools

Two tool types were defined:

```typescript
// Standard function tool
const shellFunctionTool: FunctionTool = {
  type: "function",
  name: "shell",
  description: "Runs a shell command, and returns its output.",
  parameters: {
    type: "object",
    properties: {
      command: { type: "array", items: { type: "string" } },
      workdir: { type: "string" },
      timeout: { type: "number" },
    },
    required: ["command"],
  },
};

// Native tool (for codex-series models)
const localShellTool: Tool = { type: "local_shell" };
```

### The `run()` Method — Main Loop

1. Bump `generation`, reset `canceled`, create fresh `execAbortController`
2. Build abort outputs for any `pendingAborts` from prior cancelled runs
3. Build `turnInput` (full transcript or delta, depending on `disableResponseStorage`)
4. Enter the main `while (turnInput.length > 0)` loop:
   - Stage input items to UI with 3ms delay
   - Build API request with model-specific reasoning config
   - Call the Responses API with streaming
   - Process streaming events (`response.output_item.done`, `response.completed`)
   - Handle function calls via `handleFunctionCall()` or `handleLocalShellCall()`
   - New `turnInput` built from function call outputs (loop continues if non-empty)

### API Call Configuration

```typescript
stream = await responseCall({
  model,
  instructions: mergedInstructions,
  input: turnInput,
  stream: true,
  parallel_tool_calls: false,
  reasoning: { effort: config.reasoningEffort, summary: "auto" },
  tools,
  tool_choice: "auto",
  ...(flexMode ? { service_tier: "flex" } : {}),
  ...(disableResponseStorage
    ? { store: false }
    : { store: true, previous_response_id: lastResponseId }),
});
```

### Retry Logic

| Condition | Strategy |
|-----------|----------|
| Transient errors (5xx, timeout, network) | Up to 8 retries with backoff |
| Rate limit (429) | Exponential backoff from 500ms, parses `retry-after` header |
| Stream-level rate limits | Up to 5 retries during streaming |
| Context too long | Graceful error message |

### System Prompt

The full system prompt (~3000 characters) included:

- Identity: "You are operating as and within the Codex CLI"
- Capabilities: receive prompts, stream responses, emit function calls, apply patches, run commands
- Coding guidelines: fix root cause, avoid complexity, minimal changes, consistent style
- `apply_patch` usage instructions
- Dynamic context: username (`os.userInfo().username`), working directory, `rg` availability

## Approval System (`approvals.ts`)

### Approval Policies

```typescript
type ApprovalPolicy = "suggest" | "auto-edit" | "full-auto";
```

| Policy | File Edits | Shell Commands | Sandbox |
|--------|-----------|----------------|---------|
| `suggest` | Ask user | Ask user | Yes |
| `auto-edit` | Auto-approve (in writable roots) | Ask user | Yes |
| `full-auto` | Auto-approve | Auto-approve | Yes |

### Safety Assessment

`canAutoApprove()` returned a `SafetyAssessment`:

```typescript
type SafetyAssessment =
  | { type: "auto-approve"; runInSandbox: boolean; reason: string }
  | { type: "ask-user" }
  | { type: "reject"; reason: string };
```

### Known Safe Commands (`isSafeCommand()`)

Auto-approved without sandbox:

| Category | Commands |
|----------|----------|
| Navigation | `cd`, `ls`, `pwd`, `true`, `echo` |
| File viewing | `cat`, `nl`, `head`, `tail`, `wc` |
| Search | `rg` (except `--pre`, `--hostname-bin`), `grep`, `find` (except `-exec`, `-delete`), `which` |
| Git (read-only) | `git status`, `git branch`, `git log`, `git diff`, `git show` |
| Build (read-only) | `cargo check` |
| Sed (read-only) | `sed -n <range>p [file]` |

### Compound Expression Safety

`isEntireShellExpressionSafe()` validated that:
- Every command segment passed `isSafeCommand()`
- All operators were safe: `&&`, `||`, `|`, `;`
- No parentheses, braces, or redirections

### Review Decisions

```typescript
enum ReviewDecision {
  YES = "yes",           // Approve this execution
  NO_CONTINUE = "no",    // Deny but keep going
  NO_EXIT = "exit",      // Deny and stop
  ALWAYS = "always",     // Approve + remember for session
  EXPLAIN = "explain",   // Request command explanation
}
```

The **EXPLAIN** option called `oai.chat.completions.create()` with a dedicated system prompt to explain what a command does, then re-prompted the user.

## Configuration System (`config.ts`)

### File Locations

| Path | Purpose |
|------|---------|
| `~/.codex/config.json` | User config (also `.yaml`/`.yml`) |
| `~/.codex/instructions.md` | User-wide instructions |
| `~/.codex.env` | User-wide environment variables |
| `~/.codex/auth.json` | Authentication tokens |

### Supported Providers

```typescript
providers = {
  openai:     { baseURL: "api.openai.com/v1" },
  openrouter: { baseURL: "openrouter.ai/api/v1" },
  azure:      { baseURL: "YOUR_PROJECT_NAME.openai.azure.com/openai" },
  gemini:     { baseURL: "generativelanguage.googleapis.com/v1beta/openai" },
  ollama:     { baseURL: "localhost:11434/v1" },
  mistral:    { baseURL: "api.mistral.ai/v1" },
  deepseek:   { baseURL: "api.deepseek.com" },
  xai:        { baseURL: "api.x.ai/v1" },
  groq:       { baseURL: "api.groq.com/openai/v1" },
  arceeai:    { baseURL: "conductor.arcee.ai/v1" },
};
```

### Project Documentation Discovery

Searched for (in priority order): `AGENTS.md`, `codex.md`, `.codex.md`, `CODEX.md`

1. First checked CWD
2. Then walked up to git root
3. Max size: 32KB
4. Combined with user instructions via `\n\n--- project-doc ---\n\n` separator

## Command Execution (`handle-exec-command.ts`)

### Flow

1. Check `alwaysApprovedCommands` cache (session-level set of command keys)
2. Call `canAutoApprove()` to assess safety
3. Based on assessment:
   - **auto-approve**: Execute, optionally in sandbox
   - **ask-user**: Surface UI prompt via `getCommandConfirmation()`
   - **reject**: Return "aborted"
4. If sandbox execution fails in `full-auto` with `fullAutoErrorMode === ASK_USER`: re-prompt user

### Sandbox Routing (`exec.ts`)

```typescript
switch (sandbox) {
  case SandboxType.NONE:
    return rawExec(cmd, opts, config, abortSignal);
  case SandboxType.MACOS_SEATBELT:
    return execWithSeatbelt(cmd, opts, writableRoots, config, abortSignal);
  case SandboxType.LINUX_LANDLOCK:
    return execWithLandlock(cmd, opts, writableRoots, config, abortSignal);
}
```

### Process Spawning (`raw-exec.ts`)

Used `child_process.spawn()` with:
- `stdio: ["ignore", "pipe", "pipe"]` — Prevent stdin reads, capture stdout/stderr
- `detached: true` — Own process group for reliable kill propagation

**Abort sequence**: SIGTERM → 2000ms wait → SIGKILL (process group, then individual child as fallback).

**Output truncation**: Default 10KB / 256 lines, configurable via `config.tools.shell.maxBytes/maxLines`.

## TypeScript Seatbelt Profile

The macOS sandbox used a complete Seatbelt profile inspired by Chrome's sandbox:

```scheme
(version 1)
(deny default)                ; closed-by-default
(allow file-read*)            ; read-only file operations
(allow process-exec)          ; child processes inherit policy
(allow process-fork)
(allow signal (target self))
(allow file-write-data
  (require-all (path "/dev/null")
               (vnode-type CHARACTER-DEVICE)))
```

With dynamic writable roots:
```scheme
(allow file-write*
  (subpath (param "WRITABLE_ROOT_0"))
  (subpath (param "WRITABLE_ROOT_1"))
  ...)
```

Always-included writable roots: `process.cwd()`, `os.tmpdir()`, `$HOME/.pyenv`.

## TypeScript Apply-Patch Format

The same custom V4A diff format used in the Rust version, but with three-pass matching:

1. Exact match after Unicode canonicalization (NFC + punctuation equivalents)
2. Trailing whitespace ignored
3. All surrounding whitespace ignored

(The Rust version extended this to four passes, adding a full `trim()` pass.)

## Migration to Rust

### Timeline

- **Launch – August 2025**: TypeScript implementation
- **August 8, 2025** (commit `408c7ca`): TypeScript source removed
- **August 2025 onward**: `codex-cli` npm package became a thin wrapper invoking platform-specific Rust binaries
- **April 2026**: v0.118+ with 95+ Rust crates

### Key Changes

| Aspect | TypeScript | Rust |
|--------|-----------|------|
| UI | React/Ink | Ratatui |
| Config format | JSON/YAML | TOML |
| Approval modes | `suggest`/`auto-edit`/`full-auto` | `read-only`/`workspace-write`/`danger-full-access` |
| Sandbox (Linux) | Landlock binary | Bubblewrap + Landlock + seccomp |
| Sandbox (Windows) | Not supported | Restricted tokens + ACL overlay |
| Architecture | Single-process | Client-server (in-process or WebSocket) |
| Process model | Single `AgentLoop` class | 95+ crate workspace |
| Session persistence | Response ID chaining | SQLite + JSONL rollout |
| MCP support | None | Client + experimental server |
| Provider support | 10 hardcoded | Dynamic catalog |
| Output cap | 10KB / 256 lines | ~1 MiB / 10,000 deltas |
| Exec timeout | 10s | 10s (same) |

### What Stayed the Same

- Apache-2.0 license
- `@openai/codex` npm package name
- The custom V4A patch format (extended with a fourth matching pass)
- The core ReAct loop pattern (model → tool → observe → iterate)
- Sandbox-first security philosophy
- `AGENTS.md` project documentation convention

## Footnotes

[^1]: [Codex CLI Commit History](https://github.com/openai/codex/commits/main)
[^2]: [Codex TypeScript Source (archived)](https://github.com/openai/codex/tree/408c7ca~1/codex-cli/src)

## References

- [OpenAI Codex CLI GitHub](https://github.com/openai/codex)
- [Ink — React for Interactive CLIs](https://github.com/vadimdemedes/ink)
- [Ratatui — Rust TUI Framework](https://ratatui.rs/)
- [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses)
