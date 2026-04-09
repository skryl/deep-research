---
title: "Execution Policy"
weight: 4
---

## Overview

The execution policy system is the decision layer that determines whether a tool call can proceed without user approval. While the [sandbox](research/2026/codex-cli/sandbox) enforces OS-level isolation, the execution policy operates at the application level — deciding what the agent is *allowed* to do, not just what the OS *prevents*. The `execpolicy` crate implements a rule-based engine with 23 public types[^1], and the `codex-protocol` crate defines the approval workflow types.

## Policy Engine

### Core Types

| Type | Purpose |
|------|---------|
| `Policy` | Complete set of rules for a session |
| `Rule` / `RuleRef` | Individual permission rule |
| `Decision` | Allow or deny verdict |
| `RuleMatch` | Which rule matched and why |
| `MatchOptions` | Configuration for matching behavior |
| `Evaluation` | Result of evaluating a command against all rules |

### Rule Types

**Prefix Rules** (`PrefixRule`)

Match commands by their leading tokens. For example, a prefix rule `["git", "status"]` would auto-approve any command starting with `git status`.

```
PrefixRule {
    tokens: Vec<PatternToken>,
    // Matches: "git status", "git status --short"
    // Doesn't match: "git commit", "gitx status"
}
```

**Pattern Tokens** (`PatternToken`)

Individual elements in a prefix pattern, supporting exact match and wildcard patterns for flexible command matching.

**Network Rules** (`NetworkRuleProtocol`)

Gate network access by protocol:

| Protocol | Description |
|----------|-------------|
| `Http` | Plain HTTP connections |
| `Https` | TLS-encrypted connections |
| `Socks5Tcp` | SOCKS5 TCP proxy |
| `Socks5Udp` | SOCKS5 UDP proxy |

### Policy Parsing

The `PolicyParser` reads policy definitions from configuration files. Policies can be defined in `config.toml` and amended at runtime through user approvals.

### Runtime Amendment

When a user approves a command, they can choose to add a prefix rule so similar commands auto-approve in the future:

```
ExecPolicyAmendment {
    prefix: Vec<String>,
    // "Proposed execpolicy change to allow commands
    //  starting with this prefix"
}
```

Two blocking functions handle runtime amendments:
- `blocking_append_allow_prefix_rule()` — Add a command prefix allowlist entry
- `blocking_append_network_rule()` — Add a network access rule

## Approval Pipeline

The approval system is a multi-stage pipeline, with each stage either approving, denying, or escalating to the next:

### Stage 1: Execution Policy Check

The `execpolicy` engine evaluates the command against all configured rules:

```
Command: ["npm", "test"]
Rules:  [PrefixRule(["npm", "test"]) → Allow]
Result: Auto-approved
```

If no rule matches, the command escalates to the next stage.

### Stage 2: Guardian Assessment

The Guardian is a risk classification system that evaluates commands before user approval:

| Field | Type | Description |
|-------|------|-------------|
| `risk_level` | `GuardianRiskLevel` | Low, Medium, High, Critical |
| `authorization` | `GuardianUserAuthorization` | Unknown, Low, Medium, High |
| `status` | `GuardianAssessmentStatus` | InProgress, Approved, Denied, Aborted |
| `rationale` | `String` | Explanation of the assessment |

Guardian assessments cover multiple action types via `GuardianAssessmentAction`:

| Action Variant | What's Assessed |
|---------------|----------------|
| `Command` | Shell command execution |
| `Execve` | Direct process execution |
| `ApplyPatch` | File modification |
| `NetworkAccess` | Network connection |
| `McpToolCall` | MCP server tool invocation |

### Stage 3: User Approval

If the Guardian doesn't auto-approve, the user sees an approval request:

```
ExecApprovalRequestEvent {
    call_id: String,
    command: Vec<String>,
    cwd: PathBuf,
    network_approval_context: Option<NetworkApprovalContext>,
    proposed_execpolicy_amendment: Option<ExecPolicyAmendment>,
    additional_permissions: Option<EscalationPermissions>,
    available_decisions: Vec<Decision>,
}
```

The `effective_available_decisions()` method adjusts available choices based on context — network requests, additional permissions, and policy amendments each enable different decision options.

## Approval Types

### Command Approval

For shell commands (`ExecApprovalRequestEvent`):

- **Approve once** — Allow this specific execution
- **Approve and add rule** — Allow and create a prefix rule for future auto-approval
- **Deny** — Block the command

### Patch Approval

For file modifications (`ApplyPatchApprovalRequestEvent`):

- Contains a map of file paths to changes
- Optional session-level write grants for directories
- Governed by the sandbox filesystem policy

### Network Approval

For blocked network requests (`NetworkApprovalContext`):

```
NetworkApprovalContext {
    host: String,
    protocol: NetworkApprovalProtocol,
}

NetworkPolicyAmendment {
    host: String,
    action: NetworkPolicyRuleAction,  // Allow or Deny
}
```

### MCP Tool Approval

MCP tool calls go through the same approval pipeline, with `McpToolCall` as the Guardian action variant.

## Elicitation

The approval system also handles information requests from MCP servers:

```
ElicitationRequest {
    mode: Form | Url,
    metadata: ...,
}

ElicitationAction {
    Accept | Decline | Cancel
}
```

This allows MCP servers to request user input (e.g., OAuth consent) through the approval pipeline.

## Headless Mode

In `codex exec` (headless) mode, the approval policy defaults to `AskForApproval::Never`:

- Interactive approval requests are auto-rejected
- User input requests are auto-rejected
- MCP elicitation is auto-rejected
- Non-zero exit codes result from permission denials

This ensures headless execution is fully deterministic — commands either match existing policy rules or fail.

## Permissions Model

### Permission Profiles

```
Permissions {
    sandbox: SandboxPolicy,
    filesystem: FilesystemPolicy,
    network: NetworkPolicy,
}

EscalationPermissions {
    PermissionProfile | Permissions
}
```

### Sandbox Policy Levels

| Level | Description |
|-------|-------------|
| `ReadOnly` | Filesystem read access only |
| `WorkspaceWrite` | Read everywhere, write in project directory |
| `DangerFullAccess` | No restrictions |
| `ExternalSandbox` | Defer to external tool |

## Footnotes

[^1]: [Codex execpolicy Crate](https://github.com/openai/codex/tree/main/codex-rs/execpolicy)
[^2]: [Codex Protocol — Approvals](https://github.com/openai/codex/tree/main/codex-rs/protocol/src/approvals.rs)

## References

- [OpenAI Codex CLI GitHub](https://github.com/openai/codex)
- [Codex Developer Documentation](https://developers.openai.com/codex)
