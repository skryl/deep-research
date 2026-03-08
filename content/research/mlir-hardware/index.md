---
title: "LLVM/MLIR for Hardware Design"
date: 2026-03-08
---

## Overview

The CIRCT (Circuit IR Compilers and Tools) project applies LLVM and MLIR's modular compiler infrastructure to hardware design tooling. Rather than treating Verilog or VHDL as interchange formats — with all their well-known limitations around type safety, location tracking, and composability — CIRCT defines a layered set of MLIR dialects that capture hardware semantics at multiple abstraction levels. This enables the same progressive-lowering philosophy that made LLVM successful for software compilers: high-level design intent is gradually refined through well-defined intermediate representations down to synthesizable RTL.

The project emerged from collaborations between SiFive, Google, Microsoft, and academic groups (Cornell, EPFL, ETH Zurich, UIUC), and now lives under the LLVM umbrella. It serves as the backend for Chisel/FIRRTL (via `firtool`), provides MLIR-based simulation infrastructure (Arcilator), integrates formal verification tools (`circt-bmc`, `circt-lec`), and supports multiple high-level synthesis flows including Calyx, Dynamatic, and ScaleHLS. The ESI (Elastic Silicon Interconnect) dialect addresses SoC communication with typed, latency-insensitive interconnect.

## Key Findings

- CIRCT defines **30+ MLIR dialects** spanning the full hardware design stack: from high-level scheduling (`calyx`, `handshake`, `pipeline`) through RTL (`hw`, `comb`, `seq`) to SystemVerilog emission (`sv`, `emit`).
- The **progressive lowering** approach mirrors LLVM's IR pipeline — designs flow through dialect-to-dialect transformations, enabling optimization at each abstraction level.
- **`firtool`** has replaced the Scala FIRRTL compiler as the official Chisel backend, providing 10-100x faster compilation for large SoC designs.
- **Calyx** (Cornell) provides an "LLVM for accelerators" — a compiler infrastructure with 56K lines of Rust, separating hardware structure from control scheduling. The PyTorch-to-Calyx flow (C4ML 2026) achieves up to 3x speedup over commercial HLS with memory banking.
- **Dynamatic** (EPFL) generates dynamically scheduled dataflow circuits from C/C++ via MLIR, excelling on irregular control flow and variable-latency memory access patterns.
- **ScaleHLS** (UIUC) exploits MLIR's multi-level nature for HLS optimization at graph, loop, and directive levels — achieving up to 3,825x improvement over baseline Vivado HLS on neural networks.
- **PipelineC** provides vendor-agnostic auto-pipelining across Xilinx, Intel, Gowin, Efinix, and Lattice FPGAs.
- MLIR **`affine`** and **`scf`** dialects enable polyhedral loop analysis for HLS scheduling, with ScaleHLS, POM, and HeteroCL all building on these abstractions.
- **ESI (Elastic Silicon Interconnect)** from Microsoft provides typed, latency-insensitive channels that abstract away signaling protocol details (AXI, Avalon-MM).
- **Arcilator** compiles hardware to native code via LLVM for cycle-accurate simulation, matching Verilator performance without Verilog roundtrip.
- **Formal verification** is integrated through `verif`, `ltl`, and `smt` dialects — validated against real designs like OpenTitan.
- **Real-world adoption**: SiFive uses CIRCT in production for RISC-V design; Google, Microsoft, AMD, Apple, Intel, NVIDIA, and ARM all use MLIR; the Chipyard SoC framework builds on CIRCT.
- **hls4ml** (CERN) dominates ultra-low-latency ML inference on FPGAs, with the da4ml extension (2025) connecting to MLIR/LLVM via Numba.

## Contents

| File | Description |
|------|-------------|
| [architecture.md](architecture.md) | MLIR foundations, CIRCT project structure, and the progressive lowering pipeline |
| [dialects.md](dialects.md) | All 30+ MLIR dialects in CIRCT — purpose, operations, and IR examples |
| [tools.md](tools.md) | Key tools: firtool, circt-opt, circt-translate, arcilator, circt-bmc/lec |
| [simulation.md](simulation.md) | MLIR-based simulation: arc dialect, Arcilator, ESSENT, Khronos, Parendi |
| [verification.md](verification.md) | Formal verification: verif/ltl/smt dialects, bounded model checking, equivalence checking |
| [hls.md](hls.md) | High-level synthesis: Calyx, Dynamatic, ScaleHLS, PipelineC, hls4ml, and domain-specific compilers |
| [chisel-firrtl.md](chisel-firrtl.md) | Chisel, FIRRTL, and the SFC-to-CIRCT migration |
| [ecosystem.md](ecosystem.md) | HDL integration (Chisel, Amaranth, SpinalHDL), ESI dialect, FPGA tooling, and real-world adoption |
| [community.md](community.md) | Contributors, governance, and organizational involvement |
