---
title: "Core Features"
weight: 1
---


## Slash Commands

Type `/` in a session to see available commands:

| Command | Description |
|---------|-------------|
| `/help` | Show available commands |
| `/resume` | Pick a previous conversation to continue |
| `/continue` | Continue most recent session (also `-c` flag) |
| `/context` | See what's consuming context space |
| `/memory` | View and manage CLAUDE.md files and auto memory |
| `/init` | Generate a CLAUDE.md for your project |
| `/agents` | Create and manage custom sub-agents |
| `/permissions` | View and manage tool permissions |
| `/hooks` | Create and manage automation hooks |
| `/mcp` | Connect MCP servers |
| `/compact` | Manually compress context |
| `/model` | Switch between Claude models |
| `/fast` | Toggle fast output mode |
| `/status` | View session info |
| `/doctor` | Diagnose common issues |
| `/cost` | Track token usage and costs |
| `/clear` | Clear conversation history |
| `/login` | Switch accounts mid-session |

**Bundled skills** (invoke like slash commands): `/simplify`, `/batch`, `/debug`, `/loop`, `/claude-api`

### Custom Slash Commands (Skills)

Users can create custom commands by placing markdown files in:
- `.claude/skills/<name>/SKILL.md` — Project-scoped (shared via git)
- `~/.claude/skills/<name>/SKILL.md` — Global (personal)

These become available as `/<name>` and support:
- `$ARGUMENTS` placeholders for parameters
- `!`command`` syntax for dynamic context injection (shell output)
- Frontmatter for model, tools, and behavior control
- Supporting files organized in the skill directory

**Example:**
```yaml
---
name: fix-issue
description: Fix a GitHub issue
allowed-tools: Bash, Read, Edit, Write, Grep, Glob
---

Fix GitHub issue $ARGUMENTS following project standards.
1. Read the issue: !`gh issue view $0`
2. Implement the fix
3. Run tests
4. Commit with descriptive message
```

Invoke with `/fix-issue 123`.

## Permissions Model

Claude Code has a layered permissions system controlling what actions require user approval.

### Permission Modes

| Mode | Behavior |
|------|----------|
| `default` | Asks on first use of each tool type |
| `acceptEdits` | Auto-accepts file edits, asks for shell commands |
| `plan` | Read-only analysis only (no modifications) |
| `dontAsk` | Auto-denies unless pre-approved in rules |
| `bypassPermissions` | Skips all checks (use with extreme caution) |

### Permission Rules

Configured in settings files with allow/deny/ask lists:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run test *)",
      "Bash(git commit *)",
      "Read(~/.zshrc)"
    ],
    "deny": [
      "Bash(git push *)",
      "Read(./.env)",
      "Read(./secrets/**)"
    ],
    "ask": [
      "WebFetch"
    ]
  }
}
```

### Rule Syntax

| Pattern | Matches |
|---------|---------|
| `Bash` | All bash commands |
| `Bash(npm run build)` | Exact command |
| `Bash(npm run *)` | Commands starting with `npm run ` |
| `Bash(* --help)` | Commands ending with ` --help` |
| `Read(./.env)` | Specific file |
| `Read(/src/**)` | Directory patterns |
| `WebFetch(domain:github.com)` | Specific domain |
| `Edit(/docs/**)` | Edit operations on pattern |
| `Agent(Explore)` | Specific sub-agent type |
| `mcp__github__*` | All tools from an MCP server |

### Tool Safety Tiers

| Tier | Tools | Default Behavior |
|------|-------|-----------------|
| Read-only | Glob, Grep, Read | No approval needed |
| File modifications | Edit, Write | Ask on first use per session |
| Shell execution | Bash | Ask every time (unless pre-approved) |

## Memory

### CLAUDE.md Files (Explicit Memory)

CLAUDE.md files serve as persistent instructions loaded automatically at the start of each session:

| Location | Scope | Use Case |
|----------|-------|----------|
| `./CLAUDE.md` | Project root | Project conventions, architecture, build commands |
| `.claude/rules/*.md` | Project rules dir | Scoped rules (e.g., `testing.md`, `api-design.md`) |
| `./CLAUDE.local.md` | Project (gitignored) | Personal project overrides |
| `~/.claude/CLAUDE.md` | Global | Personal preferences across all projects |

**What to include:**
- Build and test commands (`npm test`, `cargo build`)
- Code style conventions (naming, formatting, indentation)
- Architecture overview and key abstractions
- "Never do X" rules
- Frequently used workflows

**Best practices:**
- Keep under 200 lines (every line costs tokens on every request)
- Use markdown headers and bullets for structure
- Be specific: "Use 2-space indentation" not "Format code properly"
- Move detailed reference material to skills (loaded on-demand)
- Use `@path/to/file` imports for additional context files
- Scope rules to file types with YAML frontmatter `paths:` field

### Auto Memory

Claude automatically saves learnings across sessions without explicit user action:

- **What it saves:** Build commands, debugging insights, architecture notes, code style preferences, workflow habits
- **Storage:** `~/.claude/projects/<project>/memory/MEMORY.md`
- **Loading:** First 200 lines load every session; full directory available on-demand
- **Scope:** Machine-local only (not shared across devices)
- **Control:** Enable/disable with `/memory` command or `autoMemoryEnabled` setting

## Sessions

- **Independent:** Each new session starts with fresh context (no conversation history from prior sessions).
- **Directory-tied:** Resume only shows sessions from the current directory.
- **Resume:** `claude --continue` resumes the most recent session; `claude -r <session-id>` resumes a specific one; `/resume` lets you pick interactively.
- **Fork:** `--fork-session` creates a new session with preserved history context.
- **Cross-branch:** When you switch git branches, files update but conversation history stays.
- **Parallel:** Use git worktrees to run parallel Claude Code sessions in separate directories.

## IDE Integration

### VS Code
- Official extension from the Marketplace (search "Claude Code")
- Embedded chat panel alongside the editor
- `@file` mentions to reference files
- Inline diffs and plan review
- Resume past conversations
- Full keyboard shortcuts

### JetBrains IDEs
- Plugin for IntelliJ, PyCharm, WebStorm, etc.
- Interactive diff viewing
- Selection context sharing
- WSL and remote development support

### Desktop App
- Visual diff review
- Multiple sessions side-by-side
- Schedule recurring tasks
- Cloud session management
- Remote Control support

### Browser (VS Code Web)
- No local setup needed
- Cloud execution
- `/teleport` to move between web and terminal

All interfaces share the same CLAUDE.md files, settings, MCP servers, skills, and sub-agents.

## Git Integration

Claude Code has deep git awareness:

- Reads git status, diffs, and logs to understand current state
- Creates commits with descriptive messages
- Creates branches and pull requests via `gh` CLI
- Respects uncommitted work and avoids destructive operations by default
- Supports code review workflows (`/review`, PR comment analysis)
- Checkpoints every file edit for easy rollback

## Chrome Extension

```bash
claude --chrome
```

Enables browser control for web testing, form filling, and debugging web applications.

## References

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Claude Code Slash Commands](https://docs.anthropic.com/en/docs/claude-code/cli-usage#slash-commands)
- [Claude Code Permissions](https://docs.anthropic.com/en/docs/claude-code/security#permissions)
- [Claude Code Memory (CLAUDE.md)](https://docs.anthropic.com/en/docs/claude-code/memory)
- [Claude Code IDE Integrations](https://docs.anthropic.com/en/docs/claude-code/ide-integrations)
- [Claude Code Skills](https://docs.anthropic.com/en/docs/claude-code/skills)
