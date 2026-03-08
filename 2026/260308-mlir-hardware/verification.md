# Formal Verification in CIRCT

CIRCT integrates formal verification as a first-class capability through dedicated MLIR dialects and tools. Rather than bolting verification onto Verilog, CIRCT reasons about hardware properties at the MLIR level, where richer type information and structural invariants are preserved.

## Verification Dialects

### `verif` — High-Level Verification Constructs

The `verif` dialect provides the user-facing verification primitives:

- **`verif.assert`** — a property that must hold (violation = bug)
- **`verif.assume`** — a constraint on the environment (limits input space)
- **`verif.cover`** — a reachability target (can this state be reached?)

These operations carry source locations through the pipeline, so verification failures trace back to the original design source.

### `ltl` — Linear Temporal Logic

The `ltl` dialect expresses temporal properties over sequences of clock cycles:

- **`ltl.delay`** — a property holds after N cycles
- **`ltl.concat`** — sequential composition of properties
- **`ltl.repeat`** — a property holds for N consecutive cycles
- **`ltl.eventually`** — a property eventually holds
- **`ltl.not`**, **`ltl.and`**, **`ltl.or`** — boolean connectives over temporal properties

These compose into SVA (SystemVerilog Assertions)-like properties entirely within MLIR.

### `smt` — SMT Solver Interface

The `smt` dialect interfaces with SMT solvers (Z3, Bitwuzla) for automated reasoning:

- Encodes hardware state and transitions as SMT formulas
- Supports bit-vector theory (matching hardware semantics)
- Provides both satisfiability checking and model extraction

### First-Class Verification Dialects (PLDI 2025)

A recent paper presented at PLDI 2025 ("First-Class Verification Dialects for MLIR") formalizes the approach of embedding verification semantics directly in MLIR dialects, demonstrating that the type system and pass infrastructure of MLIR are well-suited for expressing and checking hardware verification properties.

## Verification Tools

### `circt-bmc` — Bounded Model Checking

Performs bounded model checking: exhaustively explores all reachable states up to N clock cycles, checking that no assertion is violated. Uses the `smt` dialect to encode the verification problem.

### `circt-lec` — Logic Equivalence Checking

Proves that two implementations are functionally equivalent. Primary use cases:

- **Verifying lowering passes**: Proving that a FIRRTL module produces the same outputs as its `hw`/`comb`/`seq` lowering
- **Optimization validation**: Ensuring that optimizations (CSE, constant folding) don't change behavior
- **Cross-tool comparison**: Comparing CIRCT output against other compilers

### Practical Application: OpenTitan

CIRCT's formal verification tools have been validated against OpenTitan, an open-source silicon root-of-trust design. This demonstrates applicability to real-world, production-quality hardware designs.

## K-CIRCT: Formal Semantics for CIRCT

K-CIRCT (2024) provides the first formal semantics for CIRCT hardware IRs using the K framework. Key contributions:

- **Simulation capability**: Can simulate complex hardware designs including RISC-V cores
- **Layered semantics**: A composable mechanism for defining dialect semantics, handling the cross-dialect interactions that arise when operations from different CIRCT dialects coexist
- **Effectful functions**: The formal model uses effectful functions to handle side effects (state updates, I/O) in a compositional way

This enables formal reasoning about the correctness of CIRCT's lowering passes — proving that converting from `firrtl` to `hw`/`comb`/`seq` preserves the design's semantics.

## Verification in the HLS Context

For HLS flows, verification is critical because the gap between the source program and the generated hardware is large. CIRCT's verification tools address this at multiple levels:

1. **Cosimulation**: Dynamatic provides MLIR-based C-to-RTL cosimulation, comparing the hardware's behavior against the original C program cycle by cycle
2. **Equivalence checking**: JuliaHLS plans to use CIRCT's `circt-lec` to verify that lowering passes preserve functional correctness
3. **Fuzzing**: Hardware.jl proposes using fuzzers to automatically generate synthesizable designs and check equivalence across lowering stages

## References

- [First-Class Verification Dialects for MLIR (PLDI 2025)](https://users.cs.utah.edu/~regehr/papers/pldi25.pdf)
- [K-CIRCT: Formal Semantics for CIRCT (arXiv:2404.18756)](https://arxiv.org/html/2404.18756v1)
- [Formal Verification of Hardware using MLIR (ETH Zurich Master Thesis)](https://www.cs.princeton.edu/~ad4048/pdfs/formal-verification-of-hardware-using-mlir.pdf)
