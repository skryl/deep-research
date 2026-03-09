---
title: "Claude Code"
date: 2026-03-07
---

## Overview

Claude Code is Anthropic's official command-line interface that brings Claude directly into the terminal as an agentic coding assistant. Unlike the web-based Claude chat, Claude Code operates within your local development environment — it can read and edit files, run shell commands, search codebases, interact with git, and manage complex multi-step engineering tasks autonomously.

## Key Findings

- Claude Code uses an **agentic loop** architecture: the model receives context, decides which tools to invoke, observes results, and iterates until the task is complete.
- A sophisticated **permissions model** gives users fine-grained control over what actions Claude can take automatically vs. requiring approval.
- **CLAUDE.md** files provide persistent, project-scoped memory and instructions that survive across sessions.
- **MCP (Model Context Protocol)** integration allows Claude Code to connect to arbitrary external tools and data sources.
- **Hooks** enable users to inject custom shell commands at specific points in the agentic loop (before/after tool use, on session start, etc.).
- Supports **headless/CI mode** for non-interactive use in pipelines and automation.

## References

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Claude Code GitHub](https://github.com/anthropics/claude-code)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Anthropic API Documentation](https://docs.anthropic.com/en/docs)
- [Claude Code SDK (npm)](https://www.npmjs.com/package/@anthropic-ai/claude-code)

## Contents

| File | Description |
|------|-------------|
| [architecture](research/2026/claude-code/architecture) | Agentic loop, tool system, and context management |
| [features](research/2026/claude-code/features) | Core features: slash commands, memory, permissions |
| [configuration](research/2026/claude-code/configuration) | Settings, CLAUDE.md, hooks, and MCP servers |
| [workflows](research/2026/claude-code/workflows) | Common usage patterns and best practices |
| [sdk-and-automation](research/2026/claude-code/sdk-and-automation) | Claude Code SDK, headless mode, and CI integration |
