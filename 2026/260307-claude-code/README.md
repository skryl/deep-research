# Claude Code - Deep Research

**Date:** 2026-03-07
**Topic:** Claude Code — Anthropic's agentic CLI coding tool

## Overview

Claude Code is Anthropic's official command-line interface that brings Claude directly into the terminal as an agentic coding assistant. Unlike the web-based Claude chat, Claude Code operates within your local development environment — it can read and edit files, run shell commands, search codebases, interact with git, and manage complex multi-step engineering tasks autonomously.

## Key Findings

- Claude Code uses an **agentic loop** architecture: the model receives context, decides which tools to invoke, observes results, and iterates until the task is complete.
- A sophisticated **permissions model** gives users fine-grained control over what actions Claude can take automatically vs. requiring approval.
- **CLAUDE.md** files provide persistent, project-scoped memory and instructions that survive across sessions.
- **MCP (Model Context Protocol)** integration allows Claude Code to connect to arbitrary external tools and data sources.
- **Hooks** enable users to inject custom shell commands at specific points in the agentic loop (before/after tool use, on session start, etc.).
- Supports **headless/CI mode** for non-interactive use in pipelines and automation.

## Contents

| File | Description |
|------|-------------|
| [architecture.md](architecture.md) | Agentic loop, tool system, and context management |
| [features.md](features.md) | Core features: slash commands, memory, permissions |
| [configuration.md](configuration.md) | Settings, CLAUDE.md, hooks, and MCP servers |
| [workflows.md](workflows.md) | Common usage patterns and best practices |
| [sdk-and-automation.md](sdk-and-automation.md) | Claude Code SDK, headless mode, and CI integration |
