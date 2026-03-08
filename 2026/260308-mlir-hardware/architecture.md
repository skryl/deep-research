# Architecture and Foundations

## MLIR as a Hardware Compiler Framework

MLIR (Multi-Level Intermediate Representation) was designed by Google to solve the "N x M" problem in compilers: N source languages targeting M hardware backends, each requiring a custom compiler. MLIR introduces a common infrastructure where multiple domain-specific IRs (called **dialects**) coexist and interoperate within a single framework.

For hardware design, this is transformative. The EDA industry historically relied on Verilog and VHDL as both design languages and interchange formats — despite their well-documented limitations:

- **Poor type safety** — wire widths and signedness are loosely enforced
- **Weak location tracking** — error messages point to generated code, not the original source
- **No progressive lowering** — everything collapses to flat RTL with no intermediate structure
- **Tool silos** — each vendor reimplements parsing, elaboration, and optimization from scratch

MLIR provides the infrastructure to solve all four: dialects encode domain-specific types and semantics, operations carry source locations through every transformation, lowering happens gradually through well-defined passes, and all tools share a common optimization framework.

### Key MLIR Concepts for Hardware

**Dialects** are namespaced collections of operations, types, and attributes. Hardware dialects define operations like `hw.module`, `comb.add`, and `seq.compreg` rather than generic LLVM instructions. Multiple dialects can coexist in the same IR module.

**Operations** are the nodes in MLIR's SSA (Static Single Assignment) graph. Each operation belongs to a dialect and has typed operands, results, attributes, and regions. For example:

```mlir
%sum = comb.add %a, %b : i32
```

**Regions and Blocks** allow operations to contain nested IR. An `hw.module` contains a region with the module body. This enables hierarchical representation — a module contains combinational logic, which contains individual operations.

**Types** in hardware dialects include bit vectors (`i1`, `i32`), arrays, structs, and hardware-specific types like clock and reset signals.

**Attributes** carry compile-time metadata: module parameters, instance names, source locations, and hardware-specific annotations.

**Passes** are transformations that operate on the IR. MLIR provides a pass manager that handles scheduling, parallelism, and verification. Passes can operate within a single dialect or convert between dialects.

## The CIRCT Project

CIRCT (Circuit IR Compilers and Tools) is an LLVM incubator project that applies MLIR to hardware design tooling. Started around 2020 through collaboration between SiFive, Google, and academic groups, it now lives in the `llvm/circt` GitHub repository and follows all LLVM governance policies.

### Project Goals

1. **Reusable infrastructure** — shared parsing, optimization, and code generation instead of per-tool reimplementation
2. **New abstractions** — represent hardware at higher levels than flat RTL, enabling transformations impossible on Verilog
3. **Open ecosystem** — modular libraries that both open-source and commercial tools can build upon
4. **Performance** — C++ implementation with LLVM-grade optimization, replacing slower Scala/JVM-based tooling

### Repository Structure

```
circt/
├── include/circt/Dialect/    # Dialect definitions (ODS tablegen)
│   ├── HW/                   # Hardware module abstractions
│   ├── Comb/                 # Combinational logic
│   ├── Seq/                  # Sequential logic
│   ├── SV/                   # SystemVerilog constructs
│   ├── FIRRTL/               # Chisel's IR
│   ├── Calyx/                # HLS intermediate language
│   ├── ESI/                  # Elastic Silicon Interconnect
│   ├── Arc/                  # Simulation-oriented IR
│   ├── Verif/                # Verification constructs
│   ├── LTL/                  # Linear temporal logic
│   ├── SMT/                  # SMT solver interface
│   └── ...                   # 30+ dialects total
├── lib/Dialect/              # Dialect implementations
├── lib/Conversion/           # Dialect-to-dialect lowering passes
├── tools/                    # Command-line tools
│   ├── firtool/              # FIRRTL compiler
│   ├── circt-opt/            # Generic MLIR optimizer
│   ├── circt-bmc/            # Bounded model checker
│   ├── circt-lec/            # Logic equivalence checker
│   └── hlstool/              # HLS compilation driver
└── test/                     # FileCheck-based regression tests
```

### Build System

CIRCT uses CMake and depends on LLVM/MLIR (built from source or a compatible release). It produces shared libraries for each dialect and standalone command-line tools. The build supports both debug and release configurations, with tablegen-based ODS (Operation Definition Specification) generating boilerplate C++ from declarative dialect descriptions.

## Progressive Lowering Pipeline

