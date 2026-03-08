---
title: "CIRCT's Relationship to Chisel and FIRRTL"
weight: 4
---


## Background: The Chisel/FIRRTL Ecosystem

**Chisel** (Constructive Hardware in a Scala Embedded Language) is a hardware description language embedded in Scala, developed at UC Berkeley. Instead of writing Verilog directly, hardware engineers write Scala programs that generate hardware — enabling software-like abstractions (parameterized modules, type-safe interfaces, functional composition) for hardware design.

**FIRRTL** (Flexible Intermediate Representation for RTL) is the intermediate representation emitted by Chisel. The original compilation flow was:

```
Chisel (Scala) → FIRRTL IR (.fir file) → Scala FIRRTL Compiler (SFC) → Verilog
```

The Scala FIRRTL Compiler (SFC) was a compiler written in Scala that performed width inference, type checking, optimization passes, and Verilog emission. While functional, the SFC had significant limitations as designs grew larger.

## The Problem: SFC Limitations

As RISC-V SoC designs (particularly SiFive's commercial chips and the open-source Rocket Chip / BOOM processors) grew to millions of gates, the SFC became a bottleneck:

- **Performance**: Scala/JVM implementation was orders of magnitude slower than C++ alternatives for large designs. Compilation of production SoCs could take tens of minutes to hours.
- **Memory usage**: JVM garbage collection overhead was substantial for the large IR graphs involved.
- **Optimization limitations**: The SFC's pass infrastructure was ad-hoc compared to compiler frameworks like LLVM that had decades of optimization research.
- **Maintainability**: Adding new features required duplicating infrastructure that already existed in mature compiler frameworks.

## The Solution: CIRCT's FIRRTL Dialect

CIRCT's FIRRTL dialect provides a **drop-in replacement** for the SFC. The CIRCT implementation:

- Is written in C++ using MLIR's infrastructure, providing 10-100x faster compilation
- Tracks the FIRRTL specification closely, with strategic deviations to leverage MLIR's strengths
- Supports the full FIRRTL spec including the CHIRRTL variant directly produced by Chisel
- Handles FIRRTL annotations (the metadata system used by Chisel for tool-specific directives)

### Key Design Decisions

**FIRRTL-specific types rather than MLIR integers:**
The FIRRTL dialect uses `!firrtl.uint<32>` and `!firrtl.sint<16>` instead of MLIR's standard `i32`/`i16`. This allows uniform handling of unknown-width integers (where width inference has not yet run), which would be impossible with fixed-width MLIR integer types.

**Multiple-result instances:**
In the FIRRTL spec, an instance produces a bundle of all the module's ports. CIRCT's `firrtl.instance` instead produces multiple results (one per port), leveraging MLIR's variadic result support. This avoids the need for bundle-manipulation operations just to access ports.

**SSA dominance:**
The FIRRTL spec allows cyclic connections (module bodies are graph regions). CIRCT enforces SSA def-before-use dominance in module bodies, using `firrtl.wire` operations as forward declarations when cycles are needed.

**Separated invalidation:**
The FIRRTL spec combines `is invalid` as a statement. CIRCT separates this into `firrtl.invalidvalue` (which produces an invalid value) and `firrtl.connect` (which performs the connection), simplifying analysis and transformation.

## The Two-Compiler Era (Chipyard)

During the transition period, the Chipyard SoC framework (used for Rocket Chip, BOOM, and other Berkeley designs) ran both compilers:

1. **SFC** compiled Chisel to CHIRRTL (an intermediate FIRRTL format)
2. **MFC** (MLIR FIRRTL Compiler, i.e., firtool) compiled CHIRRTL to Verilog

The SFC was kept as a fallback for features not yet supported by firtool (e.g., fixed-point types). This arrangement has since been largely phased out as firtool reached feature completeness.

## Current State: firtool as the Default

As of Chisel 5.x, **firtool is the default and recommended FIRRTL compiler**. The integration works as follows:

### Compilation Flow

```
Chisel 5 (Scala)
    │
    ├─ Chisel compiler emits FIRRTL (.fir) or CHIRRTL
    │
    ▼
firtool (CIRCT)
    │
    ├─ Parse FIRRTL → firrtl.circuit MLIR
    ├─ Width inference, reset inference
    ├─ Module deduplication, inlining
    ├─ Lower types (bundles/vectors → ground types)
    ├─ Lower FIRRTL → HW + Comb + Seq
    ├─ HW optimization passes
    ├─ Lower to SV
    ├─ Verilog emission
    │
    ▼
SystemVerilog output
```

### Integration Mechanisms

**sbt/mill plugin**: Chisel's build system plugins invoke firtool automatically. The `firtool` binary must be on the system PATH.

**C API**: Chisel can invoke firtool programmatically through its C API (`circt-c/Firtool.h`), avoiding the overhead of process spawning for iterative workflows.

**chisel-circt (archived)**: SiFive previously maintained a separate `chisel-circt` library that provided a ChiselStage-like interface for MFC. This project is now archived because upstream Chisel natively supports CIRCT.

### FIRRTL Annotations

Annotations are FIRRTL's metadata system — JSON objects attached to circuit elements that drive tool-specific behavior. Examples include:

- `DontTouchAnnotation` — prevents dead-code elimination of a signal
- `BlackBoxInlineAnnotation` — embeds Verilog source for a black-box module
- `MemoryFileInlineAnnotation` — specifies initial memory contents
- Grand Central annotations — generate verification interfaces

firtool processes annotations through dedicated passes (`firrtl-lower-annotations`). Some annotations that were SFC-specific required new CIRCT implementations.

## FIRRTL Specification Tracking

The FIRRTL dialect closely tracks updates to the FIRRTL specification. The CIRCT codebase uses feature-gating constants to manage specification versioning:

- `nextFIRVersion` — features accepted into the spec but not yet released
- `missingSpecFIRVersion` — behaviors that exist in the SFC but are not formally specified

This versioning system ensures compatibility across FIRRTL spec revisions while maintaining the ability to support legacy designs.

## Performance Comparison: firtool vs SFC

The C++/MLIR implementation provides dramatic speedups over the Scala implementation:

- **Small designs** (e.g., simple Rocket core): 5-10x faster
- **Medium designs** (e.g., BOOM): 10-50x faster
- **Large SoC designs**: 50-100x faster, with proportionally better memory usage

These improvements are due to:
1. C++ vs JVM execution overhead
2. MLIR's efficient in-memory IR representation (no JVM object overhead)
3. MLIR's parallel pass infrastructure
4. Better memory locality in C++ data structures

## Beyond Chisel: Other FIRRTL Producers

While Chisel is the primary producer of FIRRTL, the FIRRTL format is designed as an open interchange format. Other tools that produce or consume FIRRTL include:

- **Spatial** — a domain-specific language for accelerator design (Stanford)
- **PyRTL** — a Python-based hardware description framework
- **ESSENT** — a high-performance simulator that consumes FIRRTL directly
- **Custom generators** — any tool can emit `.fir` files for processing by firtool
