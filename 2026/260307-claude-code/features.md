# Core Features

## Slash Commands

Claude Code provides built-in slash commands for controlling the session:

| Command | Description |
|---------|-------------|
| `/help` | Show help and usage information |
| `/compact` | Compress conversation to free context space |
| `/clear` | Clear conversation history |
| `/model` | Switch between Claude models |
| `/fast` | Toggle fast output mode |
| `/permissions` | Review and manage tool permissions |
| `/memory` | Edit CLAUDE.md memory files |
| `/cost` | Show token usage and cost for the session |
| `/review` | Request a code review |
| `/pr-comments` | View PR comments |
| `/init` | Initialize a new project with CLAUDE.md |

Users can also create **custom slash commands** by placing markdown files in `.claude/commands/` (project-scoped) or `~/.claude/commands/` (global). These become available as `/<filename>` and can contain prompt templates with `$ARGUMENTS` placeholders.

## Permissions Model

Claude Code has a layered permissions system that controls what actions require user approval:

**Permission Modes:**
- **Default** — Most actions require approval; read-only operations are allowed.
- **Relaxed** — Common safe operations (file edits, known commands) are auto-approved.
- **Custom** — User-defined rules for what to allow or deny.

**Permission Configuration:**
```json
{
  "permissions": {
    "allow": ["Read", "Glob", "Grep", "WebSearch"],
    "deny": ["Bash(rm *)"]
  }
}
```

Permissions can be set globally (`~/.claude/settings.json`), per-project (`.claude/settings.json`), or per-session.

## Memory with CLAUDE.md

CLAUDE.md files serve as persistent memory and instructions for Claude Code. They are loaded automatically at the start of each session:

| Location | Scope | Use Case |
|----------|-------|----------|
| `./CLAUDE.md` | Project root | Project conventions, architecture, build commands |
| `./src/CLAUDE.md` | Subdirectory | Module-specific instructions |
| `~/.claude/CLAUDE.md` | Global | Personal preferences across all projects |

**Common CLAUDE.md contents:**
- Build and test commands (`npm test`, `cargo build`)
- Code style conventions (naming, formatting)
- Architecture overview and key abstractions
- Frequently used workflows
- Things to avoid or watch out for

CLAUDE.md files are injected into the system prompt, so they influence every interaction within their scope.

## IDE Integration

Claude Code integrates with popular editors:

- **VS Code** — Official extension providing an embedded Claude Code panel alongside the editor. Supports sending selected code, viewing inline diffs, and accepting/rejecting changes.
- **JetBrains IDEs** — Plugin available for IntelliJ, PyCharm, WebStorm, etc. with similar capabilities.

IDE integrations communicate with the Claude Code CLI process, so all configuration (permissions, CLAUDE.md, hooks) applies consistently.

## Git Integration

Claude Code has deep git awareness:

- Reads git status, diffs, and logs to understand current state
- Creates commits with descriptive messages
- Creates branches and pull requests via `gh` CLI
- Respects uncommitted work and avoids destructive operations by default
- Can be used for code review workflows
