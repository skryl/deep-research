---
title: "CIRCT Tools"
weight: 3
---


CIRCT provides several command-line tools that compose the project's libraries into user-facing compilation and verification flows.

## firtool — The FIRRTL Compiler

`firtool` is the primary entry point for compiling FIRRTL hardware descriptions to implementation formats. It serves as a drop-in replacement for the Scala FIRRTL Compiler (SFC) and is now the default backend used by Chisel.

### Input Formats

- `.fir` — standard FIRRTL text format (as emitted by Chisel)
- `.mlir` — MLIR format with FIRRTL dialect operations

### Output Formats

- **Verilog / SystemVerilog** — single-file or split-file output
- **BTOR2** — for bounded model checking
- **MLIR** — intermediate IR at any stage of the pipeline (for debugging)

### Compilation Pipeline

firtool orchestrates a multi-stage progressive lowering pipeline:

**1. Parsing Phase**
The FIRRTL parser converts `.fir` text into `firrtl.circuit` and `firrtl.module` MLIR operations with full annotation support.

**2. Analysis Passes**
- Width inference — resolves unknown integer bit widths throughout the design
- Reset inference — determines reset signal types and propagation
- Width checking — validates type consistency after inference

**3. Transformation Passes**
- Module deduplication — removes structurally identical module definitions
- Module inlining — flattens hierarchy where annotations request it
- Lower types — converts aggregate types (bundles, vectors) into ground types
- Lower memory — transforms memory operations into concrete implementations
- Grand Central — generates interfaces for design introspection
- Dead code elimination — removes unused logic
- Annotation processing — applies metadata-driven transformations

**4. Dialect Lowering**
- **FIRRTL to HW** — converts FIRRTL operations to `hw.module` + `comb.*` + `seq.*`
- **Seq to SV** — lowers abstract registers to SystemVerilog `always_ff` blocks
- **Prepare for emission** — introduces temporary wires, resolves naming

**5. Export Phase (Verilog Emission)**
Three substages:
- **Preparation** — introduces temporary wires, resolves expression dependencies
- **Name legalization** — ensures all identifiers are valid SystemVerilog
- **Emission** — parallel code generation with proper operator precedence

### Usage Examples

```bash
# Basic compilation: FIRRTL to SystemVerilog
firtool design.fir -o output.sv

# Split output into one file per module
firtool design.fir --split-verilog -o output_dir/

# With optimization
firtool design.fir -O=release

# Control output formatting
firtool design.fir --lowering-options=emittedLineLength=200

# Disable local variable declarations (for tool compatibility)
firtool design.fir --lowering-options=disallowLocalVariables

# Emit intermediate MLIR for debugging
firtool design.fir --ir-hw -o debug.mlir

# Emit BTOR2 for formal verification
firtool design.fir --btor2 -o design.btor
```

### Lowering Options

The `--lowering-options=` flag controls SystemVerilog emission for compatibility with different EDA tools:

- `emittedLineLength=N` — wrap long lines at N characters
- `disallowLocalVariables` — avoid `automatic` variables (Vivado compatibility)
- `disallowPackedArrays` — expand packed arrays (for tools with limited support)
- `noAlwaysComb` — use `always @(*)` instead of `always_comb`
- `locationInfoStyle=none|plain|wrapInAtSquareBracket` — control source location comments

### C API

firtool functionality is also available through a C API (`circt-c/Firtool.h`), enabling integration with other programming languages and tools. This is used by the Chisel Scala library to invoke firtool programmatically.

### Layer System

firtool supports the FIRRTL layer system for conditional compilation and instrumentation. Layers allow separating verification logic, debug infrastructure, or design variants that can be independently enabled or disabled.

## circt-opt — General-Purpose MLIR Optimizer

`circt-opt` is CIRCT's equivalent of MLIR's `mlir-opt`. It applies arbitrary sequences of CIRCT passes to MLIR input files. This is the primary tool for:

- **Debugging** — run individual passes and inspect intermediate IR
- **Testing** — CIRCT's test suite uses circt-opt with FileCheck extensively
- **Custom flows** — build bespoke compilation pipelines by composing passes

### Usage

```bash
# Run specific lowering passes
circt-opt --lower-firrtl-to-hw --lower-seq-to-sv input.mlir

# Canonicalize and eliminate common subexpressions
circt-opt --canonicalize --cse input.mlir

# List all available passes
circt-opt --help | grep "Passes:"

# Run a pass pipeline
circt-opt --pass-pipeline='builtin.module(firrtl-lower-types)' input.mlir
```

### Key Pass Categories

