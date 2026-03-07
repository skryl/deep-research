# Architecture

## The Agentic Loop

Claude Code operates on an **agentic loop** — a cycle of reasoning, tool use, and observation:

1. **User prompt** — The user provides a task or question.
2. **Model reasoning** — Claude analyzes the prompt and decides what action to take.
3. **Tool invocation** — Claude calls one or more tools (read file, edit file, run bash, search, etc.).
4. **Observation** — Tool results are fed back into the model's context.
5. **Iteration** — Steps 2–4 repeat until the task is complete.
6. **Response** — Claude presents the final result to the user.

This loop allows Claude to handle complex, multi-step tasks that require exploration, trial-and-error, and incremental progress — much like a human developer would work.

## Tool System

Claude Code exposes a set of built-in tools that the model can invoke:

| Tool | Purpose |
|------|---------|
| `Read` | Read file contents (supports code, images, PDFs, notebooks) |
| `Edit` | Make targeted string replacements in files |
| `Write` | Create new files or fully rewrite existing ones |
| `Bash` | Execute arbitrary shell commands |
| `Glob` | Find files by pattern (e.g., `**/*.ts`) |
| `Grep` | Search file contents with regex |
| `WebFetch` | Fetch and process web content |
| `WebSearch` | Search the web for information |
| `Agent` | Launch sub-agents for parallel or isolated work |
| `TodoWrite` | Track task progress in a structured list |
| `NotebookEdit` | Edit Jupyter notebook cells |

Tools can be called in parallel when their inputs are independent, improving throughput on complex tasks.

## Sub-Agents

The `Agent` tool spawns specialized sub-agents that run as child processes with their own context windows. Agent types include:

- **Explore** — Fast codebase exploration (glob, grep, read)
- **Plan** — Architecture and implementation planning
- **general-purpose** — Full tool access for complex sub-tasks
- **claude-code-guide** — Documentation and usage guidance

Sub-agents can run in the **foreground** (blocking, when results are needed immediately) or **background** (non-blocking, for independent work). They can also use **git worktrees** for isolated file changes.

## Context Management

Claude Code automatically manages its context window:

- **Automatic compression** — When approaching context limits, prior messages are compressed to preserve the most relevant information.
- **File reading** — Files are read on-demand rather than pre-loaded, keeping context focused.
- **Cost tracking** — Token usage and costs are displayed per session.
- **Session continuity** — The `/compact` command manually summarizes and compresses the conversation to free context space.

## Model Usage

- Claude Code is powered by Claude's latest models (Opus, Sonnet, Haiku).
- Users can toggle between models and speed modes (e.g., `/model` to switch, `/fast` for faster output).
- Sub-agents may use different models depending on the task complexity.
