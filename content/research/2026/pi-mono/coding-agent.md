---
title: "Coding Agent CLI (pi-coding-agent)"
weight: 3
---

## Overview

The `pi-coding-agent` package[^1] is the primary user-facing component of pi-mono — a full-featured coding agent CLI invoked as the `pi` command. It builds on `pi-agent-core` and `pi-ai` to provide session persistence, context compaction, built-in file/shell tools, an extension system, skills, and three execution modes (interactive TUI, print, and RPC). The core source directory alone contains 33 files spanning session management, tool implementations, model resolution, prompt construction, and an extension runtime.

## Execution Modes

The CLI entry point (`main.ts`) routes to one of three modes based on stdin availability and CLI flags:

| Mode | Entry | Use Case |
|------|-------|----------|
| **Interactive** | `interactive-mode.ts` | Full TUI experience with components, overlays, keybindings |
| **Print** | `print-mode.ts` | Text or JSON output for piped workflows |
| **RPC** | `rpc/` | JSON-RPC protocol for IDE integrations and programmatic control |

Mode selection logic: if stdin is a TTY and no `--rpc` flag, use interactive; if `--rpc`, use RPC; otherwise print mode.

## Built-in Tools

The `core/tools/` directory implements eight tools that the agent uses to interact with the filesystem and shell:

| Tool | File | Description |
|------|------|-------------|
| **bash** | `bash.ts` | Shell command execution with timeout, abort, and output buffering |
| **read** | `read.ts` | File reading with encoding detection |
| **write** | `write.ts` | File creation and overwriting |
| **edit** | `edit.ts` | Exact text replacement with conflict detection |
| **edit-diff** | `edit-diff.ts` | Differential editing operations |
| **find** | `find.ts` | File discovery and glob-based search |
| **grep** | `grep.ts` | Pattern matching across files |
| **ls** | `ls.ts` | Directory listing |

### Bash Tool

The bash tool executes commands via a pluggable `BashOperations` interface. Key features:

- **Output buffering** — A rolling buffer keeps recent output in memory up to `maxChunksBytes` (2x the default max). When output exceeds `DEFAULT_MAX_BYTES`, a temporary file stores the full output, and the final result is truncated to the last N lines.
- **Process isolation** — Commands spawn with `detached: true` and cleanup uses `killProcessTree()` to terminate all descendant processes.
- **Timeout support** — An optional timeout (in seconds) kills the entire process tree if exceeded.
- **Streaming updates** — Partial results are sent to the caller during execution for real-time feedback.

### Edit Tool

The edit tool uses **exact text matching with non-overlapping replacements**:

1. All edits are evaluated against the **original** file content (not incrementally), preventing cascading issues from sequential modifications
2. Each `oldText` must be unique in the file and must not overlap with other edits in the same call
3. Content is normalized to LF for processing, then restored to original line endings
4. BOM (Byte Order Mark) is stripped before matching and restored after
5. A unified diff is generated for result reporting

The `withFileMutationQueue()` wrapper serializes concurrent modifications to the same file, preventing race conditions when multiple tool calls target the same path.

## Session System

### Append-Only JSONL Trees

Sessions are persisted as **line-delimited JSON files** where each entry has an `id` and `parentId`, forming a tree structure:

```
{"type":"header","id":"h1","version":1,"timestamp":"...","cwd":"/project"}
{"type":"message","id":"m1","parentId":"h1","role":"user","content":"..."}
{"type":"message","id":"m2","parentId":"m1","role":"assistant","content":"..."}
{"type":"message","id":"m3","parentId":"m2","role":"user","content":"..."}
  ┌── branch A
  │ {"type":"message","id":"m4a","parentId":"m3","role":"assistant","content":"..."}
  └── branch B (after navigateTree to m3)
    {"type":"message","id":"m4b","parentId":"m3","role":"assistant","content":"..."}
```

### Entry Types

| Type | Purpose |
|------|---------|
| `SessionHeader` | Version, ID, timestamp, working directory, parent session reference |
| `message` | User, assistant, or tool result messages |
| `thinkingLevelChange` | Records thinking level transitions |
| `modelChange` | Records model switches |
| `compaction` | Summarized context replacing older messages |
| `branchSummary` | Summary of abandoned conversation branches |
| `label` | User-assigned labels for navigation |
| `custom` | Extension-defined data |

### Leaf Pointer Navigation

A **leaf pointer** tracks the current position in the tree. Appending creates a child of the leaf. **Branching** moves the leaf to an earlier entry, creating a new conversation path without modifying history. **Forking** creates a new session file in a different directory while preserving full history and tracking parent relationships.

### Lazy Persistence

Files only flush to disk after the first assistant response arrives, avoiding empty session files. In-memory mode bypasses file I/O entirely for ephemeral sessions.

## Context Compaction

When token usage exceeds configured thresholds, the compaction system summarizes older messages to free context space.

### Cut Point Detection

The algorithm walks backwards from the most recent message, accumulating estimated token counts. When it reaches the `keepRecentTokens` threshold, it identifies a valid cut point:

- **Valid cut points**: user messages, assistant messages, custom messages, bash execution entries
- **Invalid cut points**: tool results (must stay with their preceding tool calls)
- **Split-turn handling**: When a cut occurs mid-turn, two summaries are generated — one for the discarded history and another for the split turn's prefix — then merged

### Summary Generation

The LLM receives conversation text wrapped in XML tags and generates structured summaries:

```
Goals: [what the user is trying to accomplish]
Constraints: [requirements and limitations]
Progress: [what has been done so far]
Key Decisions: [important choices made]
Next Steps: [planned actions]
Critical Context: [essential information for continuation]
```

**Update mode**: If previous summaries exist, the system uses an update prompt that preserves existing information while incorporating new progress.

