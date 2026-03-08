# LLVM/MLIR for Hardware Verification and Simulation — Deep Research

**Date:** 2026-03-08
**Topic:** The LLVM/MLIR compiler stack for hardware design, simulation, and verification

## Overview

The CIRCT (Circuit IR Compilers and Tools) project applies LLVM and MLIR's modular compiler infrastructure to hardware design tooling. Rather than treating Verilog or VHDL as interchange formats — with all their well-known limitations around type safety, location tracking, and composability — CIRCT defines a layered set of MLIR dialects that capture hardware semantics at multiple abstraction levels. This enables the same progressive-lowering philosophy that made LLVM successful for software compilers: high-level design intent is gradually refined through well-defined intermediate representations down to synthesizable RTL.

The project emerged from collaborations between SiFive, Google, and academic groups, and now lives under the LLVM umbrella. It serves as the backend for Chisel/FIRRTL (via `firtool`), provides MLIR-based simulation infrastructure (Arcilator), integrates formal verification tools (`circt-bmc`, `circt-lec`), and supports multiple high-level synthesis flows. The LLHD (Low Level Hardware Description) project, which pioneered the idea of applying LLVM-style IR to hardware, has been integrated as the `llhd` dialect within CIRCT.

## Key Findings

- **Arcilator** (the `arc` dialect simulator) transforms hardware into register-to-register transfer arcs compiled directly to native code via LLVM, matching or beating Verilator performance without any Verilog roundtrip.
- **Khronos** (MICRO 2023) achieves 2.03x average speedup over circt-verilator by fusing memory accesses with temporal locality; up to 4.3x on systolic designs.
- **RepCut** (ASPLOS 2023, Distinguished Paper) achieves 27.10x superlinear parallel speedup using 24 threads on ESSENT with replication-aided partitioning.
- **Formal verification** is integrated through `verif`, `ltl`, and `smt` dialects — `circt-bmc` performs bounded model checking and `circt-lec` does logic equivalence checking, verified against real designs like OpenTitan and Ibex.
- The **Verif dialect** introduces formal contracts (`verif.contract`) for compositional verification of large designs with deep module hierarchies.
- The **LTL dialect** captures the core formalism of SystemVerilog Assertions, mapping SVA constructs (implication, delay, repetition) to MLIR operations.
- The **Moore dialect** provides a SystemVerilog frontend (powered by Slang), reaching 73% of the sv-tests compliance suite.
- **LLHD** (PLDI 2020) introduced the concept of a multi-level hardware IR inspired by LLVM, with a simulator running up to 2.4x faster than commercial tools.
- **BTOR2MLIR** bridges hardware model checking (HWMCC) with MLIR/LLVM, connecting to SeaHorn's BMC engine.
- The **PLDI 2025 paper** on first-class verification dialects found 5 miscompilation bugs in upstream MLIR and verified transfer functions detecting 36.6% more known bits.
- An RFC (March 2025) proposes upstreaming the `verif` and `smt` dialects to MLIR itself, enabling formal verification of general MLIR programs beyond hardware.

## Contents

| File | Description |
|------|-------------|
| [architecture.md](architecture.md) | MLIR foundations, CIRCT project structure, and the progressive lowering pipeline |
| [dialects.md](dialects.md) | All 30+ MLIR dialects in CIRCT — purpose, operations, and IR examples |
| [tools.md](tools.md) | Key tools: firtool, circt-opt, circt-translate, arcilator, circt-bmc/lec |
| [simulation.md](simulation.md) | MLIR-based simulation: arc dialect, Arcilator, ESSENT, Khronos, Parendi |
| [verification.md](verification.md) | Formal verification: verif/ltl/smt dialects, bounded model checking, equivalence checking |
| [hls.md](hls.md) | High-level synthesis: Calyx, Dynamatic, ScaleHLS, and domain-specific compilers |
| [chisel-firrtl.md](chisel-firrtl.md) | Chisel, FIRRTL, and the SFC-to-CIRCT migration |
| [ecosystem.md](ecosystem.md) | Moore dialect, LLHD, UVM comparison, and the open-source EDA landscape |
| [community.md](community.md) | Contributors, governance, and organizational involvement |
