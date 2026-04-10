---
title: "Agent Runtime (pi-agent-core)"
weight: 2
---

## Overview

The `pi-agent-core` package[^1] provides a generic, provider-agnostic agent runtime with transport abstraction, state management, and tool execution. It depends only on `pi-ai` for LLM streaming and exposes a stateful `Agent` class that manages the full lifecycle of multi-turn conversations. The package is intentionally minimal — five source files totaling under 2,000 lines — serving as a reusable foundation that the coding agent and other consumers build upon.

## Two-Loop Architecture

The agent loop uses two nested loops to handle the complexity of multi-turn agent interactions:

```
User prompt
    │
    ▼
┌─────────────────────────────────────────────┐
│  Outer Loop (follow-up messages)            │
│                                             │
│  ┌────────────────────────────────────────┐ │
│  │  Inner Loop (tool calls + steering)    │ │
│  │                                        │ │
│  │  1. Check for steering messages        │ │
│  │  2. Stream assistant response          │ │
│  │  3. Execute tool calls                 │ │
│  │  4. Check for new steering messages    │ │
│  │  5. Repeat if tool calls or messages   │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  Check for follow-up messages               │
│  If any → inject and continue outer loop    │
└─────────────────────────────────────────────┘
```

### Inner Loop

Each iteration of the inner loop performs a single turn:

1. **Steering check** — Drains any pending steering messages and injects them into context before the next LLM call
2. **Stream response** — Calls the LLM via the configured `streamFn`, converting `AgentMessage[]` to LLM-compatible `Message[]` only at the streaming boundary
3. **Tool execution** — If the response contains tool calls, executes them sequentially or in parallel (configurable via `toolExecution: "sequential" | "parallel"`)
4. **Post-tool steering check** — Checks for new steering messages that arrived during tool execution
5. **Loop continuation** — Repeats if tool calls produced results or steering messages are pending

### Outer Loop

The outer loop runs after the inner loop completes (i.e., no more tool calls). It checks the follow-up queue — if messages arrived while the agent was running, it injects them and restarts the inner loop. This enables scenarios where a user queues additional instructions while the agent is mid-task.

### Two Entry Points

| Function | Purpose |
|----------|---------|
| `agentLoop()` | Accepts new prompt messages, adds to context with event emissions, then enters the loop |
| `agentLoopContinue()` | Resumes from existing context without new messages; validates last message is `"user"` or `"toolResult"` |

## Message Architecture

A key design decision: the agent loop maintains an **`AgentMessage[]` format internally** throughout its lifetime. Conversion to LLM-compatible `Message[]` happens only at the streaming boundary via the `convertToLlm()` function. This means:

- Agent messages carry richer metadata (timestamps, tool names, custom fields) than LLM messages
- The conversion is pluggable — different LLM providers may need different message formats
- Extensions can add custom message types via TypeScript declaration merging on `CustomAgentMessages`

### Message Roles

| Role | Description |
|------|-------------|
| `user` | User input (text, images, or mixed content) |
| `assistant` | Model response with usage tracking |
| `toolResult` | Result of a tool execution (content, details, error flag) |
| Custom roles | Via declaration merging on `CustomAgentMessages` |

## Tool System

### Tool Definition

```typescript
interface AgentTool {
  label?: string;
  prepareArguments?: (args: unknown) => unknown;
  execute: (args: unknown, update: AgentToolUpdateCallback) => Promise<AgentToolResult>;
}
```

Tools optionally transform their arguments via `prepareArguments()` before execution, and can emit progress updates during long-running operations via the `update` callback.

### Execution Lifecycle

Each tool call passes through a three-phase lifecycle:

1. **Preparation** — Validate arguments, apply `prepareArguments()`, run optional `beforeToolCall` hook. If the hook returns `{ block: true }`, the tool is skipped and an error result is returned immediately.

2. **Execution** — Call `tool.execute()` with validated arguments and an update callback for progress events.

3. **Finalization** — Apply optional `afterToolCall` hook, which can override the result's `content`, `details`, or `isError` fields without deep merging.

### Error Handling

Tool failures are distinguished by stop reason:

| Stop Reason | Behavior |
|-------------|----------|
| `"error"` | Halt the agent immediately |
| `"aborted"` | Halt the agent (user cancellation) |
| Other | Continue the loop with error result in context |

Tool-not-found and argument validation errors produce descriptive error messages without crashing the loop.

## State Management

### Agent Class

The `Agent` class wraps the loop in a stateful container with lifecycle management:

```typescript
class Agent {
  // Prompting
  prompt(input: string | Image[] | AgentMessage[]): void;
  continue(): void;
  steer(messages: AgentMessage[]): void;
  followUp(messages: AgentMessage[]): void;
  abort(): void;
  waitForIdle(): Promise<void>;
  reset(): void;

  // State
  get state(): AgentState;
  get signal(): AbortSignal;
  get hasQueuedMessages(): boolean;
  subscribe(listener: (event: AgentEvent) => void): () => void;
}
```

### MutableAgentState

Internal state is tracked through getter/setter arrays for tools and messages, plus streaming status:

| Property | Type | Description |
|----------|------|-------------|
| `tools` | `Map<string, AgentTool>` | Registered tools (getter/setter with copy-on-read) |
| `messages` | `AgentMessage[]` | Full conversation history |
| `isStreaming` | `boolean` | Whether a response is being streamed |
| `streamingMessage` | `AssistantMessage?` | The in-progress message during streaming |
| `pendingToolCalls` | `ToolCall[]` | Tool calls awaiting execution |
| `errorMessage` | `string?` | Last error message |

Arrays are copied on read to prevent external mutation of internal state.

### Active Run Tracking

Each `prompt()` or `continue()` call creates an `ActiveRun` — a `{ promise, controller }` pair. The promise resolves when the run completes, and the controller's `AbortSignal` propagates cancellation through streaming and tool execution. `waitForIdle()` awaits the active run's promise.

## Message Queuing

The `PendingMessageQueue` manages mid-run message delivery with two modes:

| Mode | Behavior |
|------|----------|
| `"all"` | Drains all queued messages at once |
| `"one-at-a-time"` | Delivers a single message per drain call |

Both steering and follow-up messages use separate queue instances. Steering messages are injected **during** a turn (before the next LLM call), while follow-up messages are injected **between** turns (after the inner loop completes).

## Event System

The agent emits typed events through an `EventStream`:

| Event | When |
|-------|------|
| `agent_start` | Agent begins a run |
| `agent_end` | Agent completes (includes final messages) |
| `turn_start` | New turn begins |
| `turn_end` | Turn completes |
| `message_start` | New message being constructed |
| `message_update` | Partial content received (text/thinking/tool call deltas) |
| `message_end` | Message fully received |
| `tool_execution_start` | Tool call beginning |
| `tool_execution_end` | Tool call completed (with result) |

The `EventStream` terminates on `agent_end`, and consumers can extract the final message list from the termination event.

## Context Transformation

The optional `transformContext()` hook receives the full `AgentMessage[]` and an `AbortSignal` before each LLM call. This enables:

- Token counting and context truncation
- System prompt injection
- Message filtering or rewriting
- Context window optimization

The transformation operates on `AgentMessage[]` (not LLM messages), preserving the rich metadata format until the final `convertToLlm()` step.

## Footnotes

[^1]: [pi-agent-core package source](https://github.com/badlogic/pi-mono/tree/main/packages/agent)

## References

- [Pi Mono GitHub Repository](https://github.com/badlogic/pi-mono)
- [pi-ai package](https://github.com/badlogic/pi-mono/tree/main/packages/ai)