### File Operation Tracking

The compaction system extracts file read/write operations from tool calls and previous compaction entries, appending a formatted list to summaries. This ensures continuations understand which files were previously accessed.

### Trigger Modes

| Trigger | Behavior |
|---------|----------|
| **Overflow recovery** | LLM returns context overflow error → remove error, compact, auto-retry |
| **Threshold-based** | Token usage exceeds threshold → compact, user continues manually |
| **Manual** | User triggers via command, accepts custom instructions |

## Model Resolution

The `model-resolver.ts` module resolves model specifications through a priority-based fallback chain:

### Resolution Priority

1. CLI arguments (`--provider <name> --model <pattern>` or `--model <provider>/<pattern>`)
2. First scoped model (from `--models` flag, when not continuing a session)
3. Saved user defaults
4. First model with a valid API key from known providers
5. Any available model

### Pattern Matching

Model resolution supports multiple formats:

- **Exact match**: Direct model ID or `provider/modelId`
- **Partial match**: Case-insensitive substring matching against model IDs and names
- **Version preference**: Aliases (e.g., `claude-sonnet-4-5`) are preferred over dated versions (`claude-sonnet-4-5-20250929`)
- **Thinking level suffix**: `model:high` is parsed to separate model identifier from configuration

### Default Models Per Provider

The system maintains a `defaultModelPerProvider` map with provider-specific defaults across 20+ providers, including Claude, GPT, Gemini, and specialized variants.

## System Prompt Construction

The `buildSystemPrompt()` function dynamically assembles the system prompt:

1. **Header** — Identifies the assistant as "an expert coding assistant operating inside pi"
2. **Available tools** — Dynamically lists tools with one-line descriptions (only when tool snippets are provided)
3. **Guidelines** — Contextual recommendations (file exploration strategy, conciseness, file path clarity, custom guidelines)
4. **Documentation references** — Hardcoded paths to pi documentation for extensions, themes, skills, and SDK topics
5. **Project context** — Optional pre-loaded context files appended with their content
6. **Skills** — Formatted skill instructions in XML structure (only when the read tool is available)
7. **Metadata** — Current date (ISO format) and working directory

When a custom prompt is provided, the template is skipped and only context files, skills, and metadata are appended.

## Extension System

Extensions are loaded from user (`~/.pi/agent/`) or project (`./.pi/agent/`) directories through a three-module architecture:

| Module | Role |
|--------|------|
| `loader.ts` | Discovers and loads extension modules from configured paths |
| `runner.ts` | Manages extension lifecycle, event dispatch, and communication |
| `wrapper.ts` | Wraps extension instances with error isolation and type safety |

Extensions can:
- Register custom slash commands and tools
- Intercept input before processing
- Receive session lifecycle events (compaction, tree navigation)
- Override compaction and branch summarization results
- Provide custom resource paths (skills, prompts, themes)

## Skills System

Skills are markdown files with frontmatter discovered from multiple locations:

### Discovery Priority

1. **User skills**: `~/.pi/agent/skills/`
2. **Project skills**: `./.pi/agent/skills/`
3. **Explicit paths**: Custom directories/files via `skillPaths` option

### Discovery Algorithm

If a directory contains `SKILL.md`, treat it as a skill root and stop recursion. Otherwise, load direct `.md` children in the root and recurse into subdirectories.

### Skill Structure

```markdown
---
name: my-skill
description: "A brief description of what this skill does"
disable-model-invocation: false
---

Skill instructions here...
```

- Name validation: lowercase alphanumeric + hyphens, max 64 characters
- Description: max 1,024 characters
- `disable-model-invocation: true` excludes from system prompt (callable only via `/skill:name`)
- Duplicate names trigger collision diagnostics; first-loaded wins

Skills are formatted as `<available_skills>` XML with `<skill>` elements in the system prompt.

## Configuration

### Runtime Detection

The config system detects execution context:

| Check | Method |
|-------|--------|
| Bun binary | `import.meta.url` contains `$bunfs`, `~BUN`, or `%7EBUN` |
| Runtime type | `process.versions.bun` and `process.execPath` inspection |
| Package manager | Path analysis for `/pnpm/`, `/yarn/`, or `/npm/` patterns |

### User Config Paths (`~/.pi/agent/`)

| Path | Purpose |
|------|---------|
| `models.json` | LLM provider configuration |
| `auth.json` | API credentials |
| `settings.json` | User preferences |
| `themes/` | Custom theme files |
| `tools/` | Custom tool definitions |
| `bin/` | Managed binaries (fd, rg) |
| `prompts/` | Prompt templates |
| `sessions/` | Session storage |

All paths respect the `{APP_NAME}_CODING_AGENT_DIR` environment variable override.

## AgentSession

The `AgentSession` class is the central abstraction shared across all run modes. It encapsulates:

- **Agent state access** — Read-only properties for model, thinking level, messages, and tool management
- **Event subscription** — Listeners receive both core agent events and session-specific events (compaction, retry notifications)
- **Prompting** — Handles extension command interception, skill/template expansion, and message queuing during streaming
- **Auto-retry** — Retryable errors (overloaded, rate limits, 5xx) trigger exponential backoff; context overflow errors trigger compaction instead
- **Model management** — Direct selection, cycling through scoped models, and automatic thinking level clamping per model capabilities
- **Bash execution** — `executeBash()` with optional output streaming and `excludeFromContext` flag
- **Tree navigation** — `navigateTree()` switches to different session nodes with optional branch summarization

## Footnotes

[^1]: [pi-coding-agent package source](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent)

## References

- [Pi Mono GitHub Repository](https://github.com/badlogic/pi-mono)
- [Pi Mono AGENTS.md](https://github.com/badlogic/pi-mono/blob/main/AGENTS.md)
