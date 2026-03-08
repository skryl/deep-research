# MLIR-Based Hardware Simulation

CIRCT provides native simulation capabilities through the `arc` dialect and the Arcilator tool, avoiding the traditional roundtrip through Verilog and external simulators. This page covers the simulation infrastructure and its relationship to the broader ecosystem.

## Arcilator: Cycle-Accurate Simulation via MLIR

Arcilator is CIRCT's cycle-accurate hardware simulator. Rather than exporting designs to Verilog and using Verilator or a commercial simulator, Arcilator compiles hardware directly from MLIR to native code via LLVM.

### Architecture

The Arcilator flow:

1. **Input**: Hardware described in CIRCT's core dialects (`hw`/`comb`/`seq`) — from any frontend (Chisel/FIRRTL, SystemVerilog via Moore, Calyx, etc.)
2. **Lowering to `arc` dialect**: Converts hardware modules to state-transition functions. Each clock cycle is modeled as a pure function: `state_next = f(state_current, inputs)`
3. **Lowering to LLVM IR**: The `arc` operations map to LLVM IR operations
4. **JIT or AOT compilation**: LLVM compiles to native machine code

### Key Design Decision

By modeling hardware as pure functions over state, Arcilator can leverage LLVM's full optimization pipeline — inlining, vectorization, constant folding, dead code elimination. This is the same insight that makes Verilator fast (it also compiles to C++), but Arcilator does it entirely within the MLIR/LLVM ecosystem, avoiding the Verilog intermediate step.

### Performance

Arcilator delivers performance comparable to Verilator for cycle-accurate simulation. The `circt/arc-tests` repository provides benchmarks comparing the two, using the same hardware designs with both simulation backends.

### Assumptions and Limitations

Like Verilator, Arcilator assumes **synchronous, edge-triggered** semantics — everything significant happens at clock edges. This is practical for most digital designs but does not support:
- Event-driven simulation (continuous assignments with arbitrary delays)
- Mixed-signal simulation
- Four-state logic (X/Z propagation)

### Waveform Output

CIRCT is working toward a common waveform writer library supporting VCD, FST, and other formats. This would be shared across Arcilator, `circt-bmc`, and `circt-lec` (Google Summer of Code 2025 project).

### Who Develops It

Martin Erhart, a Senior Engineer at SiFive (MSc from ETH Zurich), has been a primary contributor to Arcilator since CIRCT's inception. The work was presented as a tech talk at the LLVM Developers' Meeting in 2023.

## Normal Computing's Event-Driven Simulator (2026)

In early 2026, Normal Computing used AI agents to rapidly extend CIRCT with a full **event-driven simulator**, landing 2,968 commits on a CIRCT fork over 43 days. The additions include:

- **Event-driven scheduler**: Supports continuous assignments with propagation delays, not just edge-triggered logic
- **VPI/cocotb integration**: Python-based testbench support
- **UVM runtime**: SystemVerilog UVM testbench compatibility
- **Bounded model checking**: Formal verification via BMC
- **Logic equivalence checking**: Proving design equivalence
- **Mutation testing**: Automated fault injection

This demonstrates CIRCT's extensibility — the MLIR infrastructure makes it feasible to build a complete verification stack on top of the existing dialect framework.

## Relationship to External Simulators

### Verilator

The industry-standard open-source simulator. Arcilator aims to match its performance while avoiding the Verilog intermediate step. For CIRCT-based flows (Chisel, HLS), using Arcilator directly avoids:
- Potential semantic gaps from Verilog export
- Loss of source location information
- The need to maintain Verilog-specific workarounds

### ESSENT

A FIRRTL-native simulator that operates directly on FIRRTL IR (not Verilog). Like Arcilator, it avoids the Verilog roundtrip, but uses the legacy FIRRTL representation rather than MLIR.

### GSIM

Another simulator in the Chipyard ecosystem that accepts FIRRTL input.

### Commercial Simulators

VCS (Synopsys), Xcelium (Cadence), and Questa (Siemens) remain the standard for production verification. CIRCT's simulators target development-phase simulation and regression testing where open-source, fast compilation, and tight integration with the design flow matter more than full SystemVerilog compliance.

## Cosimulation with ESI

The ESI (Elastic Silicon Interconnect) dialect provides cosimulation endpoints, enabling hardware-software cosimulation where the hardware side runs in Arcilator while software communicates through ESI's typed channels. This is particularly valuable for verifying accelerator designs where the hardware must interact with host software.

## References

- [Arcilator LLVM Dev Meeting Talk (2023)](https://llvm.org/devmtg/2023-10/slides/techtalks/Erhart-Arcilator-FastAndCycleAccurateHardwareSimulationInCIRCT.pdf)
- [Arc Tests Repository](https://github.com/circt/arc-tests)
- [Normal Computing Blog: Building an Open-Source Simulator](https://normalcomputing.com/blog/building-an-open-source-verilog-simulator-with-ai-580k-lines-in-43-days)
- [GSoC 2025 CIRCT Ideas](https://fossi-foundation.org/gsoc/gsoc25-ideas)
