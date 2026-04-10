---
title: "Agent Loop"
weight: 2
---

## Overview

The Codex agent loop is the core reasoning cycle that drives autonomous task completion. Implemented in `codex-core`, it manages the conversation between the user, the language model, and the tool execution environment. The loop follows a standard ReAct (Reasoning + Acting) pattern: the model receives context, decides on tool calls, observes results, and iterates until the task is complete or the user intervenes.

## Conversation Model

### Message Types

The protocol defines a rich message taxonomy:

| Message Type | Source | Content |
|-------------|--------|---------|
| User message | Human | Natural language instructions, file contents |
| Assistant message | Model | Reasoning text, tool call requests |
| Tool result | System | Command output, file contents, patch results |
| System message | Framework | Instructions, context, permissions |

### Conversation State

Conversation history is maintained as an ordered sequence of messages with metadata:

- **Thread ID** — Unique identifier for the conversation thread
- **Message history** — Full sequence of messages with role attribution
- **Turn boundaries** — Markers separating user-initiated turns
- **Token tracking** — Running count for context window management

The state persists across turns within a session and can be serialized to SQLite for session resume/fork operations.

## Model Interaction

### API Integration

Codex connects to model providers through the `codex-api` crate, which wraps the OpenAI Responses API (and compatible endpoints). The system supports multiple providers:

| Provider | Configuration | Models |
|----------|--------------|--------|
| OpenAI | API key or ChatGPT auth | GPT-4.1, o4-mini, o3, etc. |
| Ollama | Local server URL | Any Ollama-hosted model |
| LM Studio | Local server URL | Any LM Studio model |

### Streaming Responses

Model responses stream token-by-token through async channels. The streaming pipeline:

1. **HTTP SSE stream** — Server-sent events from the model API
2. **Token aggregation** — Tokens assembled into coherent text and tool calls
3. **Event emission** — `ItemStartedEvent`, `ItemUpdatedEvent`, `ItemCompletedEvent` notifications
4. **UI rendering** — TUI or exec processor consumes events for display

### Reasoning Support

For reasoning models (o3, o4-mini), the agent loop handles:

- **Reasoning tokens** — Internal chain-of-thought that counts against context but isn't shown by default
- **Reasoning effort** — Configurable via `reasoning.effort` parameter (low/medium/high)
- **Reasoning summaries** — Exposed through `ReasoningItem` events for observability

## Tool System

### Built-in Tools

The agent can invoke several categories of tools:

**Shell Execution**
- Execute arbitrary shell commands in the user's environment
- Commands run through the sandbox layer with approval gating
- Output captured via piped stdout/stderr with configurable byte caps

**File Operations**
- Read files from the workspace
- Apply patches using a structured diff format
- Create new files

**MCP Tools**
- Call tools exposed by connected MCP servers
- Dynamic tool discovery at session start
- Collaborative tool calls between agents

**Planning**
- `plan_tool` for structured task decomposition
- Todo/task tracking

### Tool Dispatch Flow

```
Model response parsed
        │
        ▼
┌───────────────────┐
│  Tool call request │
│  (function_name,   │
│   arguments)       │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐    ┌──────────────────┐
│ Execution Policy  │───▶│ Auto-approved?   │
│ Check             │    │ Yes → Execute    │
└────────┬──────────┘    │ No → Next check  │
         │               └──────────────────┘
         ▼
┌───────────────────┐    ┌──────────────────┐
│ Guardian          │───▶│ Risk assessment  │
│ Assessment        │    │ Low → Execute    │
└────────┬──────────┘    │ High → Approval  │
         │               └──────────────────┘
         ▼
┌───────────────────┐    ┌──────────────────┐
│ User Approval     │───▶│ Approve / Deny   │
│ Request           │    │ + Amend policy   │
└───────────────────┘    └──────────────────┘
```

### Command Execution Details

The `exec.rs` module (~800 lines) manages command spawning with these key constants:

```
DEFAULT_EXEC_COMMAND_TIMEOUT_MS  = 10,000   (10 seconds)
READ_CHUNK_SIZE                  = 8,192    (8 KB)
EXEC_OUTPUT_MAX_BYTES            = ~1 MiB
MAX_EXEC_OUTPUT_DELTAS_PER_CALL  = 10,000
IO_DRAIN_TIMEOUT_MS              = 2,000    (2 seconds)
```

