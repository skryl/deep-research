---
title: "Runtimes"
weight: 3
---

## Runtime Architecture

Beyond the core agent loop, Claw Code Agent implements a suite of specialized **runtimes** — modular subsystems that extend the agent with domain-specific capabilities. Each runtime manages its own state, discovery logic, and tool integration, and is composed into the agent via the `ToolExecutionContext`.

## Plugin Runtime

The `plugin_runtime.py` module provides a manifest-based extension system that mirrors Claude Code's plugin architecture.

### Manifest Discovery

Plugin manifests are loaded from JSON files discovered in:
- `.codex-plugin/plugin.json`
- `.claw-plugin/plugin.json`
- `plugins/*/plugin.json`

A manifest requires a `name` field and supports optional fields:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Example plugin",
  "hooks": { ... },
  "tool_aliases": [ ... ],
  "virtual_tools": [ ... ],
  "tool_hooks": { ... },
  "blocked_tools": [ ... ]
}
```

### Lifecycle Hooks

The plugin system supports six lifecycle events:

| Hook | When It Fires |
|------|---------------|
| `before_prompt` | Before system prompt construction |
| `after_turn` | After each conversation turn completes |
| `on_resume` | When resuming a suspended session |
| `before_persist` | Before session state is saved |
| `before_delegate` | Before delegating to a child agent |
| `after_delegate` | After delegation completes |

Hook invocation counts are tracked in `session_state` for observability.

### Tool Aliases

Aliases create alternative names for existing tools:

```json
{
  "tool_aliases": [
    {
      "name": "search",
      "base_tool": "grep_search",
      "description": "Search codebase for patterns"
    }
  ]
}
```

The `register_tool_aliases()` method validates that base tools exist and names aren't duplicated before registering.

### Virtual Tools

Virtual tools are synthetic tools defined entirely in manifests — no Python code required:

```json
{
  "virtual_tools": [
    {
      "name": "project_info",
      "description": "Get project metadata",
      "response_template": "Project: {name}, Version: {version}",
      "parameters": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "version": { "type": "string" }
        }
      }
    }
  ]
}
```

Response templates use Python format string syntax. Dict/list arguments are auto-serialized to JSON. Missing keys fall back safely.

### Tool Hooks

Tool hooks intercept execution at three points:

| Hook | Effect |
|------|--------|
| `before_tool` | Inject preflight guidance |
| `after_result` | Inject postflight guidance |
| `block_message` | Prevent tool execution entirely |

## MCP Runtime

The `mcp_runtime.py` module implements the **Model Context Protocol** (MCP)[^1] version `2025-11-25`, enabling the agent to discover and use external tools and resources through standardized JSON-RPC 2.0 communication.

### Data Model

| Dataclass | Fields |
|-----------|--------|
| `MCPResource` | URI, optional file path, inline content, metadata |
| `MCPTool` | Name, description, input schema, server association |
| `MCPServerProfile` | Command, arguments, environment variables, working directory |

### Manifest Discovery

The runtime searches directory hierarchies for:
- `.claw-mcp.json`
- `.mcp.json`
- `.codex-mcp.json`
- `mcp.json`

Two server definition formats are supported: legacy `"servers"` array and Claude-style `"mcpServers"` object.

### Transport: stdio

The `_StdioMCPConnection` class manages bidirectional communication by:

1. Spawning a subprocess with stdin/stdout/stderr pipes
2. Registering file descriptors with a selector for non-blocking I/O
3. Performing protocol initialization via JSON-RPC `initialize` method
4. Correlating request-response pairs via incrementing IDs
5. Enforcing timeout protection (default 10 seconds)

### Tool Invocation Flow

```
call_tool(name, arguments)
  → Resolve tool name to MCPTool instance
    → Locate associated MCPServerProfile
      → Construct JSON-RPC request
        → Send via _request_stdio()
          → Render response content
            → Return result with error metadata
