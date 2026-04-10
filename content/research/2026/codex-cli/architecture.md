---
title: "Architecture"
weight: 1
---

## Crate Workspace

The Codex CLI is organized as a Cargo workspace[^1] with 95+ crates, built with Rust 2024 edition and Bazel as the build system. The workspace uses aggressive release optimizations: fat LTO, symbol stripping, and single codegen unit for minimal binary size.

### Core Crates

| Crate | Role |
|-------|------|
| `codex-core` | Business logic: session management, model calls, tool execution, config |
| `codex-tui` | Fullscreen terminal UI built on Ratatui |
| `codex-exec` | Headless execution mode for CI/CD and scripting |
| `codex-cli` | Multitool entry point providing subcommands |
| `codex-protocol` | Wire types: messages, events, approvals, permissions |

### Sandbox & Security Crates

| Crate | Role |
|-------|------|
| `sandboxing` | Platform-abstracted sandbox manager (Seatbelt, Bubblewrap, Landlock) |
| `execpolicy` | Rule-based command approval engine |
| `linux-sandbox` | Linux-specific two-layer sandbox (seccomp + Bubblewrap) |
| `keyring-store` | OS keyring integration for credential storage |

### Integration Crates

| Crate | Role |
|-------|------|
| `codex-mcp` | MCP client and experimental MCP server |
| `lmstudio` | LM Studio provider integration |
| `ollama` | Ollama local model provider |
| `models-manager` | Model selection, capabilities, and routing |
| `codex-api` | OpenAI API client layer |

### Utility Crates (30+)

Dedicated crates under `utils/` for PTY management, caching, image processing, fuzzy matching, path utilities, and more. The project enforces a strong convention: modules should stay under 500 lines, with functionality extracted to new crates rather than growing existing ones[^2].

## Client–Server Model

Codex uses an internal client–server architecture where `codex-core` acts as an in-process "app server":

```
┌─────────────────────────────────┐
│         Presentation Layer       │
│  ┌──────────┐  ┌──────────────┐ │
│  │ codex-tui│  │  codex-exec  │ │
│  │ (Ratatui)│  │  (headless)  │ │
│  └────┬─────┘  └──────┬───────┘ │
│       │               │         │
│       ▼               ▼         │
│  ┌──────────────────────────┐   │
│  │  InProcessAppServerClient │   │
│  │  (async channels)         │   │
│  └────────────┬─────────────┘   │
│               │                 │
│               ▼                 │
│  ┌──────────────────────────┐   │
│  │       codex-core          │   │
│  │  ┌────────────────────┐  │   │
│  │  │  Session / Thread   │  │   │
│  │  │  Turn orchestration │  │   │
│  │  │  Model API calls    │  │   │
│  │  │  Tool execution     │  │   │
│  │  │  MCP management     │  │   │
│  │  └────────────────────┘  │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

Communication uses typed async channels with `ClientRequest` and `ServerNotification` messages. The protocol supports remote operation too — the TUI can connect to an app server over WebSocket (`ws://` for loopback, `wss://` for remote), enabling web-based and remote-control deployment modes.

### Request Types

| Request | Direction | Purpose |
|---------|-----------|---------|
| `ThreadStart` | Client → Server | Begin a new conversation thread |
| `TurnStart` | Client → Server | Submit user message, start agent turn |
| `ReviewStart` | Client → Server | Initiate code review mode |
| `ApprovalResponse` | Client → Server | User approves/denies a tool call |
| `ServerNotification` | Server → Client | Stream events (items, status, errors) |

## Session Lifecycle

### Initialization

Session startup orchestrates multiple async operations in parallel to minimize latency:

1. **Rollout recording** — Analytics and experiment tracking
2. **Shell discovery** — Detect user's shell environment
3. **MCP server connections** — Connect to configured MCP tool servers
4. **History metadata** — Load prior session state from SQLite
5. **Config loading** — Merge config from files, environment, and CLI args

### Dynamic Configuration

Sessions support live reconfiguration through `SessionSettingsUpdate` without restart:

