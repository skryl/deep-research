---
title: "Claw Code Agent"
date: 2026-04-09
---

## Overview

Claw Code Agent is a **Python reimplementation of Claude Code's agent architecture**[^1] designed to run entirely with local open-source models via OpenAI-compatible APIs. The project achieves full agentic coding workflows — prompt assembly, context building, tool execution, session persistence, and nested delegation — in pure Python with zero external dependencies.

Where Claude Code requires Anthropic's proprietary API, Claw Code Agent targets local inference backends like **vLLM**, **Ollama**, **LiteLLM Proxy**, and **OpenRouter**, with first-class support for **Qwen3-Coder-30B-A3B-Instruct** as its recommended model.

## Key Findings

- Implements a **complete agentic loop** mirroring Claude Code: prompt assembly, iterative tool calling, streaming output, context compaction, and budget enforcement — all in ~21,000 lines of pure Python across 51 source files.
- Ships **60+ built-in tools** covering file operations, search, shell execution, MCP integration, task management, team collaboration, git worktree management, and nested agent delegation.
- Achieves **strong parity with Claude Code's core execution layer** (agent loop, tool calling, streaming, session persistence, cost tracking) while lacking ~70% of the npm implementation's interactive UI, remote infrastructure, and service ecosystem.
- A sophisticated **bash security system** with 18 validators and 163 tests detects injection attacks, obfuscation, destructive commands, and parser-differential exploits before shell execution.
- **Plugin system** supports manifest-based extensions with lifecycle hooks, tool aliases, virtual tools, and tool-level interception — enabling customization without modifying core code.
- **MCP (Model Context Protocol)** runtime implements JSON-RPC 2.0 over stdio transport for resource discovery and tool invocation through external servers.
- **Zero external dependencies** — the entire codebase uses only the Python standard library (Python 3.10+).

## Motivation

Claude Code is a powerful agentic coding tool, but it is locked to Anthropic's API and closed-source infrastructure. Claw Code Agent asks: *what if you could run the same architecture locally, with any model, and full visibility into the internals?* The project is aimed at developers who want:

- **Full control** over model selection, inference parameters, and cost
- **Privacy** — code never leaves the local machine
- **Extensibility** — modify any part of the agent pipeline
- **Education** — a readable reference implementation of agentic coding patterns

## Footnotes

[^1]: [Claw Code Agent GitHub Repository](https://github.com/HarnessLab/claw-code-agent)

## References

- [Claw Code Agent GitHub Repository](https://github.com/HarnessLab/claw-code-agent)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Qwen3-Coder Model](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct)
- [vLLM Project](https://github.com/vllm-project/vllm)
- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)

## Contents

| File | Description |
|------|-------------|
| [architecture](architecture) | Agent loop, session state, context building, and prompt assembly |
| [tools-and-security](tools-and-security) | Tool system, permission model, and bash security validators |
| [runtimes](runtimes) | Plugin, MCP, search, remote, task, team, and workflow runtimes |
| [local-models](local-models) | OpenAI-compatible backends, vLLM, Ollama, and streaming |
| [parity-and-status](parity-and-status) | Feature comparison with Claude Code npm and development roadmap |
