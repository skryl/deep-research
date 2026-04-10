---
title: "Supporting Packages"
weight: 5
---

## Overview

Beyond the core stack (`pi-ai` -> `pi-agent-core` -> `pi-coding-agent`) and the terminal UI (`pi-tui`), the pi-mono monorepo includes three supporting packages that extend the coding agent into different deployment contexts: Slack integration, GPU infrastructure management, and web-based chat interfaces.

## pi-mom (Slack Bot)

The `pi-mom` package[^1] is a Slack bot that bridges Slack messaging to the pi coding agent. It runs as a standalone process using Slack's Socket Mode API for real-time message delivery without requiring a public HTTP endpoint.

### Architecture

```
Slack Workspace
    │
    ▼ (Socket Mode WebSocket)
┌──────────────┐
│   pi-mom     │
│  ┌────────┐  │
│  │ Slack  │  │
│  │ Socket │  │──── @slack/socket-mode
│  │ Mode   │  │──── @slack/web-api
│  └───┬────┘  │
│      │       │
│      ▼       │
│  ┌────────┐  │
│  │Coding  │  │
│  │Agent   │  │──── @mariozechner/pi-coding-agent
│  │Runtime │  │──── @mariozechner/pi-ai
│  └───┬────┘  │
│      │       │
│      ▼       │
│  ┌────────┐  │
│  │Sandbox │  │──── @anthropic-ai/sandbox
│  └────────┘  │
└──────────────┘
```

### Key Dependencies

| Dependency | Purpose |
|-----------|---------|
| `@slack/socket-mode` | WebSocket-based real-time Slack event handling |
| `@slack/web-api` | Slack API calls for posting messages, reactions, and file uploads |
| `@mariozechner/pi-coding-agent` | Core coding agent runtime |
| `@mariozechner/pi-ai` | LLM provider abstraction |
| `@anthropic-ai/sandbox` | Sandboxed code execution for safety |
| `croner` | Cron-style scheduling for recurring tasks |
| `chalk` | Terminal output formatting |
| `diff` | Text diffing for code change visualization |

### Capabilities

- Routes Slack messages to the coding agent as prompts
- Returns agent responses as Slack messages with code formatting
- Uses Anthropic's sandbox runtime for safe code execution within Slack
- Supports scheduled operations via cron expressions
- Invoked via the `mom` CLI command

## pi-pods (GPU Pod Provisioning)

The `pi-pods` package[^2] is a CLI utility for provisioning and managing vLLM (a high-throughput LLM serving framework) instances on GPU infrastructure.

### Purpose

When teams need to run open-weight models (rather than API-hosted models), they need GPU compute. `pi-pods` automates the provisioning workflow:

1. Configure model and GPU requirements
2. Provision a GPU pod on cloud infrastructure
3. Deploy vLLM with the specified model
4. Manage the instance lifecycle (start, stop, status, teardown)

### Technical Details

| Aspect | Detail |
|--------|--------|
| **Package** | `@mariozechner/pi-pods` v0.66.1 |
| **CLI command** | `pi-pods` |
| **Dependencies** | `pi-agent-core` for agent integration, `chalk` for terminal output |
| **Includes** | Model configurations, helper scripts, and provisioning templates |
| **Keywords** | llm, vllm, gpu, pods, ai, cli |

The package includes pre-built model configurations and helper scripts that are copied into the distribution during build, suggesting it bundles deployment recipes alongside the CLI tooling.

## pi-web-ui (Web Components)

The `pi-web-ui` package[^3] provides reusable web components for building browser-based AI chat interfaces. Built on Lit.js (Google's web component framework) with Tailwind CSS for styling, it offers a component library for rendering conversational AI interactions.

### Technology Stack

| Technology | Role |
|-----------|------|
| **Lit.js** | Web component framework (Shadow DOM, reactive properties, templates) |
| **Tailwind CSS** | Utility-first styling |
| **PDF.js** | PDF document rendering and text extraction |
| **XLSX** | Spreadsheet parsing for document-aware conversations |
| **Lucide** | Icon library |

### AI Backend Integration

The components integrate with multiple AI backends:

| Backend | Usage |
|---------|-------|
| `@mariozechner/pi-ai` | Core LLM streaming through the unified API |
| LM Studio | Local model serving via LM Studio's API |
| Ollama | Local model serving via Ollama's API |

### Use Cases

The web UI components enable building:

- Browser-based coding assistants
- Document-aware chat interfaces (PDF, spreadsheet support)
- Self-hosted chat applications using local models
- Custom frontends for pi-ai backed services

## Monorepo Coordination

All seven packages share lockstep versioning (currently v0.66.1) managed through the root `package.json`:

| Command | Scope |
|---------|-------|
| `npm run release:patch` | Features and fixes (0.66.1 → 0.66.2) |
| `npm run release:minor` | Breaking API changes (0.66.x → 0.67.0) |
| `npm run release:major` | Major version bumps |

The build system uses `concurrently` for parallel package builds, with dependency ordering ensured by npm workspace resolution. All packages target Node.js 20+ and use ES modules exclusively.

## Footnotes

[^1]: [pi-mom package source](https://github.com/badlogic/pi-mono/tree/main/packages/mom)
[^2]: [pi-pods package source](https://github.com/badlogic/pi-mono/tree/main/packages/pods)
[^3]: [pi-web-ui package source](https://github.com/badlogic/pi-mono/tree/main/packages/web-ui)

## References

- [Pi Mono GitHub Repository](https://github.com/badlogic/pi-mono)
- [Slack Socket Mode](https://api.slack.com/apis/socket-mode)
- [vLLM](https://docs.vllm.ai/)
- [Lit.js](https://lit.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
