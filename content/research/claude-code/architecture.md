---
title: "Architecture"
weight: 2
---


## The Agentic Loop

Claude Code operates on an **agentic loop** — a cycle of reasoning, tool use, and observation:

1. **User prompt** — The user provides a task or question.
2. **Gather context** — Claude searches files, reads code, and builds understanding.
3. **Take action** — Claude edits files, runs commands, calls external tools.
4. **Verify results** — Claude runs tests, checks output, compares to expectations.
5. **Iterate** — Steps 2–4 repeat, course-correcting based on failures, until the task is complete.
6. **Response** — Claude presents the final result to the user.

The user is part of this loop — you can interrupt at any point to steer, provide context, or try a different approach. Press `Esc` to interrupt a running action.

## Tool System

Tools make Claude Code agentic. Without them, Claude could only respond with text. Five categories:

### File Operations

| Tool | Purpose |
|------|---------|
| `Read` | Read file contents (supports code, images, PDFs, Jupyter notebooks) |
| `Edit` | Make targeted string replacements in files |
| `Write` | Create new files or fully rewrite existing ones |
| `Glob` | Find files by pattern (e.g., `**/*.ts`) |
| `NotebookEdit` | Edit Jupyter notebook cells |

### Search

| Tool | Purpose |
|------|---------|
| `Grep` | Search file contents with regex (built on ripgrep) |
| `Glob` | Find files by name/path pattern |

### Execution

| Tool | Purpose |
|------|---------|
| `Bash` | Execute arbitrary shell commands |

### Web

| Tool | Purpose |
|------|---------|
| `WebFetch` | Fetch and process web content |
| `WebSearch` | Search the web for information |

### Orchestration

| Tool | Purpose |
|------|---------|
| `Agent` | Launch sub-agents for parallel or isolated work |
| `TodoWrite` | Track task progress in a structured list |
| `AskUserQuestion` | Get clarification or decisions from the user |

Tools can be called **in parallel** when their inputs are independent, improving throughput on complex tasks. Claude chooses which tools to use based on the prompt and what it learns at each step.

**Example tool chain** for "fix failing tests":
1. `Bash` — Run test suite, see what's failing
2. `Read` — Read error output, understand the issue
3. `Grep` / `Glob` — Search for relevant files
4. `Read` — Read files for context
5. `Edit` — Implement the fix
6. `Bash` — Run tests again to verify

## Sub-Agents

The `Agent` tool spawns specialized sub-agents that run as child processes with their own context windows:

| Agent Type | Purpose | Tools Available |
|------------|---------|-----------------|
| **Explore** | Fast codebase exploration | Glob, Grep, Read (read-only) |
| **Plan** | Architecture and implementation planning | All read tools |
| **general-purpose** | Full tool access for complex sub-tasks | All tools |
| **claude-code-guide** | Documentation and usage guidance | Read, Web tools |

**Execution modes:**
- **Foreground** — Blocking; use when results are needed immediately.
- **Background** — Non-blocking; for independent parallel work. You're notified on completion.
- **Worktree isolation** — `isolation: "worktree"` gives the agent an isolated git worktree copy of the repo.

**Custom sub-agents** can be created via `/agents` or by placing `AGENT.md` files in `~/.claude/agents/` or `.claude/agents/`. Custom agents support:
- Tool whitelisting/blacklisting
- Model selection (sonnet, opus, haiku)
- Persistent memory across sessions
- Lifecycle hooks
- MCP server access

**When to use sub-agents vs. main conversation:**
- **Sub-agents**: Verbose output, context isolation, restricted tools, parallel work
- **Main conversation**: Frequent back-and-forth, shared context across phases

## Context Management

Claude Code automatically manages its context window:

- **Auto-compaction** — When approaching ~95% of context limits, Claude automatically clears old tool outputs first, then summarizes the conversation. CLAUDE.md instructions are preserved through compaction.
- **On-demand reading** — Files are read on-demand rather than pre-loaded, keeping context focused.
- **Manual compaction** — The `/compact` command manually summarizes the conversation. Use `/compact focus on X` to re-focus context on a specific topic.
- **Context inspection** — `/context` shows what's consuming context space.
- **Cost tracking** — Token usage and costs are displayed per session via `/cost`.

### Context Cost by Feature

| Feature | When Loaded | Cost | Best For |
|---------|-------------|------|----------|
| CLAUDE.md | Session start | Every request | Always-on rules |
| Skills | Start (description) + invocation (content) | Low → High | On-demand knowledge |
| MCP servers | Session start (tool definitions) | Every request | External connections |
| Sub-agents | On spawn | Isolated context | Context isolation |
| Hooks | On event | Zero (unless returns output) | Automation |

## Execution Environments

Claude Code runs in three environments:

| Environment | Where Code Runs | Use Case |
|-------------|-----------------|----------|
| **Local** | Your machine | Default; full access to files, tools, environment |
| **Cloud** | Anthropic-managed VMs | Offload tasks; work on repos you don't have locally |
| **Remote Control** | Your machine, controlled from browser | Web UI while keeping everything local |

## Model Usage

- **Claude Sonnet** — Default for most coding tasks; good balance of speed and capability.
- **Claude Opus** — Stronger reasoning for complex architectural decisions.
- **Claude Haiku** — Fast and cheap for simple tasks; used by Explore sub-agents.
- Switch with `/model` during a session or `claude --model <name>` at startup.
- Sub-agents may use different models depending on task complexity.

## Safety Mechanisms

- **Checkpoints** — Every file edit is reversible. Press `Esc` twice to rewind to previous state, or ask Claude to undo.
- **Permission prompts** — Dangerous operations require explicit approval.
- **Plan mode** — Claude uses read-only tools only, creates a plan you can approve before execution.
- **Sandboxing** — Optional filesystem and network restrictions via settings.
