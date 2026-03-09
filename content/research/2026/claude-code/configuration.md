---
title: "Configuration"
weight: 3
---


## Settings File Hierarchy

Claude Code uses a hierarchy of JSON settings files. Higher precedence overrides lower:

| Priority | File | Scope | Managed By |
|----------|------|-------|------------|
| 1 (highest) | Managed settings (system dirs) | Organization-wide | IT/DevOps |
| 2 | Command-line arguments | Invocation | User |
| 3 | `.claude/settings.local.json` | Project (gitignored) | User |
| 4 | `.claude/settings.json` | Project (committed) | Team |
| 5 (lowest) | `~/.claude/settings.json` | Global | User |

**Managed settings locations:**
- Linux/WSL: `/etc/claude-code/settings.json`
- macOS: `/Library/Application Support/ClaudeCode/settings.json`
- Windows: `C:\Program Files\ClaudeCode\settings.json`

## Key Settings

### Permissions
```json
{
  "permissions": {
    "allow": [
      "Bash(npm run test *)",
      "Bash(git commit *)",
      "Read(~/.zshrc)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force)",
      "Read(./.env)"
    ],
    "ask": ["WebFetch"]
  },
  "defaultMode": "default"
}
```

### Model Selection
```json
{
  "model": "claude-sonnet-4-6",
  "modelRestrictions": ["claude-sonnet-4-6", "claude-opus-4-6"]
}
```

### Tool Restrictions
```json
{
  "tools": "Bash,Edit,Read",
  "disallowedTools": ["WebFetch", "WebSearch"]
}
```

### Environment Variables
```json
{
  "env": {
    "NODE_ENV": "development",
    "DEBUG": "1"
  }
}
```

### Memory
```json
{
  "autoMemoryEnabled": true,
  "claudeMdExcludes": ["**/other-team/**"]
}
```

### Sandboxing
```json
{
  "sandbox": {
    "enabled": true,
    "filesystem": {
      "allowWrite": ["/tmp/build", "~/.kube"],
      "denyRead": ["~/.aws/credentials"]
    },
    "network": {
      "allowedDomains": ["github.com", "*.npmjs.org"]
    }
  }
}
```

### Attribution (for PRs/commits)
```json
{
  "attribution": {
    "commit": "Implemented with Claude Code",
    "pullRequest": "Created with Claude Code"
  }
}
```

### Output Style
```json
{
  "outputStyle": "concise"
}
```

## Hooks

Hooks are user-defined commands that execute at specific points in the agentic loop.

### Hook Events

| Hook | Trigger | Can Block? |
|------|---------|------------|
| `SessionStart` | Session begins or resumes | No |
| `UserPromptSubmit` | Before Claude processes your prompt | No |
| `PreToolUse` | Before a tool executes | Yes (exit 2) |
| `PostToolUse` | After a tool succeeds | No |
| `PostToolUseFailure` | After a tool fails | No |
| `PermissionRequest` | Permission dialog appears | No |
| `Notification` | Claude needs input | No |
| `SubagentStart` | Sub-agent spawned | No |
| `SubagentStop` | Sub-agent finishes | No |
| `Stop` | Claude finishes responding | No |
| `TaskCompleted` | Task marked complete | No |
| `InstructionsLoaded` | CLAUDE.md loaded | No |
| `ConfigChange` | Config file changes | No |

### Hook Types

| Type | Description |
|------|-------------|
| `command` | Run a shell script (deterministic) |
| `prompt` | Single LLM call for yes/no decisions |
| `agent` | Multi-turn sub-agent for verification |
| `http` | POST to an external service |

### Hook Configuration Example

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'About to run: $TOOL_INPUT'"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write $(jq -r '.tool_input.file_path')"
          }
        ]
      }
    ]
  }
}
```

### Hook Decision Control

- **Exit 0** — Action proceeds normally
- **Exit 2** — Block the action (stderr sent to Claude as the reason)
- **JSON output** — Structured decisions: `allow`, `deny`, `ask`

### Common Hook Patterns

```bash
# Auto-format after file edits
jq -r '.tool_input.file_path' | xargs prettier --write

# Block writes to protected files
if [[ "$FILE_PATH" == *.git* ]] || [[ "$FILE_PATH" == .env* ]]; then
  echo "Cannot modify protected file" >&2
  exit 2
fi

# Log every Bash command
jq -r '.tool_input.command' >> ~/.claude/command-log.txt

# Desktop notification when Claude needs input
osascript -e 'display notification "Claude needs input" with title "Claude Code"'
```

## MCP Servers

The **Model Context Protocol (MCP)** connects Claude Code to external tools and data sources via a standardized protocol.

### Transport Types

| Type | Use Case | Example |
|------|----------|---------|
| `http` | Remote servers (recommended) | `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp` |
| `sse` | Remote servers (deprecated) | `claude mcp add --transport sse asana https://mcp.asana.com/sse` |
| `stdio` | Local servers | `claude mcp add --transport stdio db -- npx db-mcp-server` |

### Configuration Scopes

| Scope | Location | Shared? |
|-------|----------|---------|
| Local (default) | `~/.claude.json` | No |
| Project | `.mcp.json` | Yes (via git) |
| User | `~/.claude.json` | No |

Precedence: Local > Project > User (when same name exists).

### Project MCP Configuration (`.mcp.json`)

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "database": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/db-server.js"],
      "env": {
        "DB_URL": "postgresql://localhost/mydb"
      }
    }
  }
}
```

### MCP Use Cases

- Implement features from issue trackers: "Add JIRA issue ENG-4521 and create PR"
- Analyze monitoring data: "Check Sentry for errors in feature ENG-4521"
- Query databases: "Find emails of 10 random users from PostgreSQL"
- Integrate designs: "Update email template based on new Figma designs"
- Automate workflows: "Create Gmail drafts inviting these users"

### Tool Search

When many MCP servers are connected (tool definitions > 10% of context), **Tool Search** activates automatically — deferring tool loading until needed, keeping context lean.

### Management Commands

```bash
claude mcp list                    # List all servers
claude mcp get github              # Server details
claude mcp remove github           # Remove server
/mcp                               # Manage in-session
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | API key for authentication |
| `CLAUDE_CODE_USE_BEDROCK` | Use AWS Bedrock as provider |
| `CLAUDE_CODE_USE_VERTEX` | Use Google Vertex AI as provider |
| `DISABLE_COST_WARNINGS` | Suppress cost warning messages |
| `ENABLE_TOOL_SEARCH` | Configure tool search threshold (e.g., `auto:5`) |

## Credential Storage

- **OAuth tokens** stored in `~/.claude.json` (auto-created, never commit to git)
- **macOS/Windows**: System keychain
- **Linux**: Credentials file
- Rotate tokens in Anthropic Console account settings

## References

- [Claude Code Settings](https://docs.anthropic.com/en/docs/claude-code/settings)
- [Claude Code Hooks](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [Claude Code MCP](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [Claude Code Permissions](https://docs.anthropic.com/en/docs/claude-code/security#permissions)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP Server Registry](https://github.com/modelcontextprotocol/servers)
