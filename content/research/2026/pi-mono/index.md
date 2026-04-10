---
title: "Pi Mono"
date: 2026-04-10
---

## Overview

Pi[^1] is an open-source monorepo of tools for building AI agents and managing LLM deployments, created by Mario Zechner. The primary offering is an interactive coding agent CLI called `pi` that connects to multiple AI providers (Anthropic, OpenAI, Google, Mistral, AWS Bedrock, and more) and autonomously executes multi-step coding tasks — reading files, running shell commands, applying edits, and managing sessions — all from the terminal. The project is written almost entirely in TypeScript (95.9%), runs on Node.js 20+, and is structured as an npm workspace monorepo with lockstep versioning across seven packages.

What makes pi architecturally distinctive is its **layered separation of concerns**: a provider-agnostic LLM streaming library (`pi-ai`) sits at the bottom, a generic agent runtime with tool execution and state management (`pi-agent-core`) builds on top, and the full-featured coding agent CLI (`pi-coding-agent`) sits at the highest layer with session persistence, context compaction, extensions, skills, and a custom differential-rendering TUI (`pi-tui`). Supporting packages add Slack bot integration (`pi-mom`), GPU pod provisioning for vLLM (`pi-pods`), and reusable Lit.js web components for chat interfaces (`pi-web-ui`).

## Key Findings

- The architecture follows a **strict three-layer stack**: `pi-ai` (LLM abstraction) -> `pi-agent-core` (agent runtime) -> `pi-coding-agent` (coding CLI), with each layer usable independently as a published npm package[^2].
- A **pluggable provider registry** in `pi-ai` supports 17 provider implementations (Anthropic, OpenAI Completions/Responses/Codex, Google/Vertex/Gemini CLI, Mistral, AWS Bedrock, Azure OpenAI, and more) through a single `stream()` / `complete()` interface with compile-time type safety via `Model<TApi>` generics.
- The agent loop uses a **two-loop architecture**: an inner loop processes tool calls and steering messages within a turn, while an outer loop handles follow-up messages that arrive after the agent would normally stop — enabling mid-turn interruption and post-turn continuation.
- Sessions are persisted as **append-only JSONL trees** where each entry has an `id` and `parentId`, enabling non-destructive branching, forking to new directories, and tree traversal to reconstruct conversation paths.
- **Context compaction** uses the LLM itself to summarize older messages when token usage exceeds thresholds, with structured summaries (Goals, Constraints, Progress, Key Decisions, Next Steps) and file operation tracking preserved across compaction boundaries.
- The TUI library implements **differential rendering** — a 5-stage pipeline that renders components, composites overlays, extracts cursor positions, diffs against the previous frame, and writes only changed lines using synchronized output blocks to prevent flicker.
- The **extension system** supports custom tools, slash commands, event hooks, and resource overrides loaded from user or project directories, while **skills** are markdown files with frontmatter that get injected into the system prompt.
- Built-in tools follow a **file mutation queue** pattern where concurrent modifications to the same file are serialized, and the edit tool evaluates all replacements against the original file content (not incrementally) to prevent cascading errors.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     User Interfaces                          │
│  ┌──────────┐  ┌──────────┐  ┌───────┐  ┌───────────────┐  │
│  │Interactive│  │  Print   │  │  RPC  │  │   pi-web-ui   │  │
│  │   (TUI)  │  │  Mode    │  │ Mode  │  │  (Lit.js)     │  │
│  └────┬─────┘  └────┬─────┘  └───┬───┘  └───────────────┘  │
│       └──────────────┼───────────┘                          │
│                      ▼                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              pi-coding-agent                          │   │
│  │  Sessions · Tools · Extensions · Skills · Compaction  │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              pi-agent-core                            │   │
│  │  Agent loop · Tool execution · State · Events         │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              pi-ai                                    │   │
│  │  Provider registry · Streaming · Models · Types       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐  │
│  │ pi-tui   │  │ pi-mom   │  │ pi-pods                  │  │
│  │ Terminal  │  │ Slack    │  │ vLLM GPU provisioning    │  │
│  │ renderer │  │ bot      │  │                          │  │
│  └──────────┘  └──────────┘  └──────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Footnotes

[^1]: [Pi Mono GitHub Repository](https://github.com/badlogic/pi-mono)
[^2]: [Pi Mono AGENTS.md](https://github.com/badlogic/pi-mono/blob/main/AGENTS.md)

## References

- [Pi Mono GitHub Repository](https://github.com/badlogic/pi-mono)
- [Pi Mono AGENTS.md](https://github.com/badlogic/pi-mono/blob/main/AGENTS.md)
- [npm: @mariozechner/pi-ai](https://www.npmjs.com/package/@mariozechner/pi-ai)
- [npm: @mariozechner/pi-agent-core](https://www.npmjs.com/package/@mariozechner/pi-agent-core)
- [npm: @mariozechner/pi-coding-agent](https://www.npmjs.com/package/@mariozechner/pi-coding-agent)

## Contents

| File | Description |
|------|-------------|
| [pi-ai](research/2026/pi-mono/pi-ai) | Unified LLM API: provider registry, streaming protocol, model system, and 17 provider implementations |
| [agent-core](research/2026/pi-mono/agent-core) | Agent runtime: two-loop architecture, tool execution, state management, steering and follow-up queues |
| [coding-agent](research/2026/pi-mono/coding-agent) | Coding agent CLI: session trees, built-in tools, compaction, extensions, skills, and system prompt construction |
| [tui](research/2026/pi-mono/tui) | Terminal UI: differential rendering, component system, overlay management, keyboard protocols, and keybindings |
| [supporting-packages](research/2026/pi-mono/supporting-packages) | Slack bot (pi-mom), GPU pod provisioning (pi-pods), and Lit.js web components (pi-web-ui) |
