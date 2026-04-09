---
title: "Sandbox System"
weight: 3
---

## Overview

Codex implements a multi-layer sandbox system to isolate agent-executed commands from the host environment. The design philosophy is defense-in-depth: multiple independent security mechanisms combine so that a bypass in one layer doesn't compromise the whole system. The `sandboxing` crate provides a platform-abstracted `SandboxManager` that selects and configures the appropriate sandbox for each platform[^1].

## Sandbox Types

The `SandboxType` enum defines four platform-specific mechanisms:

| Type | Platform | Mechanism |
|------|----------|-----------|
| `None` | Any | No sandboxing (danger mode) |
| `MacosSeatbelt` | macOS | Apple's `sandbox-exec` with Seatbelt profiles |
| `LinuxSeccomp` | Linux | Bubblewrap + Landlock + seccomp |
| `WindowsRestrictedToken` | Windows | Restricted process tokens |

### Sandbox Selection

The `SandboxManager::select_initial()` method determines the sandbox type based on:

1. **Filesystem policy** — What directories need read/write access
2. **Network policy** — What network connections are allowed
3. **User preference** (`SandboxablePreference`) — `Auto`, `Require`, or `Forbid`
4. **Platform availability** — Whether the required sandbox tools exist

## macOS Seatbelt

On macOS, Codex uses Apple's `sandbox-exec` command[^2] with dynamically generated Seatbelt profiles. The implementation is in the `seatbelt` module of the `sandboxing` crate.

### Security Hardening

The sandbox executable path is hardcoded to `/usr/bin/sandbox-exec` — never resolved via PATH — to prevent attackers from injecting a malicious version.

### Profile Generation

Seatbelt profiles are generated dynamically based on the command's required permissions:

```
sandbox-exec -p "<profile>" -D KEY1=VALUE1 -D KEY2=VALUE2 -- <command>
```

Parameterized substitution (`-D{KEY}={PATH}`) allows flexible path configuration at runtime.

### Filesystem Rules

The profile builds tiered access policies:

| Access Level | Description |
|-------------|-------------|
| **Read** | Full disk read or restricted to specified roots |
| **Write** | Allowlisted directories only |
| **Exclusions** | Block both exact paths and all subpaths |

All filesystem paths undergo canonicalization and symlink resolution to prevent sandbox bypass through path manipulation.

### Network Rules

Network access is controlled through three proxy configuration scenarios:

| Scenario | Behavior |
|----------|----------|
| **Proxy with loopback endpoints** | Restrict network to detected loopback ports from environment variables |
| **Proxy without valid endpoints** | Fail closed — block all network access |
| **No proxy** | Full network access or complete block, depending on policy |

Network rules support IPv4/IPv6 loopback filtering, Unix domain socket allowlisting, and dynamic port extraction from proxy URLs (HTTP, HTTPS, SOCKS).

## Linux Sandbox

The Linux sandbox uses a two-layer approach implemented across the `sandboxing` and `linux-sandbox` crates[^3].

### Layer 1: In-Process Restrictions

Applied before spawning the child process:

| Mechanism | Purpose |
|-----------|---------|
| `no_new_privs` | Prevent privilege escalation via setuid binaries |
| seccomp | Restrict available system calls |

### Layer 2: Filesystem Isolation (Bubblewrap)

Bubblewrap[^4] provides namespace-based filesystem isolation:

```
codex-linux-sandbox \
  --sandbox-policy '<json>' \
  --fs-sandbox-policy '<json>' \
  --network-sandbox-policy '<json>' \
  -- <command> <args>
```

Three JSON policy objects control the sandbox:
- **Sandbox policy** — Overall sandbox behavior
- **Filesystem policy** — Read/write directory access
- **Network policy** — Allowed network connections

### Bubblewrap Requirements

The system validates Bubblewrap availability and permissions at startup:

1. **PATH search** — Finds `bwrap` executable, filtering out local directory versions
2. **Namespace test** — Runs `bwrap --unshare-user --unshare-net --ro-bind / / /bin/true` to verify user namespace access
3. **Error detection** — Checks stderr for "Permission denied" and "No permissions to create a new namespace"

If Bubblewrap is missing or lacks namespace permissions, warnings are issued (unless the policy is `DangerFullAccess` or `ExternalSandbox`).

### Landlock Integration

Landlock[^5] provides kernel-level filesystem access control as an additional layer:

- Legacy mode available via `--use-legacy-landlock` flag for older kernels
- Works alongside Bubblewrap rather than replacing it
- Restricts filesystem access at the kernel level, complementing Bubblewrap's namespace isolation

## Windows Sandbox

