---
title: "Terminal UI & Exec Mode"
weight: 5
---

## Overview

Codex provides two presentation modes that consume events from the core engine: a fullscreen terminal UI (`codex-tui`) built on Ratatui[^1] for interactive use, and a headless execution mode (`codex-exec`) for CI/CD pipelines and scripting. Both communicate with `codex-core` through the same `InProcessAppServerClient` protocol, ensuring identical agent behavior regardless of presentation layer.

## Terminal UI (codex-tui)

### Technology Stack

The TUI is built with Ratatui, a Rust library for terminal user interfaces. Key design decisions from the AGENTS.md coding standards[^2]:

| Concern | Approach |
|---------|----------|
| Styling | Ratatui's `Stylize` trait (`.red()`, `.dim()`, `.bold()`) |
| Text wrapping | `textwrap` for plain strings, custom `tui/src/wrapping.rs` for `Lines` |
| Colors | Never hardcode white — use default foreground for theme compatibility |
| Spans | Use `.into()` for basic spans; avoid manual `Style` construction |

### Application Lifecycle

The `run_ratatui_app()` function orchestrates the full TUI lifecycle:

```
CLI args parsed
       │
       ▼
┌──────────────┐
│ Config load   │──▶ Exit on error
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Auth check    │
│ - Login flow  │
│ - Trust screen│
│ - Onboarding  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Session select│
│ - New / Resume│
│ - Fork        │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ App server    │
│ - Embedded    │
│ - Remote WS   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ TUI main loop │
│ - Render      │
│ - Input       │
│ - Events      │
└──────────────┘
```

### Terminal Management

**Alternate screen mode** — The TUI uses the terminal's alternate screen buffer by default, preserving the user's scrollback history. A special case detects the Zellij terminal multiplexer and disables alternate screen mode for compatibility.

**TerminalRestoreGuard** — A RAII guard ensures the terminal is properly restored on exit or panic:

```rust
struct TerminalRestoreGuard { active: bool }
// Drop implementation restores terminal state
```

### Authentication & Onboarding

The TUI manages a multi-step onboarding flow:

1. **Trust screen** — `should_show_trust_screen()` checks if the user has accepted terms
2. **Login screen** — `should_show_login_screen()` checks authentication status
3. **Onboarding** — First-run configuration and provider selection
4. **Config reload** — Configuration refreshed after auth/trust decisions

Authentication supports ChatGPT account login and API key authentication, with the `LoginStatus` enum tracking state:

```
LoginStatus {
    AuthMode(AppServerAuthMode),
    NotAuthenticated,
}
```

### Session Management

Sessions can be:
- **New** — Start a fresh conversation
- **Resumed** — Continue a previous session with full history
- **Forked** — Branch from a previous session's state

Session metadata is stored in SQLite, with functions like `read_session_cwd()`, `read_session_model()`, and `read_latest_turn_context()` for session lookup.

### App Server Connection

The TUI supports two connection modes:

| Mode | Implementation | Use Case |
|------|---------------|----------|
| **Embedded** | `start_embedded_app_server()` | Default local execution |
| **Remote** | `connect_remote_app_server()` | WebSocket to remote server |

Remote connections use `wss://` for security, with `ws://` only allowed for loopback addresses. The `normalize_remote_addr()` and `validate_remote_auth_token_transport()` functions enforce these constraints.

### Syntax Highlighting

Theme configuration for code highlighting is applied from the final configuration (post-onboarding), ensuring user preferences are respected.

### ChatWidget

The central `ChatWidget` manages the conversation display:

- **Dual-layer transcript** — Committed cells (finalized turns) + in-flight active cell (streaming tokens)
- **Two independent stream controllers** for assistant output and plan content
- **Adaptive chunking** for rendering performance with large outputs
- **Multi-agent collaboration** support with agent-specific display
- **Rate-limit warning escalation** at 75%, 90%, and 95% thresholds
- **Message composition** with local/remote image attachments, mentions, and byte-range tracking

### Chat Composer

The text input is a state machine (`chat_composer.rs`) with:

| Feature | Implementation |
|---------|---------------|
| **Slash commands** | Popup menu with fuzzy matching |
| **File search** | Inline file picker popup |
| **Skill mentions** | `@skill` references |
| **Cross-session history** | Input history persists between sessions |
| **Paste handling** | Bracketed paste, burst detection, large paste (>1000 chars) as placeholders |
| **Character limits** | Validation with visual feedback |
| **Remote images** | `[Image #N]` placeholder rows |

### Exec Cell Rendering

Command execution results are displayed with structured rendering:

- **Exploring mode** — Parsed command breakdown with syntax highlighting
- **Command mode** — Full output with truncation
- `truncate_lines_middle()` — Measures actual viewport rows via `Paragraph::line_count` to handle wrapped URLs
- Visual prefixes: `|` for continuation, `\` for output boundaries
- Layout allocation: 2 lines for commands, 5 lines for output

## Headless Exec Mode (codex-exec)

### Purpose

`codex exec` enables programmatic, non-interactive usage[^3]:

```bash
# Simple execution
codex exec "fix the type error in auth.ts"

# Piped input
echo "refactor this function" | codex exec -

# With specific model
codex exec --model o4-mini "add error handling"

# Ephemeral (no session persistence)
codex exec --ephemeral "run the tests"
```

### Event Processors

Two output modes are available:

**Human-readable** (`EventProcessorWithHumanOutput`)
- Renders tool calls, model responses, and status updates in terminal-friendly format
- Default when stdout is a TTY

**JSONL streaming** (`EventProcessorWithJsonOutput`)
- One JSON event per line on stdout
- Machine-parseable for pipeline integration

The `EventProcessor` trait defines the interface:

```rust
trait EventProcessor {
    fn handle_notification(&mut self, notification: ServerNotification);
    fn handle_request(&mut self, request: ServerRequest) -> Response;
}
```

### Event Types

The exec mode streams a rich set of lifecycle events:

| Event | Description |
|-------|-------------|
| `ThreadEvent` | Thread-level state changes |
| `TurnStartedEvent` | Agent begins a reasoning turn |
| `TurnCompletedEvent` | Agent completes a turn |
| `ItemStartedEvent` | Tool call or message begins |
| `ItemUpdatedEvent` | Streaming updates (tokens, output) |
| `ItemCompletedEvent` | Tool call or message finishes |

### Item Types

Each completed item carries typed content:

| Item Type | Content |
|-----------|---------|
| `CommandExecutionItem` | Shell command + output + exit code |
| `FileChangeItem` | File path + diff |
| `AgentMessageItem` | Model's text response |
| `McpToolCallItem` | MCP tool name + args + result |
| `CollabToolCallItem` | Collaborative agent tool call |
| `ReasoningItem` | Model's chain-of-thought |
| `TodoItem` | Task tracking update |
| `WebSearchItem` | Web search query + results |
| `ErrorItem` | Error description |

### Stdin Processing

Three modes for handling piped input:

| Mode | Behavior |
|------|----------|
| `RequiredIfPiped` | Legacy — read stdin if piped |
| `Forced` | Explicit `-` sentinel enables stdin |
| `OptionalAppend` | Piped input appended to positional args |

### Output Discipline

A critical design constraint: "In the default output mode, it is paramount that the only thing written to stdout is the final message (if any)." All other output goes to stderr, ensuring clean pipe composition.

### Approval Behavior

In exec mode, approval defaults to `AskForApproval::Never`:
- Approval requests → auto-rejected
- User input requests → auto-rejected  
- MCP elicitation → auto-rejected
- Failed approvals → non-zero exit code

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 64 | Command timeout (synthetic) |
| Non-zero | Fatal error, permission denial, or turn failure |

## Shared Infrastructure

### Configuration Loading

Both TUI and exec modes use the same configuration pipeline:

1. **Config files** — `config.toml` in standard locations
2. **Environment variables** — Override config file values
3. **CLI arguments** — Highest precedence
4. **Fallback** — Sensible defaults

`load_config_or_exit()` and `load_config_or_exit_with_fallback_cwd()` handle config loading with graceful error reporting.

### Logging & Telemetry

Multi-layer tracing setup shared across presentation modes:

| Layer | Purpose |
|-------|---------|
| File writer | Non-blocking file logging |
| Feedback layer | User-visible progress |
| Metadata layer | Structured attributes |
| OpenTelemetry | Distributed tracing |
| Session log | Per-session event recording |

File permissions are hardened to `0o600` on Unix systems for security.

## Footnotes

[^1]: [Ratatui — Terminal UI Framework](https://ratatui.rs/)
[^2]: [Codex AGENTS.md — TUI Styling](https://github.com/openai/codex/blob/main/AGENTS.md)
[^3]: [Codex exec Crate](https://github.com/openai/codex/tree/main/codex-rs/exec)

## References

- [OpenAI Codex CLI GitHub](https://github.com/openai/codex)
- [Ratatui Documentation](https://ratatui.rs/)
- [Codex Developer Documentation](https://developers.openai.com/codex)
