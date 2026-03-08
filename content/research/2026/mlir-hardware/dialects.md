---
title: "CIRCT Dialects and Hardware Abstraction Levels"
weight: 2
---


CIRCT organizes its 30+ MLIR dialects into layers that correspond to different levels of hardware abstraction. This page catalogs the major dialects, their purpose, and how they relate to each other.

## Core RTL Dialects

These three dialects form the backbone of CIRCT and represent hardware at the register-transfer level.

### `hw` — Hardware Structure

The `hw` dialect provides structural abstractions analogous to Verilog's module/instance hierarchy. It is designed as an open extension point — other dialects "mix in" with `hw` to add functionality.

Key operations:
- **`hw.module`** — defines a hardware module with typed input/output ports
- **`hw.instance`** — instantiates a module
- **`hw.output`** — specifies the output values of a module

Key types:
- **`hw.inout`** — bidirectional port type
- **`hw.struct`** — named aggregate type
- **`hw.array`** — fixed-size array type

```mlir
hw.module @Adder(in %a: i32, in %b: i32, out sum: i32) {
  %result = comb.add %a, %b : i32
  hw.output %result : i32
}
```

### `comb` — Combinational Logic

Pure combinational operations with no state or side effects. This separation from sequential logic enables straightforward dataflow analysis and algebraic simplification.

Key operations:
- **Arithmetic**: `comb.add`, `comb.mul`, `comb.sub`, `comb.divs`, `comb.divu`
- **Bitwise**: `comb.and`, `comb.or`, `comb.xor`, `comb.shl`, `comb.shru`, `comb.shrs`
- **Comparison**: `comb.icmp` (with predicates: eq, ne, slt, ult, sle, ule, sgt, ugt, sge, uge)
- **Selection**: `comb.mux` (2-input), `comb.array_create`, `comb.array_get`
- **Bit manipulation**: `comb.concat`, `comb.extract`, `comb.replicate`

All `comb` operations are marked as having no side effects, enabling aggressive CSE (common subexpression elimination) and dead code elimination.

### `seq` — Sequential Logic

Stateful elements — registers, memories, and clock domain management.

Key operations:
- **`seq.compreg`** — a register clocked on an edge, with optional reset
- **`seq.firreg`** — a FIRRTL-flavored register (used during FIRRTL lowering)
- **`seq.hlmem`** — high-level memory abstraction
- **`seq.clock_gate`** — clock gating primitive

```mlir
%reg = seq.compreg %next_val, %clk reset %rst, %init_val : i32
```

The separation of `seq` from `comb` is architecturally significant: it means combinational optimization passes never need to reason about state, and sequential optimizations (retiming, clock gating) never need to reason about arithmetic.

## High-Level Input Dialects

### `firrtl` — Chisel's Intermediate Representation

FIRRTL (Flexible Intermediate Representation for RTL) is the IR emitted by the Chisel hardware construction language. CIRCT provides a complete FIRRTL dialect and the `firtool` compiler that replaces the legacy Scala FIRRTL Compiler (SFC).

Key features:
- Width inference (automatic bit-width propagation)
- Annotation-driven transformations (e.g., memory macro replacement, signal naming)
- Multiple FIRRTL abstraction levels: High, Mid, Low FIRRTL within the dialect
- Lowering from `chirrtl` (Chisel-specific extensions) through to `hw`/`comb`/`seq`

### `moore` — SystemVerilog Frontend

The Moore dialect provides a frontend for parsing SystemVerilog into MLIR. It reaches approximately 73% of the sv-tests compliance suite. This enables CIRCT to ingest existing SystemVerilog designs for analysis, transformation, or simulation.

### `llhd` — Low-Level Hardware Description

The LLHD dialect provides a lower-level hardware description that captures time-based simulation semantics. It models signals, processes, and time-stepped execution, suitable for event-driven simulation.

## HLS and Scheduling Dialects

### `calyx` — Control and Data Separation

