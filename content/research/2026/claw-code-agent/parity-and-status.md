---
title: "Parity and Status"
weight: 5
---

## Parity Overview

Claw Code Agent is a ground-up Python reimplementation of Claude Code's npm-based agent architecture. The PARITY_CHECKLIST.md tracks implementation status across every feature surface. The project spans **~21,000 lines across 51 source files**, achieving strong core parity while significant gaps remain in interactive features and infrastructure.

## What's Fully Implemented

### Core Agent Runtime

| Feature | Status |
|---------|--------|
| One-shot agent loops | Complete |
| Iterative tool calling | Complete |
| Streaming output (token-by-token) | Complete |
| Local model execution (vLLM, Ollama, LiteLLM, OpenRouter) | Complete |
| Session persistence and resumption | Complete |
| Cost tracking and budget enforcement | Complete |
| File history journaling with snapshots | Complete |
| Nested agent delegation with topological batching | Complete |
| Context compaction (auto-snip and auto-compact) | Complete |
| Structured JSON schema output mode | Complete |
| Truncation continuation | Complete |

### CLI and Commands

| Feature | Status |
|---------|--------|
| Python CLI (`python3 -m src.main`) | Complete |
| `agent` / `agent-chat` / `agent-resume` commands | Complete |
| Background sessions (`agent-bg`, `agent-ps`, `agent-logs`, `agent-attach`, `agent-kill`) | Complete |
| Diagnostic commands (`summary`, `manifest`, `parity-audit`, `command-graph`) | Complete |
| 37 slash commands (of ~80+ upstream) | Complete |

### Prompt and Context

| Feature | Status |
|---------|--------|
| Structured system prompt builder (21 sections) | Complete |
| CLAUDE.md discovery (global, directory, rules) | Complete |
| Git state detection (branch, status, recent commits) | Complete |
| Tokenizer-aware context accounting | Complete |
| Environment snapshot (platform, shell, date) | Complete |

### Tools

| Feature | Status |
|---------|--------|
| 58 built-in tools implemented | Complete |
| File operations (read, write, edit, list, glob, grep) | Complete |
| Shell execution with full security validation | Complete |
| MCP resource access and tool invocation | Complete |
| Account, config, search, remote management | Complete |
| Task/plan/team/workflow/worktree management | Complete |
| Nested agent delegation | Complete |

### Security

| Feature | Status |
|---------|--------|
| Bash security (18 validators, 163 tests) | Complete |
| Permission tiers (read/write/shell/unsafe) | Complete |
| Hook policy manifests | Complete |
| Tool blocking (exact and prefix match) | Complete |
| Destructive command detection (20+ patterns) | Complete |

## What's Partially Implemented

### CLI Modes (Partial)

Working: local background sessions, daemon wrapper, agent-chat interactive mode.

Missing: remote-control/bridge runtime mode (30+ files in npm), browser/native-host runtime, computer-use MCP mode, template jobs, environment runners.

### Slash Commands (Partial)

**Implemented (37 commands):** `/help`, `/context`, `/prompt`, `/permissions`, `/model`, `/tools`, `/memory`, `/status`, `/clear`, `/config`, `/account`, `/search`, `/mcp`, `/remote`, `/tasks`, `/plan`, `/hooks`, and others.

**Missing (43+ commands):** `/add-dir`, `/bridge`, `/chrome`, `/desktop`, `/ide`, `/install-github-app`, `/keybindings`, `/plugin`, `/release-notes`, `/sandbox-toggle`, `/theme`, `/upgrade`, `/voice`, `/vim`, plus feature-gated and internal variants.

### Tools (Partial)

Core tools have full fidelity. Gaps exist in:

| Missing Tool | Purpose |
|-------------|---------|
| `AgentTool` (full) | Sub-agent spawning with built-in agent types |
| `SkillTool` | Skill loading and execution |
| `LSPTool` | Language Server Protocol diagnostics |
| `PowerShellTool` | PowerShell with security validators |
| `REPLTool` | Interactive REPL execution |
| `MCPTool` (full) | Complete MCP execution beyond stdio |

## What's Not Implemented

### Remote and Team Infrastructure

The npm Claude Code implementation includes a bridge subsystem (30+ files) for real remote session management with WebSocket infrastructure, shared remote state, and upstream proxy. None of this is implemented — the Python version has local remote profile management only.

### Interactive UI / REPL

The npm implementation includes an Ink/TUI framework with 40+ files, 100+ React-style components, a screen system, virtual scrolling, approval UI flows, keyboard interaction, and rich incremental rendering. The Python version provides functional CLI execution but no interactive TUI parity.

