---
title: "High-Level Synthesis Flows on MLIR"
weight: 5
---


High-level synthesis (HLS) translates algorithmic descriptions (typically in C, C++, Python, or Julia) into hardware implementations (RTL). MLIR's multi-level abstraction is a natural fit for HLS, which inherently involves bridging the gap between software-like algorithms and hardware circuits. This page covers the major MLIR-based HLS tools and their approaches.

## Calyx — Cornell's Compiler Infrastructure for Accelerators

**Origin**: Cornell University, CAPRA group (Adrian Sampson's lab)
**First published**: ASPLOS 2021[^1] ("A Compiler Infrastructure for Accelerator Generators")
**Language**: 56,000 lines of Rust, 18,000 lines of Python, 56 contributors, 2,200+ issues
**Repository**: [github.com/calyxir/calyx](https://github.com/calyxir/calyx)

### The Calyx IR

Calyx is an intermediate language that separates hardware into two orthogonal concerns:

1. **Structure**: The datapath — what hardware components exist (registers, adders, memories, multiplexers) and how they are wired together.
2. **Control**: The schedule — when each group of assignments is active, using FSM-like constructs: `seq` (sequential), `par` (parallel), `if`, `while`, `repeat`.

This separation is Calyx's key insight. Traditional HLS tools interleave scheduling decisions with datapath generation, making them hard to compose. By keeping structure and control separate, Calyx enables:

- Independent optimization of the datapath and the schedule
- Multiple frontends targeting the same IR
- Composable compiler passes

### Calyx's Role as "LLVM for Accelerators"

The Calyx team explicitly positions it as the LLVM of accelerator design: a common intermediate representation that many source languages can target and many backends can consume. Current frontends include:

- **Dahlia**: A programming language for reconfigurable accelerators
- **TVM/Relay**: Neural network models via the TVM compiler
- **Allo/PyTorch**: PyTorch models via the Allo framework (2025)
- **NTT (Number-Theoretic Transform)**: Specialized crypto accelerators
- **Systolic array generators**: Parameterized accelerator templates

### Integration with CIRCT

Calyx is integrated into CIRCT as a first-class dialect. The CIRCT `calyx` dialect mirrors the native Calyx IR, and CIRCT provides lowering passes from `calyx` to `hw`/`comb`/`seq` for SystemVerilog emission. This means Calyx designs can use CIRCT's verification and simulation infrastructure.

### PyTorch-to-Calyx Flow (2025-2026)

Presented at C4ML 2026 (Sydney)[^2], this end-to-end toolchain:
1. Takes a PyTorch model
2. Uses Allo to translate to MLIR (leveraging `affine` and other dialects)
3. Applies MLIR-level optimizations (memory banking, loop tiling)
4. Lowers to the Calyx dialect in CIRCT
5. Emits synthesizable SystemVerilog for FPGA deployment

Key results: up to 3x faster kernels than commercial HLS in banked memory configurations. The team also developed a full floating-point library for Calyx, integrating Berkeley HardFloat components.

### Calyx Performance Characteristics

- **Static scheduling**: The FSM-based control means the schedule is fully determined at compile time
- **Predictable latency**: Every operation's timing is known, enabling tight integration with external systems
- **Area efficiency**: No dynamic scheduling overhead (no token passing, no credit-based flow control)
- **Limitation**: Cannot exploit runtime parallelism when data dependencies vary dynamically

## Dynamatic — EPFL's Dynamic Scheduling HLS

**Origin**: EPFL Processor Architecture Laboratory (Paolo Ienne's group) and ETH Zurich Dynamo Research Group
**Repository**: [github.com/EPFL-LAP/dynamatic](https://github.com/EPFL-LAP/dynamatic)
**Website**: [dynamatic.epfl.ch](https://dynamatic.epfl.ch/)
**Key paper**: "A Dynamically Scheduled HLS Flow in MLIR"[^3] (EPFL Infoscience)

### Dynamic vs. Static Scheduling

Traditional HLS tools generate **statically scheduled** datapaths — the execution order is fixed at compile time. This works well for regular, predictable computations but struggles with:

- **Variable-latency memory**: Cache hits vs. misses change timing at runtime
- **Data-dependent control flow**: Branches with unpredictable outcomes
- **Irregular memory access patterns**: Sparse matrix operations, graph algorithms

Dynamatic generates **dynamically scheduled** circuits where components communicate via handshake protocols (ready/valid signaling). Each operation fires when all its inputs are available, adapting the schedule at runtime to actual data and control outcomes.

### MLIR-Based Architecture (v2.0)

Dynamatic v2.0 is a complete rewrite built on MLIR, replacing the legacy LLVM IR-based version. The compilation flow:

1. **C/C++ input** is parsed by a fork of Polygeist (a C/C++ frontend for MLIR)
2. The program enters MLIR as standard dialects (`affine`, `scf`, `arith`, `memref`)
3. MLIR-level optimizations are applied (polyhedral analysis, memory optimization)
4. The program is lowered to the **Handshake dialect** — converting imperative code to dataflow circuits
5. Handshake operations are lowered to RTL (targeting `hw`/`comb`/`seq`)
6. SystemVerilog is emitted for Xilinx FPGA synthesis

The Handshake dialect inherited from CIRCT is central to this flow, but recent releases of Dynamatic no longer depend on CIRCT as a build dependency (reducing build time by approximately half).

### Key Capabilities

- **C-to-RTL cosimulation**: MLIR-based tooling for validating designs against the original C code
- **Visual debugging**: Graphical visualization of the dataflow circuit
- **Speculative execution**: Buffer insertion and speculation for improved throughput
- **Memory disambiguation**: Dynamic resolution of memory dependencies at runtime

### Performance

Dynamatic delivers significant performance improvements over commercial HLS tools for applications with irregular control flow or memory access patterns. JuliaHLS benchmarks (December 2025) showed Dynamatic v2.0 achieving strong throughput on signal processing kernels, though JuliaHLS was able to compile several programs that Dynamatic could not.

## ScaleHLS — UIUC's Scalable HLS Framework

**Origin**: UIUC Chen Lab (Deming Chen's group)
**Repository**: [github.com/UIUC-ChenLab/scalehls](https://github.com/UIUC-ChenLab/scalehls)
**Key papers**: HPCA 2022, DAC 2022, ASPLOS 2024 (HIDA)

### Multi-Level Optimization

ScaleHLS's[^4] key contribution is exploiting MLIR's multi-level nature for HLS optimization. Existing HLS tools based on LLVM operate at a single abstraction level — LLVM IR — and must solve all optimization problems there. ScaleHLS operates at three levels:

1. **Graph level**: Dataflow graph of the computation — fusion, splitting, replication of computation nodes
2. **Loop level**: Uses MLIR `affine` and `scf` dialects — tiling, unrolling, interchange, pipelining
3. **Directive level**: HLS-specific pragmas — pipeline initiation interval (II), array partitioning, resource binding

A custom `hlscpp` dialect represents HLS-specific structures and program directives (e.g., loop pipelining pragmas).

### Design Space Exploration (DSE)

ScaleHLS includes an automated DSE engine that searches across the optimization space at all three levels. Results: up to 768x improvement on computation kernels and up to 3,825x on neural network models versus baseline Vivado HLS designs, with optimization taking only 37-61 seconds.

### Backend Strategy

ScaleHLS currently generates optimized HLS C/C++ code as output, feeding into downstream tools like AMD Vitis HLS for RTL generation. Future work aims to integrate directly with CIRCT for native RTL emission.

### HIDA Extension (ASPLOS 2024)

The Hierarchical Dataflow (HIDA) extension adds support for multi-level dataflow architectures, enabling ScaleHLS to target complex accelerator designs with hierarchical parallelism.

### Limitations

ScaleHLS supports only static scheduling and is noted as "not well-suited for handling looped codes generated from straight-line codes." Recent work suggests combining ScaleHLS and Dynamatic in a hybrid backend for broader coverage.

## PipelineC — Vendor-Agnostic Auto-Pipelining

**Creator**: Julian Kemmerer
**Repository**: [github.com/JulianKemmerer/PipelineC](https://github.com/JulianKemmerer/PipelineC)
**Implementation**: Pure Python (calls external synthesis tools)

### Approach

PipelineC[^5] takes a different approach from the MLIR-based tools: it is a C-like HDL with automatic pipelining as a compiler feature. Rather than full HLS (converting arbitrary C to hardware), PipelineC autopipelines pure functions — if a computation has no side effects, the compiler automatically inserts pipeline registers to meet timing.

### Key Features

- **Automatic pipelining of pure functions**: Conceptually similar to Intel Hyper-Pipelining or Xilinx retiming, but as a language-level feature
- **Multi-vendor support**: Works with Xilinx Vivado, Intel Quartus, Gowin EDA, Efinix Efinity, Cologne Chip, and Lattice ECP5 (via GHDL+Yosys+NextPNR)
- **Human-readable output**: Generates synthesizable, debuggable VHDL
- **Incremental adoption**: Can generate single pipelines to drop into existing VHDL/Verilog designs, or serve as a complete HDL replacement
- **Raw HDL inclusion**: Existing VHDL can be included directly

### Relationship to MLIR

PipelineC does not use MLIR. Its significance in this landscape is as a complementary open-source alternative — it fills the gap for non-Xilinx FPGAs that lack HLS support. While MLIR-based tools (Calyx, Dynamatic, ScaleHLS) focus on algorithmic-to-RTL compilation, PipelineC focuses on the narrower problem of automatic register insertion for timing closure.

## Other Notable HLS Projects

### JuliaHLS / Hardware.jl (2025)

A Julia-to-hardware flow[^7] that leverages CIRCT for SystemVerilog generation. Demonstrated on real FPGAs (Pynq Z1), achieving 59.7-82.6% of C++ HLS throughput. Supports both dynamic and static scheduling, integrates with AXI4-Stream. Presented at LATTE '25.

### ARIES (FPGA '25)

An agile MLIR-based compilation flow[^8] targeting AMD Versal AIE architectures (with or without FPGA fabric). Achieved 4.92 TFLOPS (FP32) on Versal VCK190 with 1.17-1.59x throughput improvement over state-of-the-art.

### hls4ml — ML Inference on FPGAs

While not MLIR-based itself, hls4ml[^6] is the dominant tool for deploying ML models on FPGAs with ultra-low latency. Originated at CERN for LHC trigger systems, now used across scientific and industrial domains. Supports Keras, PyTorch, and ONNX frontends, targeting AMD Vitis HLS, Intel Quartus, and Catapult HLS backends. The related da4ml library (2025) uses MLIR/LLVM via Numba for optimized arithmetic.

### POM Framework

An open-source optimizing framework[^9] on MLIR that explicitly divides compilation into three layers: dependence graph IR, polyhedral IR, and annotated affine dialect. The annotated MLIR affine dialect represents HLS pragmas in loop hierarchies, bridging polyhedral semantics and synthesizable HLS code.

### HeteroCL (HCL)

An MLIR-based framework from Cornell that supports a CPU backend through the LLVM dialect and an FPGA backend through Vivado HLS. A HeteroCL program first generates HCL dialect IR, then transformation passes implement hardware customizations before conversion to the affine dialect.

## Comparison of HLS Approaches

| Feature | Calyx | Dynamatic | ScaleHLS | PipelineC |
|---------|-------|-----------|----------|-----------|
| **Scheduling** | Static (FSM) | Dynamic (dataflow) | Static | Static (auto-pipeline) |
| **Input language** | Multiple (via frontends) | C/C++ | C/C++, PyTorch | C-like HDL |
| **MLIR-based** | Yes (CIRCT dialect) | Yes (own MLIR flow) | Yes | No |
| **Output** | SystemVerilog (via CIRCT) | SystemVerilog | HLS C/C++ (currently) | VHDL |
| **Target devices** | Vendor-agnostic | Xilinx FPGAs | AMD/Xilinx | Multi-vendor |
| **Irregular control** | Limited | Excellent | Limited | N/A |
| **ML workloads** | Good (PyTorch flow) | Moderate | Excellent (HIDA) | Limited |
| **Maturity** | Research + production use | Research | Research | Production-ready |

## The Two Routes from MLIR to Hardware

MLIR-based HLS tools have two main paths to generate hardware:

1. **Direct RTL emission via CIRCT**: Lower MLIR to CIRCT's core dialects (`hw`/`comb`/`seq`) and emit SystemVerilog. Used by Calyx, Dynamatic, JuliaHLS. Advantage: fully open-source, end-to-end control.

2. **Generate HLS C/C++ for vendor tools**: Lower MLIR to C/C++ (via `emitc` dialect or custom emission) and feed into AMD Vitis HLS, Intel HLS, or Catapult. Used by ScaleHLS, HeteroCL. Advantage: leverages vendor tool optimizations for specific FPGA architectures.

The trend is toward direct RTL emission, with ScaleHLS planning CIRCT integration and hls4ml exploring Google XLS as an alternative backend.

## Footnotes

[^1]: [Calyx ASPLOS 2021 Paper](https://dl.acm.org/doi/10.1145/3445814.3446712)
[^2]: [PyTorch-to-Calyx (arXiv:2512.06177)](https://arxiv.org/html/2512.06177)
[^3]: [Dynamatic MLIR Paper](https://infoscience.epfl.ch/record/292189)
[^4]: [ScaleHLS (arXiv:2107.11673)](https://arxiv.org/abs/2107.11673)
[^5]: [PipelineC GitHub](https://github.com/JulianKemmerer/PipelineC)
[^6]: [hls4ml (arXiv:2512.01463)](https://arxiv.org/html/2512.01463v1)
[^7]: [JuliaHLS (arXiv:2512.15679)](https://arxiv.org/html/2512.15679v1)
[^8]: [ARIES FPGA '25 Paper](https://www.csl.cornell.edu/~zhiruz/pdfs/aries-fpga2025.pdf)
[^9]: [POM Framework (arXiv:2401.05154)](https://arxiv.org/html/2401.05154v1)

## References

- [Calyx Project](https://calyxir.org/)
- [Calyx ASPLOS 2021 Paper](https://dl.acm.org/doi/10.1145/3445814.3446712)
- [PyTorch-to-Calyx (arXiv:2512.06177)](https://arxiv.org/html/2512.06177)
- [Dynamatic Website](https://dynamatic.epfl.ch/)
- [Dynamatic GitHub](https://github.com/EPFL-LAP/dynamatic)
- [Dynamatic MLIR Paper](https://infoscience.epfl.ch/record/292189)
- [ScaleHLS (arXiv:2107.11673)](https://arxiv.org/abs/2107.11673)
- [ScaleHLS GitHub](https://github.com/UIUC-ChenLab/scalehls)
- [PipelineC GitHub](https://github.com/JulianKemmerer/PipelineC)
- [hls4ml (arXiv:2512.01463)](https://arxiv.org/html/2512.01463v1)
- [ARIES FPGA '25 Paper](https://www.csl.cornell.edu/~zhiruz/pdfs/aries-fpga2025.pdf)
- [JuliaHLS (arXiv:2512.15679)](https://arxiv.org/html/2512.15679v1)
- [POM Framework (arXiv:2401.05154)](https://arxiv.org/html/2401.05154v1)
