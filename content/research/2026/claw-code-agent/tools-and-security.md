---
title: "Tools and Security"
weight: 2
---

## Tool System Architecture

Tools are what make the agent agentic. The `agent_tools.py` module defines a modular execution framework where each tool is an `AgentTool` dataclass with a name, description, JSON schema parameters, and a handler function.

### Tool Execution Flow

```
Model requests tool call
  → Look up tool by name in registry
    → Preflight checks (plugin hooks, policy validation)
      → Permission enforcement (read/write/shell gates)
        → Execute handler with arguments and context
          → Post-execution hooks (result injection, metadata)
            → Return ToolExecutionResult to session
```

The `ToolExecutionContext` (frozen dataclass) provides each handler with: root workspace path, command timeouts, permission flags, and references to all runtime systems (search, accounts, MCP, etc.).

### Tool Registry

Claw Code Agent ships 60+ built-in tools organized into categories:

#### File Operations

| Tool | Purpose |
|------|---------|
| `list_dir` | Directory listing with pagination |
| `read_file` | File reading with line range support |
| `write_file` | File creation with SHA256 tracking |
| `edit_file` | Text replacement with occurrence counting |
| `notebook_edit` | Jupyter notebook cell manipulation |

#### Search and Retrieval

| Tool | Purpose |
|------|---------|
| `glob_search` | File pattern matching |
| `grep_search` | Regex/literal text search across files |
| `web_fetch` | HTTP/HTTPS resource retrieval |
| `web_search` | Multi-provider web search |
| `tool_search` | Tool registry discovery |

#### Execution

| Tool | Purpose |
|------|---------|
| `bash` | Shell command execution with timeout and security validation |
| `sleep` | Bounded wait (0–5 seconds max) |

#### Account and Configuration

| Tool | Purpose |
|------|---------|
| `account_status` | Profile status display |
| `account_login` / `account_logout` | Identity activation/clearing |
| `config_list` / `config_get` / `config_set` | Configuration management via dotted paths |

#### MCP Integration

| Tool | Purpose |
|------|---------|
| `mcp_list_resources` | Resource discovery |
| `mcp_read_resource` | URI-based resource retrieval |
| `mcp_list_tools` | Exposed tool enumeration |
| `mcp_call_tool` | Tool invocation over transport |

#### Task and Planning

| Tool | Purpose |
|------|---------|
| `task_list` / `task_get` / `task_create` / `task_update` | Full task lifecycle |
| `task_start` / `task_complete` / `task_block` / `task_cancel` | Status transitions |
| `plan_get` / `update_plan` / `plan_clear` | Multi-step plan management |
| `todo_write` | Bulk todo list replacement |

#### Collaboration

| Tool | Purpose |
|------|---------|
| `team_list` / `team_create` / `team_delete` | Team management |
| `send_message` / `team_messages` | Message persistence and history |
| `delegate_agent` | Nested agent delegation |
| `ask_user_question` | Interactive user prompts |

#### Infrastructure

| Tool | Purpose |
|------|---------|
| `worktree_enter` / `worktree_exit` / `worktree_status` | Git worktree management |
| `workflow_list` / `workflow_run` | Manifest-backed workflow execution |
| `remote_connect` / `remote_disconnect` / `remote_status` | Remote profile management |
| `search_activate_provider` / `search_list_providers` | Search backend switching |

### Output Management

Large tool outputs are handled by `_truncate_output()`, which splits content into head and tail sections. `_snapshot_text()` normalizes whitespace and clips at 240 characters for previews. All output respects the `max_output_chars` context limit.

## Permission Model

Permissions are enforced at the tool level through a tiered system:

| Tier | Flag | Allows |
|------|------|--------|
| **Read-only** | (default) | `list_dir`, `read_file`, `glob_search`, `grep_search` |
| **Write** | `--allow-write` | File creation, editing, and deletion |
| **Shell** | `--allow-shell` | Shell command execution |
| **Unsafe** | `--unsafe` | Destructive operations (force push, rm -rf, etc.) |

Permission checks are enforced by two gate functions:

- `_ensure_write_allowed()` — Verifies `allow_file_write` before any file modification
- `_ensure_shell_allowed()` — Validates command safety and checks `allow_shell_commands`

Three exception types enforce safety boundaries:

| Exception | Trigger |
|-----------|---------|
| `ToolPermissionError` | Permission tier violation |
| `ToolExecutionError` | Invalid input or state |
| `OSError` / `SubprocessError` | System-level failures |

All exceptions return structured `ToolExecutionResult` with metadata for the agent to reason about.

## Bash Security System

The `bash_security.py` module is one of the most sophisticated components, implementing 18 validators with 163 tests. Every shell command passes through this system before execution.