Commands are spawned via `spawn_child_async()` using the `ExecParams` struct:

| Field | Description |
|-------|-------------|
| `command` | Program + arguments vector |
| `cwd` | Absolute working directory path |
| `expiration` | Timeout, DefaultTimeout, or CancellationToken |
| `capture_policy` | ShellTool (capped) or FullBuffer (uncapped) |
| `env` | Environment variable overrides |
| `network` | Optional network proxy configuration |
| `sandbox_permissions` | Filesystem/network sandbox policies |
| `arg0` | Optional argv[0] override (for sandbox wrappers) |

**Execution flow:**

1. `process_exec_tool_call()` — Entry point, builds `ExecRequest`
2. `build_exec_request()` — Selects sandbox type, transforms command through `SandboxManager`
3. `exec()` — Spawns child process, calls `consume_output()`
4. `consume_output()` — Reads stdout/stderr in parallel via `tokio::spawn`, races against expiration
5. `finalize_exec_result()` — Detects sandbox denials, handles timeout exit codes

**Output capture** reads in 8KB chunks with byte caps:
- **ShellTool policy**: ~1 MiB output cap, timeout-based expiration
- **FullBuffer policy**: Complete output, no caps or forced expiration

**Timeout management** uses three expiration mechanisms:
- Fixed timeout (default: 10 seconds for shell tool)
- External cancellation token (user interrupt)
- Default fallback (10,000ms)

On timeout, the entire process group is killed with a synthetic exit code 192 (128+64) and `timed_out: true` flag.

**Output aggregation** splits capacity between stdout (1/3) and stderr (2/3), with unused capacity rebalanced across streams.

**Sandbox denial detection** (`is_likely_sandbox_denied()`) checks for:
- Keywords: "operation not permitted", "permission denied", "read-only file system", "seccomp", "sandbox", "landlock"
- Quick-rejects exit codes 2, 126, 127
- On Linux: checks for SIGSYS (seccomp violation)

### Unified Exec (Interactive Process Manager)

Beyond single-shot command execution, the `UnifiedExecProcessManager` manages **concurrent interactive processes** with PTY-based spawning:

| Constant | Value |
|----------|-------|
| Max processes | 64 (warning at 60) |
| Output cap | ~1 MiB (~2,500 tokens) |
| Yield time | 250ms to 30s |
| LRU protection | 8 most recent processes |

Each `UnifiedExecProcess` wraps either a local PTY session or a remote exec-server process. Features include:

- **HeadTailBuffer** — Splits buffer capacity 50/50 between head (prefix) and tail (suffix). When capacity is exceeded, bytes are dropped from the middle, preserving both the beginning and end of output.
- **Broadcast channels** for streaming output to multiple consumers
- **150ms grace period** for early exit detection before declaring a process started
- **LRU-based pruning** — When nearing the 64-process limit, oldest processes are killed (protecting the 8 most recent)
- **Deterministic process IDs** for testing

### Output Encoding

The `exec_output` module handles smart encoding detection:

1. Try UTF-8 first
2. Fall back to `chardetng` for legacy Windows code pages (CP1251, CP866, Windows-1252)
3. Handle IBM866/Windows-1252 collision by preferring Windows-1252 when bytes match smart-punctuation patterns

Output is structured as `ExecToolCallOutput`:

```
ExecToolCallOutput {
    exit_code: i32,
    stdout: StreamOutput<String>,    // with truncated_after_lines
    stderr: StreamOutput<String>,
    aggregated_output: StreamOutput<String>,
    duration: Duration,
    timed_out: bool,
}
```

## Patch Application

File modifications use a **custom, simplified diff format** (not standard unified diff) implemented in the `apply-patch` crate[^3]. The format is designed for LLM generation reliability.

### Patch Grammar

```
start:      begin_patch hunk+ end_patch
begin_patch: "*** Begin Patch" LF
end_patch:   "*** End Patch" LF?
hunk:        add_hunk | delete_hunk | update_hunk

add_hunk:    "*** Add File: " filename LF add_line+
delete_hunk: "*** Delete File: " filename LF
update_hunk: "*** Update File: " filename LF change_move? change?

change_move: "*** Move to: " filename LF
change:      (change_context | change_line)+ eof_line?
change_context: ("@@" | "@@ " /(.+)/) LF
change_line:    ("+" | "-" | " ") /(.+)/ LF
eof_line:       "*** End of File" LF
```

