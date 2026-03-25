---
title: "Compilation Pipeline"
weight: 6
---

## Overview

The compilation pipeline (`transformer_vm/compilation/`) transforms C source code into the token sequences that the transformer consumes. The pipeline has several stages:

```
C source → [Clang/LLVM] → WASM binary → [Decoder] → WASM instructions
    → [Lowerer] → Simplified WASM → [Compiler] → Dispatch table
    → [Formatter] → Token prefix file (.txt)
```

## Stage 1: C to WebAssembly

The `compile_c_to_wasm()` function invokes Clang with the `wasm32` target:

```bash
clang --target=wasm32 -nostdlib -O2 -fno-builtin -fno-jump-tables \
    -mllvm --combiner-store-merging=false \
    -Wl,--no-entry -Wl,--export=compute -Wl,--export=__heap_base \
    -Wl,-z,stack-size=4096 -Wl,--initial-memory=10485760 \
    -include runtime.h -o output.wasm input.c
```

Key flags:
- **`-fno-jump-tables`**: Forces if-else chains instead of jump tables, which the VM doesn't support
- **`--combiner-store-merging=false`**: Prevents LLVM from merging adjacent stores into wider stores
- **`-include runtime.h`**: Auto-injects a C runtime that provides `printf`, `sscanf`, `putchar`, etc. via the VM's `output` opcode
- **`--export=compute`**: The entry point function
- **`--export=__heap_base`**: Used to determine where to place input data in memory

## Stage 2: WASM Binary Decoding

The `decoder.py` module implements a minimal WebAssembly MVP binary decoder. It reads the `.wasm` file and extracts:
- **Type section**: Function signatures (parameter and return types)
- **Import section**: External functions (e.g., `output_byte`)
- **Function section**: Type indices for locally-defined functions
- **Export section**: Named exports (`compute`, `__heap_base`)
- **Code section**: Function bodies with local variable declarations and instruction sequences
- **Data section**: Initialized memory segments
- **Global section**: Global variable definitions

## Stage 3: Lowering Hard Operations

The `lower.py` module expands operations that the transformer VM doesn't natively support into sequences of supported operations. Unsupported ops and their lowered equivalents:

| Operation | Lowering Strategy |
|-----------|------------------|
| **MUL** | Decomposed into shifts and adds (for constants) or iterative addition |
| **DIV/MOD** | Long division via repeated subtraction and comparison |
| **AND** | Bit-by-bit using comparisons and arithmetic |
| **OR** | Bit-by-bit using comparisons and arithmetic |
| **XOR** | Bit-by-bit using comparisons and arithmetic |
| **SHL** | Repeated addition (left shift by n = multiply by 2^n) |
| **SHR** | Iterative halving via comparison |

The lowerer handles both **constant operands** (compile-time known values, e.g., `x & 0xFF`) and **variable operands** (runtime values requiring loops). Constant operands produce much shorter instruction sequences.

## Stage 4: Dispatch Table Construction

The `compile_function()` function flattens WASM's structured control flow (blocks, loops, if/else) into a flat dispatch table with absolute branch targets:

- **`block`/`loop`/`if`/`else`/`end`** — Tracked via a label stack; `br` and `br_if` targets are resolved to absolute positions, then converted to relative offsets
- **`call`** — Resolved to the callee's absolute position in the dispatch table
- **`return`** — Encoded with a negative offset (from current position back to call site)
- **`global.get/set`** — Expanded to memory load/store at `GLOBAL_BASE + 4 * global_index`

The `build_program()` function assembles the complete dispatch table:

1. **Prologue**: Input base address, local variable initialization (`i32.const` + `local.set` for each local), memory initialization (data segments and globals written via `i32.store8`)
2. **Main function body**: Compiled with `is_main=True` (return → halt)
3. **Called functions**: Each with parameter prologues (`local.set` for each parameter), compiled with `is_main=False` (return → relative offset back)
4. **Branch/call target resolution**: Absolute positions converted to relative offsets from current instruction

## Stage 5: Token Prefix Formatting

The final output is a text file with the format:

```
{
opcode hex0 hex1 hex2 hex3
opcode hex0 hex1 hex2 hex3
...
}
input_byte1 input_byte2 ... commit(+0,sts=0,bt=0)
```

The `{...}` block contains the program bytecode. After `}`, optional input bytes are appended followed by a commit token. For the specialized model, a separate `_spec.txt` file is generated with just `start` + input tokens (no program prefix).

## Example Programs

The `examples/` directory contains six C programs of increasing complexity:

| Program | Description | Tokens |
|---------|------------|--------|
| **hello.c** | Hello world via printf | ~1K |
| **addition.c** | Long addition with carry | ~2K |
| **collatz.c** | Collatz sequence (ADD/SUB only) | ~5K |
| **fibonacci.c** | Fibonacci with sscanf/printf | ~10K |
| **min_cost_matching.c** | Hungarian algorithm | ~100K |
| **sudoku.c** | Constraint-propagation solver | ~900K |

The `manifest.yaml` file lists all programs with their default input arguments, enabling batch compilation via `wasm-compile --all`.