### Validation Architecture

The `bash_command_is_safe()` entry point constructs a `ValidationContext`:

```python
ValidationContext
├── original_command        # Raw input
├── base_command            # First token
├── unquoted_content        # Text outside single quotes
├── fully_unquoted_content  # Text outside all quotes, redirections stripped
└── unquoted_keep_quote_chars  # Preserves quote chars for analysis
```

### Security Outcomes

| Outcome | Meaning |
|---------|---------|
| `ALLOW` | Safe command, auto-approve |
| `ASK` | Requires user confirmation |
| `DENY` | Blocked outright |
| `PASSTHROUGH` | Check passed, continue to next validator |

### Injection and Obfuscation Detection

The system blocks multiple attack vectors:

- **Command substitution** — Backticks, `$()`, `${}`, and process substitution `<()`
- **ANSI-C quoting** — `$'...'` patterns that can hide characters
- **Zsh-specific expansions** — Format-specific shell escapes
- **IFS manipulation** — Internal Field Separator attacks
- **Process environment access** — `/proc/*/environ` reads

### Parser-Differential Detection

Validators detect scenarios where different shells would interpret commands differently:

- Control characters (0x00–0x08, 0x0E–0x1F, 0x7F)
- Carriage returns outside quoted strings
- Unicode whitespace characters
- Backslash-escaped operators/whitespace
- Mid-word hash characters in unquoted context

Misparsing concerns take higher priority than other issues and are blocked even when marked for user confirmation.

### Destructive Command Detection

The `get_destructive_command_warning()` function matches against 20+ patterns:

| Category | Examples |
|----------|----------|
| **Git** | `reset --hard`, `push --force`, `clean -f`, `stash drop` |
| **Files** | Recursive `rm -rf` |
| **Database** | `DROP TABLE`, `DELETE FROM` |
| **Infrastructure** | `kubectl delete`, `terraform destroy` |

### Special Command Handling

Certain commands receive bespoke validation:

| Command | Safe When | Dangerous When |
|---------|-----------|----------------|
| `git commit` | Simple `-m 'message'` | Complex flags |
| `jq` | Normal filters | Contains `system()` |
| `sed` | Stream mode | In-place editing (`-i`) |
| `find` | Basic search | `-exec`, `-delete` flags |
| `python` / `node` | `--version`, `--help`, `-c` | Arbitrary scripts |

### Validation Flow

1. **Early validators** check for empty commands, incomplete fragments, and known-safe patterns
2. **Main validators** run sequentially, deferring non-misparsing concerns
3. **Misparsing validators** return immediately with higher priority
4. **Deferred results** are evaluated only if no misparsing issues were detected

The final gate, `check_shell_security()`, enforces shell enablement flags and returns an `(allowed: bool, message: str)` tuple to the tool execution layer.

## Hook Policy System

The `hook_policy.py` module provides manifest-based security policies that layer on top of the permission model.

### Policy Manifests

`HookPolicyManifest` dataclasses store configuration across multiple domains:

| Field | Purpose |
|-------|---------|
| `managed_settings` | Key-value pairs for configuration control |
| `safe_env_names` | Environment variables permitted for access |
| `budget_overrides` | Token and cost limit adjustments |
| `deny_tools` | Exact-match tool blocking |
| `deny_tool_prefixes` | Prefix-based tool blocking |
| Hook messages | Injected guidance at various execution phases |

### Trust Determination

The `is_trusted()` method evaluates all loaded manifests, returning the last explicit trust value. If no manifest sets trust explicitly, the system defaults to trusted.

### Tool Denial

`denied_tool_message()` checks two mechanisms:

1. **Exact match** — Lowercased tool name against `deny_tools` tuple
2. **Prefix match** — Tool name against `deny_tool_prefixes` entries

When blocked, the system returns a message identifying the tool and responsible policy file.

### Hook Execution Points

| Phase | Method | Purpose |
|-------|--------|---------|
| Before tool | `before_tool_messages()` | Preflight guidance injection |
| After tool | `after_tool_messages()` | Postflight result augmentation |
| Wildcard | `'*'` key routing | Default messages for all tools |

Messages concatenate across all applicable manifests, enabling layered policy composition.

## References

- [Claw Code Agent — agent_tools.py](https://github.com/HarnessLab/claw-code-agent/blob/main/src/agent_tools.py)
- [Claw Code Agent — bash_security.py](https://github.com/HarnessLab/claw-code-agent/blob/main/src/bash_security.py)
- [Claw Code Agent — hook_policy.py](https://github.com/HarnessLab/claw-code-agent/blob/main/src/hook_policy.py)
- [OWASP Command Injection](https://owasp.org/www-community/attacks/Command_Injection)
