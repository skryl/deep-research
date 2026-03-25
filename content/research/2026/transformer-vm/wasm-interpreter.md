---
title: "WASM Interpreter"
weight: 2
---

## Overview

The file `transformer_vm/wasm/interpreter.py` is the intellectual heart of the project. It encodes a complete WebAssembly virtual machine — 35 opcodes covering arithmetic, comparisons, control flow, memory access, local/global variables, and function calls — entirely using the computation graph DSL. Every conditional, every arithmetic operation, every memory read is expressed as a composition of `reglu`, `stepglu`, `persist`, `fetch`, and `fetch_sum` primitives.

The `build()` function constructs two dictionaries: `input_tokens` (embedding definitions) and `output_tokens` (next-token scoring expressions). Together, these define a complete autoregressive language model that "speaks" WASM execution traces.

## Opcode Dispatch via Circle Points

The interpreter needs to dispatch on the current opcode — "if the current instruction is `i32.add`, do addition; if it's `local.get`, fetch a local variable." In a conventional program, this is a switch statement. In the transformer, it's done with **circle-point encoding**.

Each of the 35 opcodes is assigned a unique point `(px, py)` on a circle of radius squared `R^2 = 32045`. All points satisfy `px^2 + py^2 = 32045`. The current instruction's opcode is embedded as two input dimensions `(opcode_x, opcode_y)`.

To test whether the current opcode matches a specific operation:

```python
op_dot(op) = px * fetched_opcode_x + py * fetched_opcode_y - R^2 * one + 1
```

This dot product equals exactly **+1** when the fetched opcode matches `(px, py)`, and is **<= -1** for any other circle point (because the points are chosen so that no two are within distance 2 in dot-product space). This means a single `reglu(value, op_dot(op))` gates `value` through only for the matching opcode — one FFN neuron per opcode case.

For the specialized (Futamura projection) mode, `stepglu` is used instead of `reglu` for opcode dispatch, because the fetched values come from FFN piecewise-constant lookups rather than attention, and the dot product may not be exactly +1.

## Token Vocabulary

The model's vocabulary consists of several token types:

**Byte tokens** (`00` through `ff`, with optional carry flag `'`): Represent one byte of computed data. The token `3a'` means "byte value 0x3A with carry=1." Each byte token embeds as `(bv + 1) * byte_number + carry`.

**Commit tokens** (`commit(sd, sts, bt)`): Mark instruction boundaries. Parameters encode the stack delta (`sd`), whether the instruction stored to stack (`sts`), and whether branching occurred (`bt`). These trigger the cumulative sums that update machine state.

**Output tokens** (`out(X)`): Emit a byte to the program's output stream.

**Control tokens**: `branch_taken`, `call_commit`, `return_commit` — signal control flow events.

**Program prefix tokens** (universal mode only): `{`, `}`, and opcode tokens that define the program bytecode as part of the input sequence.

## Machine State via Cumulative Sums

The VM tracks three pieces of running state through `fetch_sum`:

```python
stack_depth, cursor, call_depth = fetch_sum([delta_stack, delta_cursor_expr, delta_call_depth])
```

Each commit/control token contributes deltas to these sums:
- **`stack_depth`**: Net push/pop count, tracking the current stack height
- **`cursor`**: The current instruction pointer, advancing by 1 on normal instructions or jumping on branches
- **`call_depth`**: Current function call nesting level

Since `fetch_sum` uses attention averaging multiplied by position, these are exact running totals at every token.

## Instruction Fetch (Universal Mode)

In universal mode, the program bytecode is embedded as tokens in the input prefix (between `{` and `}`). Each instruction occupies 5 tokens: opcode name + 4 immediate bytes.

To fetch the current instruction, the interpreter computes:

```python
instruction_position = 5 * cursor + 1
```

Then uses attention lookups to retrieve `opcode_x`, `opcode_y`, `stack_delta`, `store_to_stack`, and `is_write` from position `instruction_position`, and the 4-byte immediate from positions `instruction_position + 1..4`.

This means any program can run without rebuilding the model — the program is simply part of the input sequence.

## Instruction Fetch (Specialized Mode)

