# Common Workflows

## Exploring an Unfamiliar Codebase

```
> give me an overview of this codebase
> explain the main architecture patterns used here
> what are the key data models?
> how does authentication work?
```

Start broad, then narrow down. Claude will read files, follow imports, and build up a mental model of the project.

## Fixing Bugs

```
> the login form crashes when the email field is empty. find and fix the bug
> there's a race condition in the payment processing — investigate and fix it
```

Claude will search for relevant code, identify the root cause, propose a fix, and apply it. For complex bugs, it may run tests to verify the fix.

## Writing Tests

```
> write unit tests for the UserService class
> add integration tests for the /api/orders endpoints
> the calculateDiscount function has no test coverage — add comprehensive tests
```

Claude reads the implementation, understands the behavior, and generates tests that cover happy paths, edge cases, and error conditions.

## Code Review

```
> review the changes in this PR
> /review
```

Claude examines diffs, identifies potential issues (bugs, security vulnerabilities, style violations), and provides structured feedback.

## Refactoring

```
> refactor the auth module to use the repository pattern
> extract the validation logic from the controller into a separate service
> rename getUserData to fetchUserProfile across the codebase
```

Claude handles multi-file refactors, updating imports, references, and tests.

## Git and PR Workflows

```
> commit these changes with a descriptive message
> create a PR for this feature branch
> look at the failing CI checks and fix them
```

Claude can manage the full git lifecycle from staging through PR creation.

## Multi-File Editing

Claude excels at changes that span many files:

```
> add TypeScript types to all the API route handlers
> migrate all class components to functional components with hooks
> update all imports to use the new module paths
```

## Tips for Effective Prompting

1. **Be specific** — "fix the bug in the login form" is better than "fix the bug"
2. **Provide context** — mention file names, error messages, or stack traces when available
3. **State the goal** — "I want users to be able to reset their password via email" gives Claude room to design the solution
4. **Iterate** — start with a high-level request, then refine based on what Claude produces
5. **Use CLAUDE.md** — codify recurring instructions so you don't have to repeat them
