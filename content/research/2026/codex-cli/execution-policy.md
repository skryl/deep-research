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

### ExecPolicyManager

The `ExecPolicyManager` uses `ArcSwap<Policy>` for **lock-free policy updates**, allowing the policy to be amended without blocking concurrent evaluations:

- Evaluates commands as `Allow`, `Prompt`, or `Forbidden`
- Parses shell commands (including heredocs) for policy matching
- Derives policy amendments to prevent future prompts for similar commands
- Maintains a **banned prefix list** — commands starting with `python`, `bash`, `sudo`, etc. cannot be auto-approved via prefix rules (they require per-invocation approval)
- Bridges to sandbox policies for filesystem/network gating

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

The Guardian is an **AI-powered safety layer**[^3] that reviews approval requests using a dedicated model call. It is itself an agent session with restricted permissions — a safety reviewer reviewing the primary agent's actions.

**Guardian review orchestration** (`run_guardian_review()`):

1. Creates a sandboxed review session with `approval_policy = never` (prevents recursive approvals)
2. Serializes the `GuardianApprovalRequest` to JSON with recursive string truncation for large payloads
3. Calls a dedicated model (with low reasoning effort when available), falling back to the current turn's model
4. Streams progress events (`GuardianAssessmentStatus::InProgress`)
5. **Fail-safe default**: Timeouts, errors, and parse failures all result in **high-risk denial**
6. Rejection messages include anti-circumvention instructions

**Review session management** (`GuardianReviewSessionReuseKey`):

| Behavior | Description |
|----------|-------------|
| **Trunk session** | Persistent review session reused when config is stable |
| **Ephemeral session** | Temporary session when configuration has changed |
| **Timeout racing** | `tokio::select!` races timeout, cancellation, and completion |

The review session disables: spawn CSV, collaboration, web search. It enforces read-only sandbox and "Never" approval behavior to prevent the reviewer from taking actions.

**Risk classification output**:

| Field | Type | Description |
|-------|------|-------------|
| `risk_level` | `GuardianRiskLevel` | Low, Medium, High, Critical |
| `authorization` | `GuardianUserAuthorization` | Unknown, Low, Medium, High |
| `status` | `GuardianAssessmentStatus` | InProgress, Approved, Denied, Aborted |
| `rationale` | `String` | Explanation of the assessment |

Guardian assessments cover multiple action types via `GuardianApprovalRequest`:

| Action Variant | What's Assessed |
|---------------|----------------|
| `Command` | Shell command execution |
| `ExecCommand` | Structured command execution |
| `Execve` | Direct process execution (Unix only) |
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

## TUI Approval Overlay

In the interactive TUI, approvals are presented through a dedicated overlay (`approval_overlay.rs`) that handles four request types:

| Request Type | Content Shown |
|-------------|---------------|
| Exec | Command to execute, working directory |
| Permissions | Filesystem/network grants requested |
| ApplyPatch | File changes with diff view |
| McpElicitation | MCP server information request |

**Keyboard shortcuts** in the approval overlay:

| Key | Action |
|-----|--------|
| `y` | Approve |
| `n` | Deny |
| `a` | Always allow (add prefix rule) |
| `Enter` | Confirm selection |
| `Escape` | Cancel/dismiss |
| `Ctrl+A` | Toggle full-screen view of the request |

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
[^3]: [Codex Guardian Review](https://github.com/openai/codex/tree/main/codex-rs/core/src/guardian)

## References

- [OpenAI Codex CLI GitHub](https://github.com/openai/codex)
- [Codex Developer Documentation](https://developers.openai.com/codex)
