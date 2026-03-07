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

# Limit iterations
claude -p "fix type errors" --max-turns 10
```

### Headless Flags

| Flag | Purpose |
|------|---------|
| `-p` / `--print` | Run in non-interactive (headless) mode |
| `--output-format` | Output format: `text`, `json`, `stream-json` |
| `--max-turns` | Limit the number of agentic loop iterations |
| `--model` | Specify model to use |
| `--allowedTools` | Restrict which tools Claude can use |
| `--permission-mode` | Set permission behavior for the run |
| `-c` / `--continue` | Continue most recent session |
| `-r` / `--resume` | Resume a specific session by ID |
| `--fork-session` | Fork an existing session into a new one |

## CI/CD Integration

### GitHub Actions

Anthropic provides an official GitHub Action:

```yaml
- name: AI Code Review
  uses: anthropic/claude-code@main
  with:
    prompt: "review the diff for this PR and post comments"
    output-format: json
    max-turns: 10
```

### Generic CI Pipeline

```bash
claude -p "run tests and fix any failures" \
  --output-format json \
  --max-turns 20 \
  --permission-mode bypassPermissions
```

### CI Use Cases

- **Automated code review** on pull requests
- **Fix lint/type errors** automatically before merge
- **Generate changelogs** from commit history
- **Update documentation** when code changes
- **Triage and label** issues based on content
- **Translate** strings and content files
- **Security scanning** with domain-specific context

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

### SDK Capabilities

- Start and manage Claude Code sessions programmatically
- Stream tool calls and responses in real-time
- Control permissions and allowed tools
- Set working directory and environment
- Handle multi-turn conversations
- Resume and fork sessions

## Multi-Agent Patterns

The SDK enables building multi-agent systems where multiple Claude Code instances coordinate:

### Orchestrator Pattern

One agent plans, others execute:

```typescript
const plan = await claude({ prompt: "plan the migration to TypeScript" });

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

### Pipeline Pattern

Agents in sequence, each refining the previous output:

```typescript
const implementation = await claude({ prompt: "implement the feature" });
const review = await claude({ prompt: `review this implementation: ${implementation.output}` });
const refined = await claude({ prompt: `address these review comments: ${review.output}` });
```

### Review Loop Pattern

One agent writes code, another reviews, iterate until approved:

```typescript
let code = await claude({ prompt: "implement user authentication" });
let approved = false;

while (!approved) {
  const review = await claude({ prompt: `review: ${code.output}` });
  if (review.output.includes("APPROVED")) {
    approved = true;
  } else {
    code = await claude({ prompt: `fix issues: ${review.output}` });
  }
}
```

## Custom Tooling via MCP

For domain-specific automation, expose custom tools via MCP servers that Claude can invoke like built-in tools:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({ name: "deploy-server" });

server.tool("deploy", { environment: z.string() }, async (params) => {
  const result = await deployToEnvironment(params.environment);
  return { content: [{ type: "text", text: `Deployed: ${result.url}` }] };
});

server.tool("rollback", { version: z.string() }, async (params) => {
  await rollbackToVersion(params.version);
  return { content: [{ type: "text", text: `Rolled back to ${params.version}` }] };
});
```

Claude can then invoke `deploy` and `rollback` like any other tool, enabling end-to-end automation from code change through deployment.

## Installation and Authentication

### Installation

```bash
# Recommended (auto-updates)
curl -fsSL https://claude.ai/install.sh | bash        # macOS/Linux/WSL
irm https://claude.ai/install.ps1 | iex               # Windows PowerShell

# Package managers (manual updates)
brew install --cask claude-code                         # Homebrew
winget install Anthropic.ClaudeCode                     # WinGet

# npm (deprecated)
npm install -g @anthropic-ai/claude-code
```

### Authentication

```bash
claude auth login                  # Browser-based OAuth (recommended)
claude auth login --sso            # Enterprise SSO
```

**Supported providers:**
- Claude Pro/Max/Teams/Enterprise subscriptions
- Anthropic Console (API key with credits)
- Amazon Bedrock (`CLAUDE_CODE_USE_BEDROCK=1`)
- Google Vertex AI (`CLAUDE_CODE_USE_VERTEX=1`)
