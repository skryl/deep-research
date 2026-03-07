# SDK and Automation

## Headless Mode

Claude Code can run non-interactively for scripting and automation:

```bash
# Simple one-shot prompt
claude -p "explain this function" --output-format json

# Pipe input
echo "fix the linting errors" | claude -p

# With specific files as context
claude -p "review this file for security issues" < src/auth.ts
```

**Flags for headless mode:**

| Flag | Purpose |
|------|---------|
| `-p` / `--print` | Run in non-interactive (headless) mode |
| `--output-format` | Output format: `text`, `json`, `stream-json` |
| `--max-turns` | Limit the number of agentic loop iterations |
| `--allowedTools` | Restrict which tools Claude can use |
| `--permission-mode` | Set permission behavior for the run |

## CI/CD Integration

Claude Code can be embedded in CI pipelines for automated tasks:

**GitHub Actions example:**
```yaml
- name: AI Code Review
  run: |
    claude -p "review the diff for this PR and post comments" \
      --output-format json \
      --max-turns 10 \
      --permission-mode permissive
```

**Use cases in CI:**
- Automated code review on PRs
- Generating changelogs from commit history
- Fixing lint/type errors automatically
- Updating documentation when code changes
- Triaging and labeling issues

## Claude Code SDK (TypeScript)

The SDK allows programmatic control of Claude Code from Node.js applications:

```typescript
import { claude } from "@anthropic-ai/claude-code";

const result = await claude({
  prompt: "refactor the auth module to use dependency injection",
  options: {
    maxTurns: 20,
    allowedTools: ["Read", "Edit", "Write", "Glob", "Grep"],
    cwd: "/path/to/project",
  },
});

console.log(result.output);
```

**SDK capabilities:**
- Start and manage Claude Code sessions programmatically
- Stream tool calls and responses in real-time
- Control permissions and allowed tools
- Set working directory and environment
- Handle multi-turn conversations

## Multi-Agent Patterns

The SDK enables building multi-agent systems where multiple Claude Code instances coordinate:

```typescript
// Orchestrator pattern: one agent plans, others execute
const plan = await claude({ prompt: "plan the migration to TypeScript" });

// Fan out to parallel workers
const tasks = parsePlan(plan.output);
await Promise.all(
  tasks.map((task) =>
    claude({
      prompt: task.description,
      options: { cwd: task.directory },
    })
  )
);
```

**Patterns:**
- **Orchestrator** — One agent plans, spawns workers for execution
- **Pipeline** — Agents in sequence, each refining the previous output
- **Review loop** — One agent writes code, another reviews, iterate until approved

## Custom Tooling via MCP

For domain-specific automation, expose custom tools via MCP servers:

```typescript
// Custom MCP server that provides a "deploy" tool
server.tool("deploy", { environment: "staging" }, async (params) => {
  const result = await deployToEnvironment(params.environment);
  return { status: result.status, url: result.url };
});
```

Claude can then invoke `deploy` like any other tool, enabling end-to-end automation from code change through deployment.
