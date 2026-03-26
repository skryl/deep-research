---
title: "Weight Construction"
weight: 4
---

## Overview

The weight construction module (`transformer_vm/model/weights.py`) is where the abstract computation graph becomes a concrete neural network. It takes the scheduled computation graph and produces a `VanillaTransformer` with fully populated weight tensors — no training involved. Every weight value is deterministically computed from the graph structure.

## The Transformer Architecture

The model (`transformer_vm/model/transformer.py`) is a straightforward transformer:

```python
class VanillaTransformer(nn.Module):
    tok: Embedding(vocab, d_model)        # Token embedding
    attn: [MultiheadAttention] * n_layers  # Standard multi-head attention (no bias)
    ff_in: [Linear(d_model, 2*d_ffn)] * n_layers  # ReGLU input projection
    ff_out: [Linear(d_ffn, d_model)] * n_layers    # ReGLU output projection
    head: Linear(d_model, vocab)           # Output logits (no bias)
```

The FFN uses ReGLU activation: `ff_in` produces `2 * d_ffn` values, split into `gate` and `val` halves, combined as `ReLU(gate) * val`, then projected back by `ff_out`. This matches the graph DSL's `ReGLUDimension` exactly.

Position encoding is additive and deterministic: slot 0 gets `pos`, slot 1 gets `1/log(2) - 1/log(pos+2)`, slot 2 gets `pos^2`.

## Slot Assignment

Before populating weights, the system assigns each dimension to a **slot** (index in the residual stream vector). The process:

1. **Fixed slots**: `position` -> 0, `inv_log_pos` -> 1, `position_sq` -> 2
2. **Input dimensions**: Assigned slots 3, 4, 5, ... in order
3. **Produced dimensions**: Assigned via interval coloring — when a dimension dies (no future consumers), its slot is freed and can be reused by a later dimension

Slot reuse is critical for keeping `d_model` small. The **erase mechanism** handles this: when a slot is reused, the old value must be zeroed out. This is done via a "passthrough" attention head that reads the slot's current value and subtracts it (coefficient -1 in `out_proj`).

## Embedding Weights

Each token's embedding is the `expr_to_tensor()` of its input expression:

```python
for tok_name, expr in input_tokens.items():
    model.tok.weight[tok_to_idx_map[tok_name]] = expr_to_tensor(expr)
```

For example, a byte token `3a` has embedding `(0x3A + 1) * slot[byte_number] + 0 * slot[carry] + 1 * slot[one]`. Slots 0-2 (position features) are zeroed in the embedding because they're added separately via `add_position_encoding()`.

## Attention Weights

Each attention layer's `in_proj_weight` is a `(3*d_model, d_model)` matrix, packed as `[Q; K; V]` where each section has `d_model` rows. With `n_heads` heads and head dimension 2 (since keys/queries are 2D), the layout is:

**Query rows** (`0 .. d_model-1`):
- Row `h*2`: `expr_to_tensor(query_x) * HARD_K * sqrt(2)` for head h
- Row `h*2+1`: `expr_to_tensor(query_y) * HARD_K * sqrt(2)` for head h

**Key rows** (`d_model .. 2*d_model-1`):
- Row `h*2`: `expr_to_tensor(key_x)` for head h
- Row `h*2+1`: `expr_to_tensor(key_y)` for head h

**Value rows** (`2*d_model .. 3*d_model-1`):
- Row `h*2`: `expr_to_tensor(value_expr_0)` for head h
- Row `h*2+1`: `expr_to_tensor(value_expr_1)` for head h (if present)

The `HARD_K = 1e10` temperature scaling on queries makes softmax approximate argmax — exactly one past token "wins" for each head.

The `out_proj.weight` maps attention outputs back to residual slots:
- For lookup dimensions: `out_proj[slot[dim], h*2 + component] = 1.0`
- For persist1 terms that reference lookup outputs: the coefficient is added directly to `out_proj`

**Passthrough heads** handle non-lookup dependencies of persist1 operations (copying existing residual values through attention). These use a "self-attention" pattern where `Q = K = position`, so the current token always attends to itself. The value projection reads one source slot, and `out_proj` writes the coefficient to the destination slot.

## FFN Weights

The `ff_in` matrix has `2 * d_ffn` rows, split into gate (first half) and value (second half):

```python
fi[j]         = expr_to_tensor(reglu.b_expr)     # gate
fi[d_ffn + j] = expr_to_tensor(reglu.a_expr)     # value
```

The `ff_out` matrix writes results back:
- For non-internal ReGLU dims: `fo[slot[reglu], j] = 1.0`
- For persist2 terms referencing ReGLU outputs: the coefficient is added to `fo[slot[persist], gate_idx]`
- For persist2 terms referencing non-ReGLU dims: a passthrough neuron is added (gate = 1, value reads the source slot)

## Output Head

The output projection `head.weight` is `(vocab, d_model)`, where each row is the scoring expression for one output token:

```python
for tok_name, expr in output_tokens.items():
    model.head.weight[tok_to_idx_map[tok_name]] = expr_to_tensor(expr)
```

These expressions encode the nearest-neighbor scoring described in the [WASM interpreter](../wasm-interpreter) page.

## Erase Tracking

The model stores `attn_erase` and `ffn_erase` lists — which slots are being erased (zeroed) at each layer's attention and FFN phases. The C++ inference engine uses these to efficiently zero slots without full matrix operations.

## Weight Serialization

The `save_weights()` function writes a flat binary file consumed by the C++ engine:

```
Header: vocab, d_model, n_layers, n_heads, d_ffn, stop_token_id (6 x int32)
Token strings: length-prefixed UTF-8
Weight tensors: float64, in order: tok, [attn_ip, attn_op, ff_in, ff_out] * n_layers, head
Erase lists: per-layer slot indices
Tiebreak flags: per-layer per-head (1=latest, 0=average)
```
