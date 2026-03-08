# CIRCT Ecosystem: SystemVerilog, LLHD, and EDA Integration

## The Moore Dialect: SystemVerilog Frontend

### Purpose

The Moore dialect provides CIRCT's SystemVerilog ingestion pathway. Its main goal is to serve as the target for the `ImportVerilog` conversion, which translates a fully parsed, type-checked, and elaborated Slang AST into MLIR operations.

### Design Philosophy

The Moore dialect faithfully captures full SystemVerilog types and semantics, providing a platform for transformation passes to:
- Resolve language quirks and ambiguities
- Analyze the design at a high level
- Lower to CIRCT's core dialects (hw, comb, seq)

### Moore vs. SV Dialect

CIRCT has two SystemVerilog-related dialects that serve different purposes:

| Aspect | Moore Dialect | SV Dialect |
|--------|--------------|------------|
| Direction | **Ingestion** (parsing SV into MLIR) | **Emission** (generating SV from MLIR) |
| Goal | Faithfully capture SV semantics | Produce clean, readable SV output |
| Status | Active development | Production use |

The two dialects may eventually converge, but keeping them separate allows the Moore dialect to evolve rapidly without disrupting the production SV emission pipeline.

### Frontend: circt-verilog / Slang

The `circt-verilog` tool uses **Slang** as its SystemVerilog parser. Slang is a high-quality, standards-compliant SystemVerilog frontend that handles the full complexity of the language including:
- Elaboration and type checking
- Generate blocks and parameterization
- Interface and modport resolution

### Supported Constructs

The Moore dialect supports key SystemVerilog constructs including:
- **Procedures**: `initial`, `final`, `always`, `always_comb`, `always_latch`, `always_ff` (via `moore.procedure`)
- **Expressions**: concatenation (`{x, y, z}`), shift operations, conditional expressions
- **Data types**: unpacked arrays, structs, unions, enums
- **Hierarchy**: module instantiation, port connections

### sv-tests Compliance

As of early 2026, CIRCT's SystemVerilog compliance stands at **73%** on the sv-tests suite (CHIPS Alliance), compared to:
- Verilator: 94%
- Icarus Verilog: 80%

This reflects the relative youth of the Moore frontend, but progress has been rapid.

---

## LLHD: Low Level Hardware Description

### Background

**LLHD** (Low Level Hardware Description) was proposed by Fabian Schuiki, Andreas Kurth, Tobias Grosser, and Luca Benini at **PLDI 2020** as a multi-level intermediate representation for hardware description languages.

### The Problem

Modern HDLs (SystemVerilog, VHDL) are enormously complex, and each EDA tool lowers them to its own proprietary IR. These tools:
- Are monolithic and mostly proprietary
- Disagree in their implementation of HDL semantics
- Maintain many redundant, incompatible IRs
- Cannot share a single IR through the entire design flow

### LLHD's Design (Inspired by LLVM)

LLHD aims to do for hardware what LLVM did for software: provide a single, well-defined IR that tools can share. Designs are represented by three types of "units":

1. **Functions** -- pure combinational logic, equivalent to LLVM functions
2. **Processes** -- sequential logic with control flow, using basic blocks like LLVM IR
3. **Entities** -- data-flow units consisting of an unordered set of instructions forming a data-flow graph (unique to hardware -- no software equivalent)

Names follow LLVM conventions: global names (`@`-prefixed), local names (`%`-prefixed), and anonymous names.

### Key Results

- The LLHD simulator runs up to **2.4x faster** than commercial simulators while producing equivalent, cycle-accurate results
- Demonstrated on designs as complex as full CPU cores
- A reference compiler was built to validate the IR's expressiveness

### Relationship to CIRCT

LLHD has been integrated into CIRCT as the `llhd` dialect. The original standalone LLHD project has evolved into part of the broader CIRCT ecosystem:

- The **Moore** compiler (Rust-based, by the same author) serves as a hardware compiler frontend that originally output LLHD assembly
- Moore now depends on the CIRCT project (and transitively on MLIR and LLVM)
- The LLHD dialect in CIRCT captures event-driven simulation semantics alongside the cycle-accurate semantics of other dialects

### LLHD Dialect in CIRCT

The `llhd` dialect within CIRCT depends on MLIR and LLVM builds. It provides operations for:
- Signal declarations and assignments
- Process definitions with wait statements
- Time-based scheduling (drive-after semantics)
- Entity instantiation

---

## Comparison with Traditional EDA Verification

### Universal Verification Methodology (UVM)

UVM is the industry-standard verification methodology, built on SystemVerilog. It provides:
- **Reusable verification components**: drivers, monitors, scoreboards, agents, environments
- **Constrained random verification**: automated stimulus generation with functional coverage
- **Transaction-level modeling**: abstract communication between verification components
- **Phase management**: standardized simulation phases (build, connect, run, etc.)

Used by Intel, NVIDIA, Qualcomm, ARM, AMD, and virtually every major semiconductor company.