- Model switching (e.g., from GPT-4.1 to o4-mini mid-conversation)
- Sandbox policy changes
- Working directory transitions
- Execution policy amendments

### State Management

Session state is managed through `Arc<Mutex<T>>` and `Arc<RwLock<T>>` for thread-safe access across async tasks. Weak references prevent memory leaks in circular dependencies between the session, MCP clients, and network proxies.

## Turn Orchestration

A "turn" represents one cycle of agent reasoning and action:

```
User message
    │
    ▼
┌────────────────┐
│  TurnContext    │
│  - model info   │
│  - reasoning    │
│  - sandbox      │
│  - tools        │
│  - metadata     │
└───────┬────────┘
        │
        ▼
┌────────────────┐     ┌───────────────┐
│  Model API Call │────▶│  Tool Calls   │
│  (streaming)    │     │  - shell exec │
│                 │◀────│  - file edit  │
│  Observe result │     │  - MCP tools  │
└───────┬────────┘     └───────────────┘
        │
        ▼
  Continue / Complete
```

Each turn carries embedded context:
- **Model information** and reasoning parameters (temperature, max tokens)
- **Sandbox and approval policies** in effect
- **Tool configurations** available for this turn
- **Tracing metadata** with W3C trace context propagation for distributed observability

### ReadinessFlag

A `ReadinessFlag` gates tool execution during initialization. Tools cannot run until all startup tasks (MCP connections, config loading, etc.) complete. This prevents race conditions where the agent might try to execute commands before the sandbox is configured.

## Model Management

The `models-manager` crate[^3] handles model discovery, configuration, and routing.

### ModelsManager

The `ModelsManager` coordinates remote model discovery with caching:

| Strategy | Behavior |
|----------|----------|
| `Online` | Fetch latest model catalog from API |
| `Offline` | Use only cached/bundled data |
| `OnlineIfUncached` | Fetch only if no local cache exists |

**Catalog modes:**
- **Default** — Bundled model info merged with remote updates
- **Custom** — Caller-provided, immutable catalog (for testing or embedded use)

Model resolution uses **longest-prefix matching** for namespaced identifiers (e.g., `namespace/model-name`), with ETag and TTL-based cache management.

### Model Info and Overrides

The `model_info_from_slug()` function creates fallback configurations for unknown models:

| Default | Value |
|---------|-------|
| Context window | 272,000 tokens |
| Truncation | 10,000 bytes |
| Effective utilization | 95% of context |
| Web search | Text-based |
| Parallel tool calls | Disabled |

`with_config_overrides()` applies user settings: reasoning summaries, context windows, token limits, and personality. The system supports personality variants (e.g., "friendly" vs "pragmatic" for specific model slugs).

### Dynamic Catalog

Hardcoded model presets have been **removed** in favor of dynamically derived listings from an active catalog. Only legacy migration config keys remain for upgrade prompts between model generations.

## Observability

The system uses multi-layer tracing:

| Layer | Purpose |
|-------|---------|
| File logging | Persistent session logs |
| Feedback layer | User-visible progress updates |
| Metadata layer | Structured event attributes |
| OpenTelemetry | Distributed tracing with span-based context |
| Analytics | Event tracking and experiment metrics |

Session events are logged to both JSONL rollout files and a SQLite database for metadata queries.

## Footnotes

[^1]: [Codex Cargo.toml](https://github.com/openai/codex/blob/main/codex-rs/Cargo.toml)
[^2]: [Codex AGENTS.md — Crate Conventions](https://github.com/openai/codex/blob/main/AGENTS.md)
[^3]: [Codex models-manager Crate](https://github.com/openai/codex/tree/main/codex-rs/models-manager)

## References

- [OpenAI Codex CLI GitHub](https://github.com/openai/codex)
- [Codex AGENTS.md](https://github.com/openai/codex/blob/main/AGENTS.md)
- [Ratatui Documentation](https://ratatui.rs/)
- [Tokio Async Runtime](https://tokio.rs/)