The central architectural principle of CIRCT is **progressive lowering** — the same concept that makes LLVM successful. Instead of a single monolithic translation from source to target, the design flows through multiple intermediate representations, each capturing different levels of abstraction.

### Abstraction Levels

```
┌─────────────────────────────────────────────┐
│  Source Languages                             │
│  (Chisel, SystemVerilog, Calyx, C/C++ HLS)   │
└──────────────────┬──────────────────────────┘
                   │ Frontend parsing
                   ▼
┌─────────────────────────────────────────────┐
│  High-Level Dialects                          │
│  (firrtl, calyx, moore, handshake)            │
│  Design intent, scheduling, control flow      │
└──────────────────┬──────────────────────────┘
                   │ Dialect lowering passes
                   ▼
┌─────────────────────────────────────────────┐
│  Core Hardware Dialects                       │
│  (hw, comb, seq)                              │
│  Structural RTL with typed ports and wires    │
└──────────────────┬──────────────────────────┘
                   │ Target-specific lowering
                   ▼
┌─────────────────────────────────────────────┐
│  Emission Dialects                            │
│  (sv, emit)                                   │
│  SystemVerilog constructs and output format    │
└──────────────────┬──────────────────────────┘
                   │ Code generation
                   ▼
┌─────────────────────────────────────────────┐
│  Output Artifacts                             │
│  (SystemVerilog, simulation binary, SMT)      │
└─────────────────────────────────────────────┘
```

### Why Progressive Lowering Matters

At each level, domain-specific optimizations can be applied that would be impossible or extremely difficult on flat RTL:

- **At the FIRRTL level**: width inference, dead-code elimination on high-level constructs, annotation-driven transforms
- **At the HW/Comb/Seq level**: constant folding, common subexpression elimination, canonicalization of logic expressions
- **At the SV level**: SystemVerilog-specific formatting, always-block merging, wire/reg naming

This mirrors how LLVM lowers from Clang AST → LLVM IR → SelectionDAG → MachineIR → assembly, with optimization opportunities at each stage.

### Cross-Dialect Operations

A key MLIR feature is that operations from different dialects can coexist in the same module during lowering. A partially-lowered module might contain both `firrtl.module` and `hw.module` operations. This enables incremental lowering — converting one module at a time rather than requiring an all-at-once translation.

## Key Tools

### firtool

The primary FIRRTL compiler, replacing the legacy Scala FIRRTL Compiler (SFC). Accepts FIRRTL input (from Chisel or other frontends) and produces SystemVerilog output through the full CIRCT lowering pipeline. Provides 10-100x speedup over SFC for large designs due to C++ implementation and MLIR's efficient data structures.

```bash
# Compile Chisel-generated FIRRTL to SystemVerilog
firtool design.fir -o output.sv

# With optimization level
firtool design.fir --lowering-options=disallowLocalVariables -O=release
```

### circt-opt

The general-purpose MLIR optimizer for CIRCT dialects. Runs arbitrary sequences of passes on CIRCT IR, useful for debugging, testing, and building custom flows.

```bash
# Run specific passes
circt-opt --lower-firrtl-to-hw --lower-seq-to-sv input.mlir

# Canonicalize and simplify
circt-opt --canonicalize --cse input.mlir
```

### circt-bmc and circt-lec

Formal verification tools. `circt-bmc` performs bounded model checking (exhaustive state-space search up to N cycles), while `circt-lec` proves logic equivalence between two implementations.

### hlstool

Driver for HLS compilation flows, integrating scheduling, pipelining, and lowering from high-level dialects to RTL.

## Design Principles

### Declarative Dialect Definitions

CIRCT uses MLIR's ODS (Operation Definition Specification) tablegen to declare operations:

```tablegen
def CombAddOp : CombBinOp<"add", [Commutative]> {
  let summary = "Addition of two integers";
  let description = [{
    Computes the sum of two integer operands.
  }];
}
```

This generates C++ classes, parser/printer methods, verifier logic, and documentation from a single source of truth.

### Verifier Infrastructure

Every operation in CIRCT has automatically-generated and hand-written verifiers that check IR invariants. After each pass, the pass manager can verify the entire module, catching bugs immediately rather than producing invalid output.

### Location Tracking

MLIR operations carry source location information through every transformation. When CIRCT emits a SystemVerilog error or warning, it can point back to the original Chisel/FIRRTL source line — not the generated Verilog. This is a significant improvement over traditional flows where generated RTL errors are nearly impossible to trace.