```

### Resource Access

Three resource sources are supported:

| Source | Resolution |
|--------|------------|
| **Local files** | Paths resolved relative to manifest directory |
| **Inline content** | Text embedded directly in manifests |
| **Remote** | Via `resources/read` RPC method to stdio server |

## Search Runtime

The `search_runtime.py` module provides a provider-backed web search abstraction. Multiple search backends can be configured, and the active provider is switchable at runtime via the `search_activate_provider` tool.

Tools exposed: `search_status`, `search_list_providers`, `search_activate_provider`.

## Remote Runtime

The `remote_runtime.py` module manages remote profiles with connect/disconnect state. Profiles define remote targets, and the runtime tracks connection status.

Tools exposed: `remote_status`, `remote_list_profiles`, `remote_connect`, `remote_disconnect`.

Note: This implements *local* remote profile management only. Full remote session management with WebSocket infrastructure and bridge subsystem (30+ files in the npm implementation) is not yet implemented.

## Task Runtime

The `task_runtime.py` module provides persistent task management with full lifecycle support:

```
task_create → task_start → task_complete
                ↓
            task_block (with dependencies)
                ↓
            task_cancel (with reasoning)
```

Tasks support filtering by status, owner, and actionability. The `task_next` tool retrieves the next actionable task. Task dependencies enable workflow-like orchestration where blocked tasks automatically become actionable when their dependencies complete.

## Plan Runtime

The `plan_runtime.py` module manages multi-step implementation plans. Plans are separate from tasks — they represent high-level strategies that get broken down into concrete tasks.

Tools exposed: `plan_get`, `update_plan`, `plan_clear` (with task sync).

## Team Runtime

The `team_runtime.py` module enables local team collaboration:

- **Teams** — Named groups that can be created, listed, and deleted
- **Messages** — Persistent message exchange within teams via `send_message` and `team_messages`

This provides a communication layer for multi-agent workflows where delegated agents can coordinate through shared team channels.

## Worktree Runtime

The `worktree_runtime.py` module manages isolated git worktree sessions:

| Tool | Purpose |
|------|---------|
| `worktree_enter` | Create or switch to an isolated worktree |
| `worktree_exit` | Clean up with configurable actions (keep, merge, discard) |
| `worktree_status` | Report current session status |

Worktrees provide filesystem isolation for experimental changes, enabling agents to try risky modifications without affecting the main working directory.

## Workflow Runtime

The `workflow_runtime.py` module executes manifest-backed workflows:

| Tool | Purpose |
|------|---------|
| `workflow_list` | Discover available workflows |
| `workflow_get` | Render a single workflow |
| `workflow_run` | Execute with argument passing |

Workflows are defined declaratively and can be triggered automatically via the `remote_trigger` tool for CRUD operations and event-driven execution.

## Account Runtime

The account system manages ephemeral identity profiles:

| Tool | Purpose |
|------|---------|
| `account_status` | Current profile status |
| `account_list_profiles` | Discover configured profiles |
| `account_login` | Activate an identity |
| `account_logout` | Clear the session |

## Config Runtime

Configuration management via dotted paths:

| Tool | Purpose |
|------|---------|
| `config_list` | List merged or source-specific keys |
| `config_get` | Retrieve value by dotted path |
| `config_set` | Persist value with write validation |

## Tokenizer Runtime

The `tokenizer_runtime.py` module provides tokenizer-aware context accounting. It integrates with model-specific tokenizers to accurately estimate token counts, enabling precise budget enforcement and context window management.

## Footnotes

[^1]: [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)

## References

- [Claw Code Agent — plugin_runtime.py](https://github.com/HarnessLab/claw-code-agent/blob/main/src/plugin_runtime.py)
- [Claw Code Agent — mcp_runtime.py](https://github.com/HarnessLab/claw-code-agent/blob/main/src/mcp_runtime.py)
- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)