Windows sandboxing uses restricted process tokens to limit the child process's capabilities. The implementation lives in `codex-core`'s `windows_sandbox` module and the `codex_windows_sandbox` crate.

### Backends

| Backend | Mechanism |
|---------|-----------|
| **Restricted token** | Process spawned with reduced privileges via Windows security tokens |
| **Elevated** | For operations requiring specific elevated permissions |

### Filesystem Overlay

Windows sandbox supports **ACL-based filesystem overlay** — rather than namespace isolation (like Bubblewrap on Linux), Windows uses Access Control Lists to restrict which directories the sandboxed process can read/write.

### Windows Sandbox NUX

A first-run experience ("NUX" — New User Experience) prompts users about Windows Sandbox configuration only after the initial trust decision has been made, ensuring users understand the security implications before sandbox mode is enabled.

## Sandbox Manager

The `SandboxManager` is the unified entry point for sandbox operations:

### Key Types

```
SandboxCommand {
    program: String,
    args: Vec<String>,
    cwd: PathBuf,
    env: HashMap<String, String>,
    permission_profile: Option<PermissionProfile>,
}

SandboxExecRequest {
    command: SandboxCommand,  // Transformed command
    sandbox_type: SandboxType,
    policies: Policies,
    network_config: NetworkConfig,
}

SandboxTransformRequest {
    // Bundled parameters — keeps call sites
    // self-documenting when several fields are optional
}
```

### Transform Pipeline

The `transform()` method converts a standard command into a sandboxed execution:

1. Apply effective permissions from the approval pipeline
2. Delegate to platform-specific builder (Seatbelt, Landlock, or Windows handler)
3. Generate wrapped command with appropriate arguments and environment
4. Return `SandboxExecRequest` with full execution context

### Error Handling

Sandbox errors map to protocol-level `CodexErr` types:

| Error | Meaning |
|-------|---------|
| `MissingLinuxExecutable` | Bubblewrap not found on PATH |
| `UnavailableMacosSeatbelt` | `sandbox-exec` not available |
| `SandboxTransformError` | Failed to generate sandbox profile |

## Sandbox Policies

Three pre-configured sandbox modes are available via the `--sandbox` CLI flag:

| Mode | Filesystem | Network | Use Case |
|------|-----------|---------|----------|
| `read-only` | Read anywhere, write nowhere | Blocked | Safe exploration |
| `workspace-write` | Read anywhere, write in project dir | Allowed | Normal development |
| `danger-full-access` | Full read/write | Full access | Trusted environments |

Additionally, `ExternalSandbox` mode defers all sandboxing to an external tool (e.g., Docker), disabling Codex's built-in isolation.

## Sandbox ↔ Exec Integration

The `ExecRequest` struct in `codex-core` ties the sandbox and execution systems together:

```
ExecRequest {
    command: Vec<String>,
    cwd: AbsolutePathBuf,
    env: HashMap<String, String>,
    network: Option<NetworkProxy>,
    expiration: ExecExpiration,
    capture_policy: ExecCapturePolicy,
    sandbox_type: SandboxType,
    sandbox_policy: SandboxPolicy,
    filesystem_policy: FilesystemPolicy,
    network_policy: NetworkPolicy,
    windows_sandbox_level: WindowsSandboxLevel,
    windows_sandbox_private_desktop: bool,
    arg0: Option<String>,  // argv[0] override for sandbox wrappers
}
```

The `SandboxType` selection flows through `SandboxManager::select_initial()`, which considers the filesystem policy, network policy, and platform capabilities. The sandbox is selected once at session start and reused for all command executions within that session, unless the user changes the sandbox policy via dynamic configuration.

## Footnotes

[^1]: [Codex Sandboxing Crate](https://github.com/openai/codex/tree/main/codex-rs/sandboxing)
[^2]: [Apple Sandbox-exec Man Page](https://keith.github.io/xcode-man-pages/sandbox-exec.1.html)
[^3]: [Codex Linux Sandbox Crate](https://github.com/openai/codex/tree/main/codex-rs/linux-sandbox)
[^4]: [Bubblewrap Project](https://github.com/containers/bubblewrap)
[^5]: [Landlock LSM](https://landlock.io/)

## References

- [OpenAI Codex CLI GitHub](https://github.com/openai/codex)
- [Apple Seatbelt Framework](https://reverse.put.as/wp-content/uploads/2011/09/Apple-Sandbox-Guide-v1.0.pdf)
- [Bubblewrap Documentation](https://github.com/containers/bubblewrap)
- [Landlock Documentation](https://docs.kernel.org/userspace-api/landlock.html)
- [seccomp Overview](https://man7.org/linux/man-pages/man2/seccomp.2.html)