### The Open-Source UVM Gap

UVM has historically been locked to commercial simulators because:
- UVM is implemented in SystemVerilog, which is enormously complex
- No open-source SystemVerilog implementation fully supports the UVM class library
- Commercial tools (VCS, Questa, Xcelium) have exclusive practical support

### CIRCT's Approach vs. Traditional EDA

| Aspect | Traditional UVM/EDA | MLIR/CIRCT |
|--------|-------------------|------------|
| **Maturity** | Industry standard since ~2011 | Experimental, rapidly evolving |
| **Tooling** | Proprietary (Synopsys, Cadence, Siemens) | Open source (LLVM-based) |
| **IR** | Verilog/VHDL as interchange | MLIR multi-level dialects |
| **Modularity** | Tool-specific, inconsistent | Library-based, composable |
| **UVM Support** | Full commercial support | Recently demonstrated (2026) |
| **Formal + Simulation** | Separate tools and flows | Unified IR and passes |
| **Cost** | Expensive licenses ($100K+/seat/year) | Free and open source |
| **Assertion Language** | SVA (IEEE 1800) | LTL + Verif dialects (maps from SVA) |
| **Coverage** | Built-in functional coverage | Simulator-independent coverage research |

### SystemVerilog Assertions (SVA) vs. CIRCT Verif/LTL

The three core SVA constructs map directly to CIRCT operations:

| SVA Construct | Purpose | CIRCT Equivalent |
|---------------|---------|-----------------|
| `assert property(...)` | Check property holds | `verif.assert` + `ltl.*` |
| `assume property(...)` | Constrain verification environment | `verif.assume` + `ltl.*` |
| `cover property(...)` | Track property exercised | `verif.cover` + `ltl.*` |

CIRCT's representation has the advantage of being tool-independent -- the same assertions can be:
- Checked by `circt-bmc` (formal bounded model checking)
- Exported to SystemVerilog for commercial tools
- Used by Arcilator during simulation
- Exported to BTOR2 for model checking competitions

### Recent Breakthrough: Open-Source UVM Runtime (2026)

In January-February 2026, Normal Computing used AI agents to land 2,968 commits on a CIRCT fork, adding:
- Full 4-state event-driven simulator
- VPI/cocotb integration
- **UVM runtime support**
- Bounded model checking and logic equivalence checking
- Mutation testing

They successfully ran Mirafra's open-source AVIPs (Advanced Verification IP) -- complete UVM testbenches for standard bus protocols -- end to end. No other open-source simulator had previously been able to even compile these testbenches.

### Simulator-Independent Coverage

Research from Kevin Laeufer (ASPLOS 2023) demonstrated simulator-independent coverage for RTL hardware languages. Rather than coverage being tied to a specific simulator's implementation, coverage metrics are defined at the IR level and can be computed by any compliant tool. This aligns with CIRCT's philosophy of tool-independent representations.

---

## MLIR-Based Equivalence Checking and Property Verification Tools

### circt-lec

CIRCT's logic equivalence checker, using Z3 as the SMT backend. Can compare any two modules in the CIRCT core representation. Has been validated against real designs including Ibex's ALU.

### K-CIRCT

Provides executable formal semantics for CIRCT using the K framework. Enables simulation, symbolic interpretation, and equivalence checking derived from the same semantic specification. Successfully simulated a RISC-V design (mini-riscv).

### BTOR2MLIR

Bridges the hardware model checking world (BTOR2/HWMCC) with MLIR/LLVM, enabling SeaHorn's BMC engine to verify hardware properties expressed as BTOR2 circuits.

### First-Class Verification Dialects (PLDI 2025)

Makes formal semantics a first-class MLIR citizen. Found 5 miscompilation bugs in upstream MLIR and verified transfer functions that detect 36.6% more known bits than the upstream implementation.

---

## The Broader Open-Source Hardware Verification Landscape

Beyond CIRCT, the open-source hardware verification ecosystem includes:

| Tool | Category | Relationship to CIRCT |
|------|----------|----------------------|
| **Verilator** | Cycle-accurate simulator | Competitor/complement; CIRCT can generate Verilog for Verilator |
| **Icarus Verilog** | Event-driven simulator | Competitor; lower SV compliance than CIRCT |
| **Yosys** | Synthesis framework | Can export to BTOR2 for formal verification |
| **SymbiYosys** | Formal verification frontend | Uses Yosys + Z3/ABC; CIRCT alternative |
| **cocotb** | Python verification framework | Integrates with CIRCT via VPI |
| **Chiseltest** | Chisel testing framework | Uses CIRCT's firtool as backend |
| **sv-tests** | SV compliance suite | Used to benchmark CIRCT's SV support |

CIRCT's key differentiator is the unified IR approach: simulation, formal verification, synthesis, and code generation all share the same intermediate representation, enabling optimizations and analyses that cross traditional tool boundaries.
