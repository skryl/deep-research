---
title: "CIRCT Contributors and Governance"
weight: 9
---


## Project History

CIRCT emerged around 2020 from the intersection of two trends: the maturation of MLIR as a general-purpose compiler infrastructure, and the growing need for better open-source hardware design tools driven by the RISC-V ecosystem.

### Key Milestones

- **2019-2020**: Chris Lattner, while at SiFive, initiated the project to apply MLIR (which he had created at Google) to hardware design tooling. Early work focused on the FIRRTL dialect as a replacement for the Scala FIRRTL Compiler.
- **2020**: The project was established under the LLVM umbrella at `llvm/circt` on GitHub, following LLVM's open-source governance model.
- **2021-2022**: Rapid dialect development — HW, Comb, Seq, SV, ESI, Calyx, and others were designed and implemented. firtool reached feature parity with the SFC for common use cases.
- **2023-2024**: firtool became the default Chisel backend. The Moore dialect for SystemVerilog import matured. The Arc dialect and arcilator simulation backend were developed. Formal verification tools (circt-bmc, circt-lec) were added.
- **2025-present**: Continued refinement, with recent releases including firtool-1.135.0+. Active work on the Moore dialect (SystemVerilog frontend), Arc simulation optimizations, and new dialects like Synth and RTG.

## Founding and Leadership

### Chris Lattner

Chris Lattner is the co-founder and driving force behind CIRCT. His prior work:
- **LLVM** — created the LLVM compiler infrastructure (from 2000)
- **Clang** — created the C/C++ compiler frontend for LLVM
- **Swift** — created the Swift programming language at Apple
- **MLIR** — created MLIR at Google (2018-2019), which became part of the LLVM project
- **SiFive** (2020-2022) — led Engineering and Product teams, where CIRCT development accelerated
- **CIRCT** — applied the MLIR infrastructure he built to hardware design

Lattner's involvement ensures deep alignment between CIRCT and the broader LLVM/MLIR infrastructure.

## Organizational Contributors

### SiFive

SiFive is the most significant industrial contributor to CIRCT. As a leading RISC-V chip design company, SiFive has a direct business need for fast, reliable hardware compilation:

- **firtool development**: SiFive engineers drove the development of firtool as a replacement for the SFC, motivated by the need to compile large commercial SoC designs efficiently.
- **chisel-circt**: SiFive developed and maintained the `chisel-circt` library (now archived, as upstream Chisel supports CIRCT natively).
- **FIRRTL dialect**: Much of the FIRRTL dialect implementation was driven by SiFive's production requirements.
- **Annotation support**: SiFive contributed extensive annotation handling for their chip design workflows.

Chris Lattner led SiFive's engineering from January 2020 to January 2022, during CIRCT's formative period.

### Google

Google's contributions center on the MLIR foundation that CIRCT is built upon:

- **MLIR infrastructure**: Google created and continues to develop MLIR, which provides all of CIRCT's core infrastructure (dialects, pass management, type system, tooling).
- **TPU compiler team**: Google's hardware compiler work for TPUs influenced MLIR's design and CIRCT's architecture.
- **Direct CIRCT contributions**: Google engineers contribute to CIRCT dialects and passes.

### Microsoft

Microsoft has contributed the **MSFT dialect**, which serves as a staging area for hardware design features:

- Linear datapath pipelining
- Dynamic instance hierarchy representation
- Vendor-specific attributes (e.g., Intel Quartus `set_instance_assignment`)
- FPGA-targeted transformations

Microsoft presented jointly with SiFive at HotChips 2022 on CIRCT.

### Cornell University

Cornell's contributions include:

- **Calyx**: The Calyx intermediate language and its CIRCT dialect, developed by Adrian Sampson's research group. Calyx is a key target for HLS (high-level synthesis) flows.
- **Formal verification**: Research on formal semantics for CIRCT dialects.

### EPFL (Ecole Polytechnique Federale de Lausanne)

- **Dynamatic**: An HLS tool using CIRCT's Handshake dialect for dynamic scheduling.
- **Parendi**: Research on massively parallel RTL simulation.

