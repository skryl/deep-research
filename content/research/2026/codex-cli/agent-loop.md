---
title: "Agent Loop"
weight: 2
---

## Overview

The Codex agent loop is the core reasoning cycle that drives autonomous task completion. Implemented in `codex-core`, it manages the conversation between the user, the language model, and the tool execution environment. The loop follows a standard ReAct (Reasoning + Acting) pattern: the model receives context, decides on tool calls, observes results, and iterates until the task is complete or the user intervenes.

## Conversation Model

### Message Types

The protocol defines a rich message taxonomy:

| Message Type | Source | Content |
|-------------|--------|---------|
| User message | Human | Natural language instructions, file contents |
| Assistant message | Model | Reasoning text, tool call requests |
| Tool result | System | Command output, file contents, patch results |
| System message | Framework | Instructions, context, permissions |

### Conversation State

Conversation history is maintained as an ordered sequence of messages with metadata:

- **Thread ID** — Unique identifier for the conversation thread
- **Message history** — Full sequence of messages with role attribution
- **Turn boundaries** — Markers separating user-initiated turns
- **Token tracking** — Running count for context window management

The state persists across turns within a session and can be serialized to SQLite for session resume/fork operations.

## Model Interaction

### API Integration

Codex connects to model providers through the `codex-api` crate, which wraps the OpenAI Responses API (and compatible endpoints). The system supports multiple providers:

| Provider | Configuration | Models |
|----------|--------------|--------|
| OpenAI | API key or ChatGPT auth | GPT-4.1, o4-mini, o3, etc. |
| Ollama | Local server URL | Any Ollama-hosted model |
| LM Studio | Local server URL | Any LM Studio model |

### Streaming Responses

Model responses stream token-by-token through async channels. The streaming pipeline:

1. **HTTP SSE stream** — Server-sent events from the model API
2. **Token aggregation** — Tokens assembled into coherent text and tool calls
3. **Event emission** — `ItemStartedEvent`, `ItemUpdatedEvent`, `ItemCompletedEvent` notifications
4. **UI rendering** — TUI or exec processor consumes events for display

### Reasoning Support

For reasoning models (o3, o4-mini), the agent loop handles:

- **Reasoning tokens** — Internal chain-of-thought that counts against context but isn't shown by default
- **Reasoning effort** — Configurable via `reasoning.effort` parameter (low/medium/high)
- **Reasoning summaries** — Exposed through `ReasoningItem` events for observability

## Tool System

### Built-in Tools

The agent can invoke several categories of tools:

**Shell Execution**
- Execute arbitrary shell commands in the user's environment
- Commands run through the sandbox layer with approval gating
- Output captured via piped stdout/stderr with configurable byte caps

**File Operations**
- Read files from the workspace
- Apply patches using a structured diff format
- Create new files

**MCP Tools**
- Call tools exposed by connected MCP servers
- Dynamic tool discovery at session start
- Collaborative tool calls between agents

**Planning**
- `plan_tool` for structured task decomposition
- Todo/task tracking

### Tool Dispatch Flow

```
Model response parsed
        │
        ▼
┌───────────────────┐
│  Tool call request │
│  (function_name,   │
│   arguments)       │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐    ┌──────────────────┐
│ Execution Policy  │───▶│ Auto-approved?   │
│ Check             │    │ Yes → Execute    │
└────────┬──────────┘    │ No → Next check  │
         │               └──────────────────┘
         ▼
┌───────────────────┐    ┌──────────────────┐
│ Guardian          │───▶│ Risk assessment  │
│ Assessment        │    │ Low → Execute    │
└────────┬──────────┘    │ High → Approval  │
         │               └──────────────────┘
         ▼
┌───────────────────┐    ┌──────────────────┐
│ User Approval     │───▶│ Approve / Deny   │
│ Request           │    │ + Amend policy   │
└───────────────────┘    └──────────────────┘
```

### Command Execution Details

Commands are spawned asynchronously via `spawn_child_async()`:

| Parameter | Description |
|-----------|-------------|
| Program + args | The command to execute |
| Working directory | Inherited from session or overridden |
| Environment | User env with sandbox additions |
| Network policy | Passed to sandbox layer |
| Stdio policy | Piped for capture |

**Output capture** reads in 8KB chunks with byte caps:
- **ShellTool policy**: 256KB output cap, timeout-based expiration
- **FullBuffer policy**: Complete output, no caps

**Timeout management** uses three expiration mechanisms:
- Fixed timeout (default: 10 seconds for shell tool)
- External cancellation token (user interrupt)
- Default fallback (10,000ms)

On timeout, the entire process group is killed with a synthetic exit code 64 and `timed_out: true` flag.

**Output aggregation** splits capacity between stdout (1/3) and stderr (2/3), with unused capacity rebalanced across streams.

## Patch Application

File modifications use a structured patch format rather than raw file writes:

1. Model generates a diff description (files to modify, changes to make)
2. `ApplyPatchApprovalRequestEvent` is created with the change map
3. Approval pipeline evaluates (sandbox policy, user approval)
4. On approval, patches are applied atomically
5. Session-level write grants can pre-approve directories

## Multi-Turn Reasoning

The agent loop supports extended multi-turn reasoning:

```
Turn 1: User asks "fix the failing tests"
  → Model: reads test output, identifies failures
  → Tool: run test suite
  → Observation: 3 tests failing in auth module

Turn 2: (automatic continuation)
  → Model: reads auth module source
  → Tool: read file, grep for patterns
  → Observation: identifies root cause

Turn 3: (automatic continuation)
  → Model: generates fix
  → Tool: apply patch to 2 files
  → Observation: patch applied

Turn 4: (automatic continuation)
  → Model: verifies fix
  → Tool: run test suite again
  → Observation: all tests passing
  → Model: reports completion to user
```

Each turn emits lifecycle events: `TurnStartedEvent` → `ItemStartedEvent` (per tool call) → `ItemCompletedEvent` → `TurnCompletedEvent`.

## Context Management

### Token Budget

The agent tracks token usage across the conversation:

- **Input tokens** — User messages, system prompts, tool results
- **Output tokens** — Model responses, reasoning tokens
- **Context window** — Model-specific limit (e.g., 128K for GPT-4.1)

### History Truncation

When approaching context limits, the system can:
- Summarize earlier conversation turns
- Drop tool output from completed turns
- Preserve system instructions and recent context

### Skills and Plugins

The agent can load "skills" — domain-specific knowledge and tool configurations:

- Defined in `.codex/skills/` directories with `SKILL.md` files
- Loaded on demand to conserve context
- Can include reference documents, scripts, and agent configurations

## Interruption and Control

Users can interrupt the agent at any point:

- **Cancel current tool** — Stops the running command
- **Cancel current turn** — Aborts the model's current reasoning cycle
- **Provide input** — Inject additional context mid-turn
- **Request review** — Switch to code review mode

The `CodexStatus` enum tracks running state: `Running` or `InitiateShutdown`.

## Footnotes

[^1]: [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses)
[^2]: [ReAct Pattern](https://arxiv.org/abs/2210.03629)

## References

- [OpenAI Codex CLI GitHub](https://github.com/openai/codex)
- [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses)
- [Model Context Protocol](https://modelcontextprotocol.io/)