Calyx (from Cornell's CAPRA group) is an intermediate language for HLS that separates hardware into:
1. **Structural components**: registers, ALUs, memories, multiplexers — describing the datapath
2. **Control program**: FSM-like constructs (`seq`, `par`, `if`, `while`) — describing the schedule

This separation makes it natural to express statically scheduled hardware. Calyx serves as a target for multiple HLS frontends including Dahlia, Futil, and the PyTorch-to-Calyx flow.

```mlir
calyx.component @main(%go: i1, %clk: i1, %reset: i1) -> (%done: i1) {
  %r.in, %r.out = calyx.register @r : i32
  %add.left, %add.right, %add.out = calyx.std_add @add : i32
  calyx.wires { ... }
  calyx.control {
    calyx.seq {
      calyx.enable @compute_group
    }
  }
}
```

### `handshake` — Dataflow Circuits

The Handshake dialect models dynamically scheduled dataflow circuits where operations communicate through ready/valid handshaking. Each operation fires when all its inputs are available — there is no global schedule.

Used by Dynamatic (EPFL) for dynamic HLS. Operations include:
- **`handshake.func`** — a dataflow function
- **`handshake.fork`** — duplicates a token to multiple consumers
- **`handshake.join`** — waits for all inputs before producing output
- **`handshake.branch`** — conditional routing
- **`handshake.mux`** — data selection based on a control token
- **`handshake.buffer`** — pipeline buffer for throughput

### `pipeline` — Static Pipeline Scheduling

Represents statically scheduled pipelines with explicit stage boundaries. Used for simple pipeline generation where the schedule is known at compile time.

### `ssp` — Static Scheduling Problem

Models scheduling problems as a set of operations with precedence constraints and resource limitations. Used internally by HLS tools to formulate and solve scheduling.

## Interconnect and Communication Dialects

### `esi` — Elastic Silicon Interconnect

ESI addresses the SoC communication problem. Key concepts:

- **Channels**: Point-to-point, typed connections between modules with latency-insensitive semantics (FIFO-based)
- **Message types**: Rich type system including structs, arrays, unions, and variable-length lists
- **Windows**: Break large messages into frames to save wire area at the cost of bandwidth
- **Services**: Abstract communication substrates — ESI can select AXI, Avalon-MM, or custom protocols

ESI was originally developed at Microsoft and is being integrated into CIRCT. It provides typed, latency-insensitive interconnect that abstracts away signaling protocol details.

```mlir
// A typed channel carrying 32-bit integers
!chan = !esi.channel<i32>

// A bundle of channels for bidirectional communication
!bundle = !esi.bundle<[!esi.channel<i32> from "request", !esi.channel<i64> to "response"]>
```

### `msft` — Microsoft-Specific Extensions

Physical placement and device-specific annotations. Provides operations for specifying physical locations on FPGA devices.

## Verification Dialects

### `verif` — Verification Constructs

High-level verification operations: assumptions, assertions, and cover points.

### `ltl` — Linear Temporal Logic

Temporal logic properties for hardware verification. Expresses properties like "signal A is always eventually followed by signal B."

### `smt` — SMT Solver Interface

Interface to SMT solvers (Z3, Bitwuzla) for formal verification. Used by `circt-bmc` and `circt-lec`.

### `debug` — Debug Information

Carries debug metadata through the compilation pipeline, enabling source-level debugging of generated hardware.

## Simulation Dialects

### `arc` — Simulation Abstractions

Models hardware as state-transition functions for cycle-accurate simulation. Connects to LLVM IR for compilation to native code (the Arcilator flow). Key insight: by modeling hardware as pure functions over state, the simulator can leverage LLVM's optimization pipeline.

## Utility Dialects

### `emit` — Emission Control

Controls output formatting: file splitting, include guards, and SystemVerilog dialect selection.

### `sv` — SystemVerilog Constructs

Provides direct access to SystemVerilog-specific constructs for the "last mile" of code generation:
- `sv.always_ff`, `sv.always_comb` — behavioral blocks
- `sv.ifdef` — conditional compilation
- `sv.wire`, `sv.reg` — declarations
- `sv.verbatim` — raw text injection (escape hatch)

### `om` — Object Model

Metadata and configuration objects that travel alongside hardware descriptions but don't map to logic.

## Dialect Relationships and Lowering Paths

```
   firrtl ──────────────────┐
   moore ───────────────────┤
   calyx ───────────────────┤
   handshake ───────────────┤
   pipeline ────────────────┤
                            ▼
                    hw + comb + seq
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
          sv + emit      arc → llvm     smt
              │             │             │
              ▼             ▼             ▼
        SystemVerilog   Simulation    Formal
          output        binary      verification
```

Multiple input representations all converge on the core `hw`/`comb`/`seq` representation, which then fans out to different backends: SystemVerilog emission, simulation compilation, or formal verification.

## MLIR Affine and SCF Dialects for HLS

While not part of CIRCT itself, the standard MLIR `affine` and `scf` dialects play a critical role as input representations for HLS tools.

### `affine` Dialect

The affine dialect represents loop nests with affine (linear) bounds and subscripts. This enables polyhedral analysis — a mathematically precise framework for reasoning about loop dependencies, enabling:

- **Loop tiling**: Breaking loops into blocks for data locality
- **Loop interchange**: Reordering loop dimensions
- **Loop fusion/fission**: Combining or splitting loop bodies
- **Parallelization**: Automatically identifying independent iterations via `--affine-parallelize`
- **Memory access analysis**: Proving independence of memory operations

Key operations:
- `affine.for` — loop with affine bounds
- `affine.if` — conditional with affine constraints
- `affine.load` / `affine.store` — memory access with affine indices

ScaleHLS and the POM framework both use the affine dialect as their primary loop-level IR, leveraging MLIR's built-in polyhedral analysis libraries.

### `scf` (Structured Control Flow) Dialect

The SCF dialect represents general structured control flow — `for`, `while`, `if` — without the affine restriction. It serves as:

1. A **lowering target** for `affine` (after affine analysis is complete, loops lower to `scf.for`)
2. An **input representation** for HLS tools that don't need polyhedral analysis
3. A **bridge** between high-level algorithm descriptions and hardware scheduling dialects

The lowering path is: `affine` -> `scf` -> `calyx`/`handshake` (HLS scheduling) -> `hw`/`comb`/`seq` (RTL).

AMD's AIR dialect transforms `scf.for` loops into ping-pong buffering patterns for AIE architectures, constructing dependency edges between producer and consumer processes for concurrent communication and compute.

## References

- [HW Dialect Rationale](https://circt.llvm.org/docs/Dialects/HW/RationaleHW/)
- [HWArith Dialect Rationale](https://circt.llvm.org/docs/Dialects/HWArith/RationaleHWArith/)
- [Calyx Dialect in CIRCT](https://circt.llvm.org/docs/Dialects/Calyx/)
- [ESI Dialect Documentation](https://circt.llvm.org/docs/Dialects/ESI/)
- [ESI Rationale](https://circt.llvm.org/docs/Dialects/ESI/RationaleESI/)
- [MLIR Affine Dialect](https://mlir.llvm.org/docs/Dialects/Affine/)
- [MLIR SCF Dialect](https://mlir.llvm.org/docs/Dialects/SCFDialect/)