### Hunk Types

| Marker | Operation | Data |
|--------|-----------|------|
| `*** Add File: <path>` | Create new file | Lines to write |
| `*** Delete File: <path>` | Remove file | None |
| `*** Update File: <path>` | Modify existing file | Context + changes |
| `*** Move to: <path>` | Rename/move file | Combined with update |

### Application Pipeline

1. `parse_patch()` — Parses text into `Vec<Hunk>` using the grammar above
2. `apply_hunks_to_files()` — Iterates hunks, applies each to the filesystem
3. For `UpdateFile` hunks: `derive_new_contents_from_chunks()` reads the original, calls `compute_replacements()` to locate old lines, then `apply_replacements()` in reverse order
4. `ApplyPatchApprovalRequestEvent` gates the operation through the approval pipeline
5. Session-level write grants can pre-approve directories

### Four-Pass Context Matching

The `seek_sequence` module finds context lines within files using progressively looser matching:

| Pass | Strategy | Example |
|------|----------|---------|
| 1 | **Exact match** | Direct string equality |
| 2 | **Right-trim** | `trim_end()` on both sides |
| 3 | **Full trim** | `trim()` on both sides |
| 4 | **Unicode normalization** | Smart quotes → ASCII quotes, em dashes → hyphens, NBSP → space |

When `eof=true`, search starts from the end of file. This graduated approach handles the common case where LLMs introduce minor whitespace or Unicode variations in context lines.

### Lenient Mode

`PARSE_IN_STRICT_MODE = false` by default. Lenient mode strips heredoc wrappers (`<<EOF` / `<<'EOF'` / `<<"EOF"`) because GPT-4.1 sometimes generates them in its `local_shell` tool call format. File references must use **relative paths only**.

## Multi-Turn Reasoning

The agent loop supports extended multi-turn reasoning:

```
Turn 1: User asks "fix the failing tests"
  → Model: reads test output, identifies failures
  → Tool: run test suite
  → Observation: 3 tests failing in auth module

Turn 2: (automatic continuation)
  → Model: reads auth module source
  → Tool: read file, grep for patterns
  → Observation: identifies root cause

Turn 3: (automatic continuation)
  → Model: generates fix
  → Tool: apply patch to 2 files
  → Observation: patch applied

Turn 4: (automatic continuation)
  → Model: verifies fix
  → Tool: run test suite again
  → Observation: all tests passing
  → Model: reports completion to user
```

Each turn emits lifecycle events: `TurnStartedEvent` → `ItemStartedEvent` (per tool call) → `ItemCompletedEvent` → `TurnCompletedEvent`.

## Context Management

### Token Budget

The agent tracks token usage across the conversation:

- **Input tokens** — User messages, system prompts, tool results
- **Output tokens** — Model responses, reasoning tokens
- **Context window** — Model-specific limit (e.g., 128K for GPT-4.1)

### History Truncation

When approaching context limits, the system can:
- Summarize earlier conversation turns
- Drop tool output from completed turns
- Preserve system instructions and recent context

### Skills and Plugins

The agent can load "skills" — domain-specific knowledge and tool configurations:

- Defined in `.codex/skills/` directories with `SKILL.md` files
- Loaded on demand to conserve context
- Can include reference documents, scripts, and agent configurations

## Interruption and Control

Users can interrupt the agent at any point:

- **Cancel current tool** — Stops the running command
- **Cancel current turn** — Aborts the model's current reasoning cycle
- **Provide input** — Inject additional context mid-turn
- **Request review** — Switch to code review mode

The `CodexStatus` enum tracks running state: `Running` or `InitiateShutdown`.

## Footnotes

[^1]: [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses)
[^2]: [ReAct Pattern](https://arxiv.org/abs/2210.03629)
[^3]: [Codex apply-patch Crate](https://github.com/openai/codex/tree/main/codex-rs/apply-patch)

## References

- [OpenAI Codex CLI GitHub](https://github.com/openai/codex)
- [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses)
- [Model Context Protocol](https://modelcontextprotocol.io/)