### Other Academic Contributors

- **Peking University**: Khronos simulator built on CIRCT/MLIR
- **UC Santa Cruz**: ESSENT simulator integration with FIRRTL
- **FZI (Forschungszentrum Informatik)**: Contributions to Arc dialect and LLVM version bumps

## Key Individual Contributors

Based on GitHub commit history and release activity, prominent contributors include:

- **Fabian Schuiki** (`@fabianschuiki`) — extensive contributions across Moore dialect, Arc/simulation, and core infrastructure
- **Hideto Ueno** (`@uenoku`) — circt-verilog-lsp-server, Synth dialect, Python bindings, AIG analysis
- **Mike Urbach** (`@mikeurbach`) — LLVM version bumps and infrastructure maintenance
- **Andrew Lenharth** — SiFive, FIRRTL compiler and firtool pipeline
- **John Demme** — Microsoft, ESI dialect
- **Jacques Pienaar** (`@jpienaar`) — Google, Slang integration
- **Prithayan Barua** — SiFive, FIRRTL optimizations

The GitHub contributors page at `github.com/llvm/circt/graphs/contributors` lists over 200 individual contributors, though specific commit counts by time period require direct repository analysis.

## Governance

CIRCT operates under the **LLVM project's governance structure**. There is no separate CIRCT-specific governance document — the project follows all LLVM policies:

### Contribution Process

1. **Pull requests**: All changes go through GitHub pull requests with code review
2. **Code review**: Changes require approval from a project committer
3. **Commit access**: Granted based on sustained, quality contributions (LLVM policy)
4. **LLVM coding standards**: All code follows LLVM's C++ coding standards
5. **Testing**: Changes must include tests (typically FileCheck-based regression tests)

### Communication Channels

- **LLVM Discourse Forum**: The primary venue for design discussions, RFCs, and announcements (under the CIRCT category)
- **LLVM Discord Server**: The `#circt` channel for real-time discussion
- **Weekly video meetings**: Open meetings for design discussions and status updates
- **GitHub issues and PRs**: For bug reports, feature requests, and code review

### Decision Making

Design decisions follow LLVM's consensus-based model:

1. Proposals are posted to LLVM Discourse
2. Community discussion and iteration
3. Rough consensus among active contributors
4. Implementation with code review

For significant changes (new dialects, architectural decisions), an RFC (Request for Comments) is posted to Discourse and discussed over at least a week before proceeding.

### Recent Policy Discussions

The CIRCT community has recently discussed:

- **Requiring pull requests for all commits** (moving away from direct pushes to main)
- **Contribution policies for external forks** — clarifying how code from forks should be contributed back

## Project Statistics

As of early 2026:

- **GitHub stars**: ~2,000+
- **GitHub forks**: ~430+
- **Contributors**: 200+ individual contributors
- **Commits**: 10,000+ (GitHub omits line-count statistics at this scale)
- **Dialects**: 30+
- **Release cadence**: Frequent tagged releases (firtool-1.x.0) coordinated with Chisel releases

## Ecosystem and Adoption

CIRCT's adoption extends beyond its direct contributors:

- **Chipyard**: UC Berkeley's SoC design framework uses firtool as its FIRRTL compiler
- **Chisel**: The hardware description language natively supports CIRCT as its backend
- **OpenTitan**: Google's open-source silicon root of trust project has used CIRCT for formal verification
- **CHIPS Alliance**: Industry consortium that supports CIRCT-adjacent projects
- **Academic research**: Multiple research groups build on CIRCT for simulation, verification, and HLS research

## References

- [CIRCT GitHub Repository](https://github.com/llvm/circt)
- [CIRCT Contributors](https://github.com/llvm/circt/graphs/contributors)
- [LLVM Discourse — CIRCT Category](https://discourse.llvm.org/c/circt/)
- [LLVM Governance](https://llvm.org/docs/GoverningBoard.html)
- [CHIPS Alliance](https://chipsalliance.org/)
- [Chipyard SoC Framework](https://chipyard.readthedocs.io/)
- [OpenTitan Project](https://opentitan.org/)
