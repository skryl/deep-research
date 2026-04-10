---
title: "Architecture"
weight: 1
---

## The Agent Loop

The core of Claw Code Agent is `LocalCodingAgent` in `agent_runtime.py`. It implements the same iterative loop pattern as Claude Code[^1]:

1. **Initialization** — Preprocess hooks fire, session state is built from system prompt parts, user context, and the initial prompt.
2. **Model query** — The assembled messages are sent to the OpenAI-compatible backend with tool definitions.
3. **Tool execution** — If the model requests tool calls, each is routed through preflight checks, plugin/policy validation, then executed (with optional streaming).
4. **Budget check** — Token counts, cost estimates, tool call counts, and turn limits are validated against configured budgets.
5. **Context management** — If context pressure builds, the agent dynamically snips or compacts messages.
6. **Iteration** — Steps 2–5 repeat until the model stops with no tool calls, a budget limit triggers, or max turns are reached.

### Termination Conditions

The loop exits when any of these conditions are met:

| Condition | Behavior |
|-----------|----------|
| Model returns no tool calls | Normal completion — final response delivered |
| Budget constraint exceeded | Immediate halt with diagnostic message |
| Maximum turns reached | Graceful stop with partial results |
| Prompt-length error | Triggers reactive compaction, then retries |
| Backend error | Returns with diagnostic information |

## Session State Management

The `AgentSessionState` class (in `agent_session.py`) manages conversation history as a structured sequence of messages with full metadata tracking.

### State Structure

```
AgentSessionState
├── system_prompt_parts: tuple[str, ...]
├── user_context: dict[str, str]
├── system_context: dict[str, str]
├── messages: list[AgentMessage]
└── mutation_serial: int
```

### Streaming State Transitions

Messages support incremental construction for streaming:

```
start_assistant() → append_assistant_delta() → finalize_assistant()
start_tool()      → append_tool_delta()      → finalize_tool()
```

Each mutation is recorded via `_record_mutation()`, preserving up to 8 historical mutations with aggregated statistics. This enables interrupted sessions to resume with correct change tracking by extracting the maximum `last_mutation_serial` from message metadata.

### Session Persistence

Sessions serialize to JSON via `save_agent_session()`, storing:

- Message history with full metadata
- Plugin state snapshots
- File operation history
- Budget state for resumption

The `agent-resume` command deserializes stored sessions, allowing selective override of model parameters and permissions while preserving original context.

## Context Building

The `agent_context.py` module constructs the workspace context that grounds the agent in its environment.

### CLAUDE.md Discovery

Memory files are discovered hierarchically, walking upward from the working directory:

1. **Global scope** — `~/.claude/CLAUDE.md`
2. **Directory-scoped files** (searched upward from cwd):
   - `CLAUDE.md`
   - `.claude/CLAUDE.md`
   - `CLAUDE.local.md`
3. **Rules directory** — `.claude/rules/*.md` (sorted alphabetically)

Duplicates are prevented via a `seen` set. Memory content is truncated at 40,000 characters.

### Environment Snapshot

`build_context_snapshot()` gathers:

| Source | Data |
|--------|------|
| Runtime | Platform, OS version, shell, current date |
| Git | Branch, status (truncated at 2,000 chars), recent commits, default branch |
| User context | Memory files, plugin manifests, runtime configurations |
| Runtimes | Plugin, MCP, remote, search, account, task, workflow, team summaries |

Git state is cached with `@lru_cache(maxsize=32)` to avoid redundant subprocess calls. Repository detection checks for `.git` directory existence or runs `git rev-parse --is-inside-work-tree`.

## Prompt Assembly

The `agent_prompting.py` module orchestrates system prompt construction through three configuration modes:

| Mode | Behavior |
|------|----------|
| **Override** | Single custom prompt replaces all defaults |
| **Custom** | User-provided prompt replaces default sections only |
| **Default** | Assembled from 21 composable sections |

### Default Prompt Sections

The default prompt is built from discrete, conditionally-rendered sections:

1. Core behavior (intro, system fundamentals, task execution)
2. Tool usage guidance (conditional on enabled tools)
3. Runtime capabilities (plugins, MCP, remote, search, accounts)
4. Workspace policies (hook policies, trust modes, configuration)
5. Collaboration (teams, planning, task tracking)
6. Communication style and output efficiency
7. Session-specific permissions
8. Environment information

Sections conditionally render based on available runtimes — for example, MCP guidance only appears if `mcpRuntime` exists, keeping prompts minimal for lightweight sessions.

A boundary marker `__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__` separates stable guidance from session-specific runtime instructions, supporting context summarization over extended conversations.

### Permission-Aware Adaptation

The prompt adapts to the agent's permission constraints:

- Blocked shell commands trigger re-authorization guidance
- Disabled file writes suggest alternative approaches
- Destructive operations remain restricted unless unsafe mode is active

## Nested Agent Delegation

The `delegate_agent` tool and `AgentManager` class (in `agent_manager.py`) enable hierarchical task decomposition.

### Delegation Architecture

```
Parent Agent
├── Group A (parallel strategy)
│   ├── Child 1 (independent task)
│   └── Child 2 (independent task)
└── Group B (serial strategy)
    ├── Child 3 (depends on Group A)
    └── Child 4 (depends on Child 3)
```

### Key Capabilities

- **Topological batching** — Dependencies between subtasks are respected; independent tasks execute in parallel while dependent tasks execute serially.
- **Session resumption** — Delegated agents can resume from previous sessions, enabling long-running multi-step workflows.
- **Fault tolerance** — Configurable failure thresholds determine whether a group continues or halts on child failure.
- **Lineage tracking** — `ManagedAgentRecord` stores parent-child relationships via `parent_agent_id`, `group_id`, and `child_index`.
- **Immutable state** — Updates use immutability patterns (reconstructing dataclasses rather than mutating), ensuring auditability.

### Execution Metrics

Each agent record tracks: turns completed, tool calls made, stop reason, and session path. Groups track: completed/failed children, batch count, max batch size, and dependency skips.

## Context Optimization

When context pressure builds, the agent employs two strategies in sequence.

### Dynamic Snipping

`_snip_session_pass()` targets individual messages:

- Removes tombstoned tool results and long assistant messages
- Preserves semantic information through summaries
- Estimates token savings before committing changes

### Session Compaction

When snipping is insufficient, `_compact_session_pass()` summarizes entire conversation segments:

- Generates "compact boundary" messages containing hierarchical summaries
- Tracks compaction depth and lineage IDs for debugging
- Preserves recent messages as the active working set

Both strategies operate reactively when prompt-length errors occur, then the agent retries the model query.

## Footnotes

[^1]: [Claude Code Architecture Overview](https://docs.anthropic.com/en/docs/claude-code/overview)

## References

- [Claude Code Architecture Overview](https://docs.anthropic.com/en/docs/claude-code/overview)
- [Claw Code Agent — agent_runtime.py](https://github.com/HarnessLab/claw-code-agent/blob/main/src/agent_runtime.py)
- [Claw Code Agent — agent_session.py](https://github.com/HarnessLab/claw-code-agent/blob/main/src/agent_session.py)
- [Claw Code Agent — agent_context.py](https://github.com/HarnessLab/claw-code-agent/blob/main/src/agent_context.py)
- [Claw Code Agent — agent_prompting.py](https://github.com/HarnessLab/claw-code-agent/blob/main/src/agent_prompting.py)
