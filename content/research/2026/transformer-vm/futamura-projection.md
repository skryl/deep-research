---
title: "Futamura Projection"
weight: 7
---

## Overview

The **First Futamura Projection** is a concept from partial evaluation theory: given an interpreter `I` and a program `P`, you can specialize `I` with respect to `P` to produce a compiled version of `P` that no longer needs the interpreter at runtime. Transformer VM implements this literally — baking a specific WASM program into the transformer's FFN weights to create a program-specific neural network.

## How It Works

In the universal model, the program bytecode is part of the input token sequence (the `{...}` prefix). Instruction fetch uses **attention heads** to look up the current opcode and immediate values from the program prefix at each step.

In the specialized model:
1. The program is parsed into an instruction list
2. The `WASMMachine(program=instructions)` constructor passes the program to `build()`
3. Instead of attention-based instruction fetch, **piecewise-constant FFN lookups** map the cursor to instruction properties

The key transformation is `_cursor_lookup()`:

```python
def _cursor_lookup(values):
    """cursor -> values[cursor] via step functions in the FFN."""
    expr = values[0]
    for i in range(1, N_instr):
        diff = values[i] - values[i-1]
        if diff == 0:
            continue
        expr += diff * stepglu(one, cursor - i)  # step up
        expr -= diff * stepglu(one, cursor - i - 1)  # step down (net: plateau)
    return persist(expr)
```

Each instruction boundary requires two ReGLU neurons (one `stepglu`). For a program with N instructions, this adds ~2N ReGLU neurons to the FFN. However, it **eliminates all instruction-fetch attention heads** — which in the universal model account for 6+ heads (fetching opcode_x, opcode_y, stack_delta, store_to_stack, is_write, and 4 immediate bytes).

## Changes in the Specialized Model

### Token vocabulary
- The `{`, `}`, and opcode tokens are removed from the vocabulary
- A `start` token replaces `{` as the sequence initiator
- The vocabulary is smaller (no program-prefix tokens)

### Input format
- Universal: `{ opcode imm0 imm1 imm2 imm3 ... } input_bytes commit`
- Specialized: `start input_bytes commit`

### Opcode dispatch
- Universal: `is_op(op) = reglu(one, op_dot(op))` — works because fetched values are exact
- Specialized: `is_op(op) = stepglu(one, op_dot(op))` — uses step function because FFN lookup values may have small numerical artifacts

### Immediate values
- Universal: Fetched via attention from the program prefix (4 separate lookups)
- Specialized: Each byte is a separate `_cursor_lookup`, combined with `stepglu` to select the correct byte based on `byte_index`

## Usage

```bash
# Specialize for collatz
uv run wasm-specialize transformer_vm/data/collatz.txt --save-weights=collatz.bin

# Run with specialized model (uses _spec.txt input, no program prefix)
uv run wasm-run --model collatz.bin transformer_vm/data/collatz_spec.txt
```

The `specialize()` function in `transformer_vm/specialize.py`:
1. Parses the program from the `.txt` file (extracts instructions between `{` and `}`)
2. Builds a `WASMMachine(program=instructions)` and calls `.build()` to get the computation graph
3. Passes the graph to `build_model()` which runs the MILP scheduler and constructs weights
4. Returns the model, token vocabulary, and instruction list

## Trade-offs

| Aspect | Universal Model | Specialized Model |
|--------|----------------|-------------------|
| **Programs** | Any WASM program | One specific program |
| **Input format** | Program prefix + input | Just input |
| **Instruction fetch** | Attention heads (O(1) per head, but many heads) | FFN neurons (2 per instruction boundary) |
| **d_ffn** | Smaller | Larger (grows with program length) |
| **n_heads** | More (instruction fetch) | Fewer |
| **Rebuild cost** | Once | Once per program |

For small programs, specialization reduces the model significantly. For very large programs (thousands of instructions), the FFN width grows substantially, but the elimination of instruction-fetch attention and the program prefix still provides benefits — especially since the prefix tokens would otherwise consume KV cache space at every step.

## Theoretical Significance

The Futamura projection is a deep result connecting interpreters and compilers. This project demonstrates it concretely in the transformer domain:

- **Interpreter** = Universal WASM transformer (weights encode the interpreter, program is data)
- **Compiler** = `wasm-specialize` (takes a program, produces a specialized transformer)
- **Compiled program** = Specialized transformer (weights encode both interpreter AND program)

This shows that the distinction between "an LLM running a program" and "a neural network that IS the program" is a matter of partial evaluation — the same mathematical framework that connects interpreters and compilers in traditional computer science.
