---
title: "Common Workflows"
weight: 4
---


## Exploring an Unfamiliar Codebase

```
> give me an overview of this codebase
> explain the main architecture patterns used here
> what are the key data models?
> how does authentication work?
```

Start broad, then narrow down. Claude reads files, follows imports, and builds up a mental model of the project. Use `/compact focus on X` afterward to re-focus context on a specific area.

## Fixing Bugs

```
> the login form crashes when the email field is empty — find and fix the bug
> there's a race condition in the payment processing — investigate and fix it
```

Claude's typical approach:
1. Search for relevant files (Grep/Glob)
2. Read context around the problem
3. Identify root cause
4. Implement the fix
5. Run tests to verify
6. Course-correct if tests still fail

For complex bugs, provide error messages, stack traces, or reproduction steps to help Claude narrow the search.

## Writing Tests

```
> write unit tests for the UserService class
> add integration tests for the /api/orders endpoints
> the calculateDiscount function has no test coverage — add comprehensive tests
```

Claude reads the implementation, understands the behavior, and generates tests covering happy paths, edge cases, and error conditions.

## Code Review

```
> review the changes in this PR
> /review
> review my changes and suggest improvements
```

Claude examines diffs, identifies potential issues (bugs, security vulnerabilities, style violations, performance concerns), and provides structured feedback.

## Refactoring

```
> refactor the auth module to use the repository pattern
> extract the validation logic from the controller into a separate service
> rename getUserData to fetchUserProfile across the codebase
```

Claude handles multi-file refactors, updating imports, references, and tests consistently.

## Git and PR Workflows

```
> commit these changes with a descriptive message
> create a PR for this feature branch
> look at the failing CI checks and fix them
```

Claude manages the full git lifecycle — staging, committing, branching, and PR creation via `gh` CLI.

## Multi-File Bulk Operations

```
> add TypeScript types to all the API route handlers
> migrate all class components to functional components with hooks
> update all imports to use the new module paths
```

Claude excels at repetitive changes that span many files, maintaining consistency across the codebase.

## Piping and Scripting

Claude Code follows Unix philosophy — composable with pipes:

```bash
# Analyze logs
tail -f app.log | claude -p "alert me if you see any anomalies"

# Review changed files
git diff main --name-only | claude -p "review these changed files for security issues"

# Translate content
cat strings.en.json | claude -p "translate to French"

# Automate in CI
claude -p "translate new strings into French and raise a PR for review"
```

## Parallel Work with Sub-Agents

For large tasks, Claude can spawn sub-agents to work in parallel:

```
> refactor the entire API layer to use dependency injection
```

Claude may:
1. Plan the approach in the main conversation
2. Spawn sub-agents for independent modules
3. Coordinate results back in the main context

You can also be explicit: "use a sub-agent to investigate the auth module while you work on the database layer."

## Tips for Effective Prompting

1. **Be specific** — "fix the bug in the login form" > "fix the bug"
2. **Provide context** — mention file names, error messages, or stack traces
3. **State the goal** — "I want users to reset their password via email" gives Claude room to design
4. **Iterate** — start with a high-level request, then refine based on output
5. **Use CLAUDE.md** — codify recurring instructions so you don't repeat them
6. **Use `/compact`** — before shifting focus to a new area of the codebase
7. **Use plan mode** — for complex tasks, have Claude plan first, then execute
8. **Leverage skills** — create reusable workflows for common tasks (deploy, review, etc.)

## References

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Claude Code CLI Usage](https://docs.anthropic.com/en/docs/claude-code/cli-usage)
- [Claude Code Best Practices](https://docs.anthropic.com/en/docs/claude-code/best-practices)
- [Claude Code GitHub Action](https://github.com/anthropics/claude-code-action)
