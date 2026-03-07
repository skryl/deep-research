# Configuration

## Settings Files

Claude Code uses a hierarchy of JSON settings files:

| File | Scope | Managed By |
|------|-------|------------|
| `~/.claude/settings.json` | Global (all projects) | User |
| `.claude/settings.json` | Project (committed to repo) | Team |
| `.claude/settings.local.json` | Project (gitignored) | User |

Settings control permissions, allowed/denied tools, environment variables, and more.

**Example settings.json:**
```json
{
  "permissions": {
    "allow": [
      "Read",
      "Edit",
      "Write",
      "Glob",
      "Grep",
      "Bash(npm test)",
      "Bash(npm run lint)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force)"
    ]
  },
  "env": {
    "NODE_ENV": "development"
  }
}
```

## Hooks

Hooks are user-defined shell commands that execute at specific points in the agentic loop. They allow extending Claude Code's behavior without modifying the tool itself.

**Hook Types:**

| Hook | Trigger |
|------|---------|
| `PreToolUse` | Before a tool is executed |
| `PostToolUse` | After a tool completes |
| `Notification` | When Claude sends a notification |
| `Stop` | When Claude finishes a response |
| `SessionStart` | When a new session begins |

**Example hook configuration** (in settings.json):
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
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write $FILE_PATH"
          }
        ]
      }
    ]
  }
}
```

Hooks receive context via environment variables and can:
- **Block** tool execution (exit non-zero from PreToolUse)
- **Transform** inputs or outputs
- **Run side effects** (linting, formatting, notifications)

## MCP Servers

The **Model Context Protocol (MCP)** allows Claude Code to connect to external tools and data sources via a standardized protocol.

**Configuration** (in settings or `.mcp.json`):
```json
{
  "mcpServers": {
    "my-database": {
      "command": "npx",
      "args": ["@my-org/db-mcp-server"],
      "env": {
        "DB_CONNECTION": "postgresql://localhost/mydb"
      }
    },
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

MCP servers expose additional tools that Claude can invoke just like built-in tools. Common MCP servers provide access to databases, APIs, file systems, and specialized domain tools.

## Environment Variables

Key environment variables:

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | API key for authentication |
| `CLAUDE_CODE_USE_BEDROCK` | Use AWS Bedrock as the provider |
| `CLAUDE_CODE_USE_VERTEX` | Use Google Vertex AI as the provider |
| `DISABLE_COST_WARNINGS` | Suppress cost warning messages |