**FIRRTL passes** (prefixed `firrtl-`):
- `firrtl-infer-widths` — resolve unknown widths
- `firrtl-infer-resets` — determine reset types
- `firrtl-lower-types` — flatten aggregate types
- `firrtl-dedup` — module deduplication
- `firrtl-lower-annotations` — process annotation metadata
- `firrtl-lower-intrinsics` — lower intrinsic operations

**Conversion passes** (prefixed `lower-`):
- `lower-firrtl-to-hw` — FIRRTL to HW dialect
- `lower-seq-to-sv` — sequential to SystemVerilog
- `convert-hw-to-llvm` — for simulation flows

**Optimization passes:**
- `canonicalize` — standard MLIR canonicalization
- `cse` — common subexpression elimination
- `hw-cleanup` — hardware-specific cleanup

## circt-translate — Format Translation

Translates between CIRCT's MLIR representation and external formats:

```bash
# MLIR to Verilog
circt-translate --export-verilog input.mlir -o output.sv

# MLIR to split Verilog (one file per module)
circt-translate --export-split-verilog input.mlir -o output_dir/
```

## circt-verilog — SystemVerilog Frontend

Imports SystemVerilog designs into CIRCT using the Slang parser. The imported design enters the Moore dialect and can then be lowered through the standard CIRCT pipeline.

```bash
# Import SystemVerilog and emit MLIR
circt-verilog design.sv -o design.mlir
```

This tool also powers `circt-verilog-lsp-server`, an LSP (Language Server Protocol) implementation that provides IDE features (go-to-definition, find references, diagnostics) for SystemVerilog files.

## Formal Verification Tools

### circt-bmc — Bounded Model Checking

Performs exhaustive state-space exploration up to N clock cycles to find property violations. Converts hardware properties (from `verif` and `ltl` dialects) to SMT formulas and checks them with an external solver.

```bash
circt-bmc --bound 20 design.mlir
```

### circt-lec — Logic Equivalence Checking

Proves that two circuit implementations are functionally equivalent. Used to verify that CIRCT's transformations preserve design semantics.

```bash
circt-lec design_a.mlir design_b.mlir
```

Both tools interface with SMT solvers (Z3, Bitwuzla) through the SMT dialect.

## arcilator — Simulation Compiler

Compiles hardware designs to native simulation binaries through the Arc dialect. Instead of generating C++ source (like Verilator), arcilator goes directly from CIRCT IR to LLVM IR to native code.

```bash
# Compile to simulation binary
arcilator design.mlir -o sim_binary
```

See [simulation.md](research/2026/mlir-hardware/simulation) for detailed information on the Arc dialect and arcilator performance.

## hlstool — High-Level Synthesis Driver

`hlstool` drives CIRCT-based HLS compilation flows, composing internal and external tools for synthesizing C programs to HDL.

```bash
# Compile C to hardware
hlstool --kernel=my_function input.c -o output.sv
```

**Note:** The `circt-hls` project containing hlstool has been largely unmaintained since 2023. For current HLS work, the recommended approach is to use CIRCT's Calyx or Handshake dialects directly.

### Checkpoint Support

hlstool supports `--checkpoint` to save compilation state, enabling resumption at a later point for debugging or iterative development.

## Building CIRCT Tools

All tools are built from the CIRCT repository using CMake and Ninja:

```bash
# Clone with LLVM submodule
git clone --recursive https://github.com/llvm/circt.git
cd circt

# Configure
mkdir build && cd build
cmake -G Ninja ../llvm/llvm \
  -DLLVM_ENABLE_PROJECTS=mlir \
  -DLLVM_EXTERNAL_PROJECTS=circt \
  -DLLVM_EXTERNAL_CIRCT_SOURCE_DIR=.. \
  -DCMAKE_BUILD_TYPE=Release

# Build specific tools
ninja firtool circt-opt circt-translate
```

CIRCT requires a C++17 compiler, CMake 3.13.4+, Python 3, and Ninja. The LLVM submodule pins the exact LLVM/MLIR version tested with the current CIRCT release.

## References

- [CIRCT GitHub Repository](https://github.com/llvm/circt)
- [CIRCT Getting Started](https://circt.llvm.org/docs/GettingStarted/)
- [firtool Documentation](https://circt.llvm.org/docs/Tools/firtool/)
- [CIRCT Passes](https://circt.llvm.org/docs/Passes/)
- [Slang SystemVerilog Parser](https://github.com/MikePopoloski/slang)
- [FIRRTL Dialect Rationale](https://circt.llvm.org/docs/Dialects/FIRRTL/RationaleFIRRTL/)
