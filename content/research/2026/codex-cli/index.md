---
title: "OpenAI Codex CLI"
date: 2026-04-09
---

## Overview

OpenAI's Codex CLI[^1] is an open-source, terminal-based coding agent that runs locally on your machine. Originally built in TypeScript with React/Ink for the terminal UI, the project underwent a major rewrite into Rust (now 94.9% of the codebase) using Ratatui for the TUI, Tokio for async execution, and a modular crate-based architecture. The CLI connects to OpenAI's model APIs (or local providers like Ollama and LM Studio), interprets natural-language instructions, and autonomously executes multi-step coding tasks — reading files, writing patches, running shell commands, and managing MCP tool servers — all within a sandboxed environment with user-configurable approval policies.

## Key Findings

- The architecture follows a **client–server model** internally: the `codex-core` crate acts as an in-process "app server" that manages sessions, conversation state, and model interactions, while the `codex-tui` and `codex-exec` crates consume events as presentation layers[^2].
- A **three-tier sandbox system** provides platform-specific isolation: macOS uses Apple's Seatbelt (`sandbox-exec`) profiles, Linux uses Bubblewrap + Landlock + seccomp, and Windows uses restricted tokens[^3]. Each generates dynamic security policies based on filesystem and network access requirements.
- The **execution policy engine** (`execpolicy` crate) implements a rule-based system with prefix matching, network protocol rules, and pattern tokens to gate which commands can run without approval[^4].
- An **approval pipeline** separates concerns into sandbox policies (what the OS enforces), execution policies (what the agent auto-approves), and Guardian assessments (risk classification with Low/Medium/High/Critical levels).
- The project supports **headless execution** via `codex exec` for CI/CD pipelines, with JSONL event streaming, configurable approval policies, and non-interactive stdin processing.
- **MCP (Model Context Protocol)** integration is bidirectional — Codex operates as both an MCP client (connecting to external tool servers) and experimentally as an MCP server (allowing other agents to use Codex as a tool)[^5].
- The 95+ crate workspace includes dedicated crates for analytics, PTY management, image processing, network proxying, keyring storage, and OpenTelemetry-based observability.

## Footnotes

[^1]: [OpenAI Codex CLI GitHub](https://github.com/openai/codex)
[^2]: [Codex Rust README](https://github.com/openai/codex/tree/main/codex-rs)
[^3]: [Codex Sandboxing Crate](https://github.com/openai/codex/tree/main/codex-rs/sandboxing)
[^4]: [Codex Execution Policy Crate](https://github.com/openai/codex/tree/main/codex-rs/execpolicy)
[^5]: [Model Context Protocol](https://modelcontextprotocol.io/)

## References

- [OpenAI Codex CLI GitHub](https://github.com/openai/codex)
- [Codex Developer Documentation](https://developers.openai.com/codex)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Ratatui TUI Framework](https://ratatui.rs/)
- [Bubblewrap Sandbox](https://github.com/containers/bubblewrap)
- [Apple Seatbelt Documentation](https://reverse.put.as/wp-content/uploads/2011/09/Apple-Sandbox-Guide-v1.0.pdf)

## Contents

| File | Description |
|------|-------------|
| [architecture](research/2026/codex-cli/architecture) | Crate workspace, client-server model, session lifecycle, and turn orchestration |
| [agent-loop](research/2026/codex-cli/agent-loop) | Model interaction, tool dispatch, conversation state, and multi-turn reasoning |
| [sandbox](research/2026/codex-cli/sandbox) | Platform-specific sandboxing: Seatbelt, Bubblewrap, Landlock, seccomp, and Windows |
| [execution-policy](research/2026/codex-cli/execution-policy) | Approval pipeline, prefix rules, network policies, and Guardian risk assessment |
| [terminal-ui](research/2026/codex-cli/terminal-ui) | Ratatui TUI, event processing, session management, and headless exec mode |