When `program` is provided (Futamura projection), instruction fetch is done via **piecewise-constant FFN lookups** instead of attention. For each instruction property (opcode_x, opcode_y, etc.), the system builds a step function over the cursor:

```python
def _cursor_lookup(values):
    expr = values[0]
    for i in range(1, N_instr):
        diff = values[i] - values[i-1]
        expr += diff * (step(cursor >= i) - step(cursor > i))
    return expr
```

Each step requires two ReGLU neurons (via `stepglu`), so the FFN grows linearly with program length. But this eliminates all instruction-fetch attention heads, which dominate the universal model's head count.

## Stack Operations

The stack is implemented via attention with `stack_depth` as both query and key:

```python
stack_top_value, stack_top_position = fetch(
    [store_value, position - 4],
    query=stack_depth,
    key=stack_depth,
    clear_key=not_store_to_stack,
)
```

When a value is pushed (a `commit` token with `sts=1`), it writes its key at the current `stack_depth`. When the stack is popped (stack_depth decreases), the old entry naturally becomes inaccessible because the query now targets a lower depth. The `clear_key` mechanism ensures only stack-storing tokens participate.

The `store_value` is a 32-bit integer reconstructed from the preceding 4 byte tokens via byte-position lookups.

## Byte-Level Arithmetic

All arithmetic is byte-serial with explicit carry propagation. For addition:

```python
add_value = second_byte + top_byte + carry_late
add_carry = stepglu(one, add_value - 256)    # carry if sum >= 256
add_byte = add_value - 256 * add_carry       # result byte
```

Subtraction uses borrow instead of carry. Each 32-bit operation processes 4 bytes sequentially (byte_index 0..3), with the carry/borrow token (`'` suffix) propagating between bytes.

## Comparisons

Comparisons combine unsigned magnitude comparison with sign correction:

```python
a_gt_b_u = stepglu(one, stack_second_value - stack_top_value - 1)
a_lt_b_u = stepglu(one, stack_top_value - stack_second_value - 1)
a_eq_b = one - a_gt_b_u - a_lt_b_u
```

For signed comparisons, a `sign_diff` term corrects for two's complement:

```python
sign_diff = (sign bit of top) - (sign bit of second)
a_gt_b_s = stepglu(one, sign_diff + a_gt_b_u - 1)
```

Comparison results are 0 or 1, stored as a single byte (only the first byte is nonzero, via the `is_boundary` gate).

## Memory

Memory uses address-based attention with `clear_key` for mutability:

```python
memory_byte_dirty, memory_byte_dirty_position = fetch(
    [byte_number - 1, memory_write_address],
    query=memory_read_address,
    key=memory_write_address,
    clear_key=not_memory_write_byte,
)
```

A clever trick handles the case where no memory write has occurred at the queried address: the `memory_byte` expression uses three ReGLUs to produce 0 when `memory_byte_dirty_position != memory_read_address` (indicating the nearest key didn't exactly match):

```python
memory_byte = reglu(dirty, diff+1) - 2*reglu(dirty, diff) + reglu(dirty, diff-1)
```

This is a "tent function" that equals `dirty` when `diff == 0` and 0 otherwise.

## Local Variables and Call Stack

Local variables use `call_depth * LOCAL_STRIDE + 4 * local_index + byte_index` as the attention key, giving each call frame its own address space. The `LOCAL_STRIDE` of 256 allows up to 64 locals per frame.

The call stack stores return addresses byte-by-byte using `call_depth * 4 + byte_index` as the key. On `return`, the saved cursor is retrieved and subtracted from the current position to compute the backwards jump offset.

## Next-Token Prediction

The output token scoring uses a **nearest-neighbor** approach. For byte tokens:

```python
score(bv, c) = H * emit_byte + 2*bv * result_byte - bv^2 + 2*c * result_carry - c^2
```

where `H = 1e5` is a large constant. The `H * emit_byte` term ensures byte tokens are only selected when the model is in byte-emitting mode. The remaining terms compute `-(bv - result_byte)^2`, which is maximized when `bv` matches `result_byte`. Since `result_byte` is guaranteed to be an integer 0-255, the argmax always selects the correct byte value.

Similar nearest-neighbor scoring applies to commit tokens (matching `stack_delta` and `store_to_stack`) and output tokens (matching the top-of-stack byte value).
