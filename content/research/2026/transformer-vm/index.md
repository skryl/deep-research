---
title: "Transformer VM"
date: 2026-03-25
---

## Overview

Transformer VM is a project by Percepta Core that demonstrates something remarkable: a standard softmax-ReGLU transformer whose weights are computed **analytically** (not trained) that correctly simulates a WebAssembly virtual machine on arbitrary programs. In other words, it constructs a neural network that functions as a deterministic computer, executing real C programs compiled to WebAssembly bytecode — running algorithms like Sudoku solvers that generate 900K tokens at ~30K tokens/second.

This is not a language model that has "learned" to code. The transformer weights are **derived mathematically** from the semantics of a WASM interpreter, guaranteeing perfect execution. The project proves that the transformer architecture is computationally universal in a very concrete sense: you can hand-craft weights that make it function as a CPU.

## Key Findings

- The system compiles C programs through LLVM/Clang to WebAssembly, then encodes the entire WASM virtual machine as a **computation graph** of five primitive types that map directly to transformer components (embeddings, attention heads, and ReGLU FFN neurons).
- Weights are constructed **analytically** — no gradient descent, no training data. Each attention head and FFN neuron is assigned a specific computational role derived from the WASM interpreter's logic.
- A **MILP (Mixed Integer Linear Programming) scheduler** optimally packs the computation graph into transformer layers, minimizing the model's `d_model` dimension while respecting data dependencies.
- An **O(log n) convex hull KV cache** exploits the fact that hardmax attention (softmax with extreme temperature) always selects a vertex of the 2D convex hull of keys, reducing per-token cost from O(n) to O(log n).
- The **First Futamura Projection** allows "baking" a specific program into the FFN weights, eliminating the program prefix and instruction-fetch attention heads entirely — creating a specialized transformer that is a compiled version of one specific program.

## Architecture

The system has six major subsystems that form a pipeline from C source code to transformer inference:

```
C source → [Compiler] → WASM bytecode → [Graph Builder] → Computation DAG
    → [MILP Scheduler] → Layer assignment → [Weight Constructor] → Transformer weights
    → [Inference Engine] → Token-by-token execution → Output
```

## Pages

- [Computation Graph DSL](computation-graph) — The five primitive dimension types and how they map to transformer components
- [WASM Interpreter](wasm-interpreter) — How 35 WebAssembly opcodes are encoded as algebraic expressions over graph primitives
- [MILP Scheduler](milp-scheduler) — Optimal packing of computation into transformer layers
- [Weight Construction](weight-construction) — Analytical derivation of embedding, attention, FFN, and output head weights
- [Attention and Hull Cache](attention-hull-cache) — Hardmax attention, 2D key mapping, and O(log n) convex hull KV cache
- [Compilation Pipeline](compilation-pipeline) — From C source to WASM token prefix
- [Futamura Projection](futamura-projection) — Specializing the interpreter into a program-specific transformer