### MCP / Plugin / Skill Services

Local MCP resource access works over stdio. Missing: full MCP service (25+ files covering auth, permissions, config, registry, OAuth), plugin discovery/loading/installation, bundled skill support, and plugin lifecycle management.

### Services Layer

The npm implementation includes extensive backend services not present in Python:

| Service | Purpose |
|---------|---------|
| Analytics | Usage tracking and telemetry |
| LSP | Language Server Protocol integration |
| Auto-dream | Background task generation |
| Agent summary | Conversation summarization |
| Magic docs | Documentation generation |
| Session memory | Cross-session knowledge persistence |
| Prompt suggestion | Contextual prompt recommendations |
| Memory extraction | Automatic insight extraction |
| OAuth | Authentication flow management |
| Rate limiting | API throttling |
| Settings sync | Cross-device configuration |

### Platform Integration

| Feature | Status |
|---------|--------|
| Voice mode | Not implemented |
| VIM mode | Not implemented |
| Keybinding system (13 files) | Not implemented |
| IDE integration (VS Code, JetBrains) | Not implemented |
| Notification hooks | Not implemented |
| Chrome extension | Not implemented |

### Enterprise Features

| Feature | Status |
|---------|--------|
| Coordinator mode | Not implemented |
| Buddy/companion system (6 files) | Not implemented |
| Migration system (11 scripts) | Not implemented |
| Growthbook feature flags | Not implemented |
| Internal logging infrastructure | Not implemented |

## Development Roadmap

The PARITY_CHECKLIST.md defines a tiered priority system:

### Tier 1 — High Priority

- LSP tool integration for code intelligence
- Full `AgentTool` with built-in agent types (Explore, Plan, etc.)
- Auto-compact and context collapse improvements
- Interactive REPL enhancements

### Tier 2 — Medium Priority

- `SkillTool` implementation
- Full MCP service beyond stdio transport
- Plugin discovery, loading, and installation
- Real remote session management
- Implementation of remaining 43+ slash commands

### Tier 3 — Nice to Have

- TUI components and interactive rendering
- Voice and VIM modes
- IDE integrations (VS Code, JetBrains)

### Tier 4 — Enterprise / Platform

- Bridge subsystem for remote sessions
- OAuth and rate limiting services
- Auto-dream and consolidation tasks
- Analytics and telemetry

## Architecture Comparison

| Dimension | Claude Code (npm) | Claw Code Agent (Python) |
|-----------|-------------------|--------------------------|
| **Language** | TypeScript/Node.js | Python 3.10+ |
| **Dependencies** | npm ecosystem | Zero (stdlib only) |
| **Model backend** | Anthropic API only | Any OpenAI-compatible endpoint |
| **UI framework** | Ink (React for CLI) | Plain stdout/stdin |
| **Codebase size** | ~100K+ lines | ~21K lines |
| **Tools** | 80+ | 60+ |
| **Slash commands** | 80+ | 37 |
| **Source files** | Hundreds | 51 |
| **MCP transport** | stdio, SSE, WebSocket | stdio only |
| **Plugin system** | Full lifecycle management | Manifest-based hooks and aliases |
| **Remote sessions** | WebSocket bridge (30+ files) | Local profile management |
| **TUI** | Ink components (100+) | None |
| **Platform** | macOS, Linux, Windows | macOS, Linux |

## Key Design Differences

1. **Zero dependencies** — Where Claude Code relies on hundreds of npm packages, Claw Code Agent uses only Python's standard library. This is a deliberate architectural choice for portability, auditability, and simplicity.

2. **Backend agnosticism** — The OpenAI-compatible client abstracts away model-specific details. Switching from vLLM to Ollama requires only changing three environment variables.

3. **Immutable state patterns** — The `AgentManager` uses frozen dataclasses and reconstruction-based updates rather than mutation, providing stronger auditability guarantees.

4. **Reactive context management** — Rather than proactively managing context, the agent reacts to prompt-length errors with snipping and compaction, then retries.

5. **Functional CLI** — No attempt to replicate the Ink-based TUI. The focus is on correctness of the agent loop rather than interactive aesthetics.

## References

- [Claw Code Agent — PARITY_CHECKLIST.md](https://github.com/HarnessLab/claw-code-agent/blob/main/PARITY_CHECKLIST.md)
- [Claw Code Agent — TESTING_GUIDE.md](https://github.com/HarnessLab/claw-code-agent/blob/main/TESTING_GUIDE.md)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Claude Code GitHub](https://github.com/anthropics/claude-code)
