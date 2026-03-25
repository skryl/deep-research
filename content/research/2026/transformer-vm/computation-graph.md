---
title: "Computation Graph DSL"
weight: 1
---

## Overview

The foundation of Transformer VM is a domain-specific language (DSL) defined in `transformer_vm/graph/core.py` that models computations as a directed acyclic graph (DAG) of **dimensions**. Each dimension represents a scalar value that lives in one slot of the transformer's residual stream. The DSL provides exactly the operations that a transformer can natively compute — and nothing more — so any program expressible in this DSL can be mechanically compiled into transformer weights.

The key insight is that a transformer layer performs two operations: **attention** (lookup from history) and **FFN** (pointwise nonlinear gating). The DSL captures these as primitive dimension types, then builds all WASM interpreter logic by composing them.

## The Five Primitive Dimension Types

### InputDimension

Fixed values set per token via the embedding matrix. Every token embeds into a vector where each `InputDimension` gets a coefficient. The system uses several built-in input dimensions:

- **`one`** — always 1.0 (except for the start token where it's 0); acts as a bias term
- **`position`** — the token's sequence position (0, 1, 2, ...)
- **`inv_log_pos`** — `1/log(2) - 1/log(pos+2)`; used for tie-breaking in attention
- **`position_sq`** — `pos^2`; used to compute quadratic key expressions without extra FFN neurons

Additional input dimensions encode the semantic meaning of each token — for example, `byte_number` carries the byte value (0-255) of data tokens, `carry` indicates arithmetic carry, and `delta_stack` / `delta_cursor` track how commit tokens modify the machine state.

### ReGLUDimension

The core nonlinear primitive, mapping directly to one neuron in a ReGLU (ReLU-Gated Linear Unit) FFN:

```
ReGLU(a, b) = ReLU(b) * a
```

The FFN weight matrix `ff_in` has `2 * d_ffn` rows: the first half computes the gate signals `b`, the second half computes the value signals `a`. The output `ff_out` projects results back to the residual stream.

Two helper functions build all conditional logic from ReGLU:

**`reglu(a, b)`** — When `b` is known non-negative, this equals `a * b`. Used for gated selection: `reglu(value, gate)` passes `value` through when `gate > 0`.

**`stepglu(a, b)`** — Implements the step function `a * step(b >= 0)` using **two** ReGLU neurons combined via a persist:

```python
stepglu(a, b) = reglu(a, b + 1) - reglu(a, b)
```

For integer `b`, this equals `a` when `b >= 0` and `0` when `b < 0`. This is the fundamental conditional primitive — all if/else logic in the WASM interpreter is built from `stepglu`.

### PersistDimension

A pure linear projection that materializes a linear combination into a dedicated residual slot. Unlike ReGLU (which requires an FFN neuron), persist is realized through the `ff_out` projection matrix — it simply stores `sum(coeff_i * dim_i)` into a new slot.

Persist serves two purposes:
1. **Reducing `d_model`**: Once a persist captures a linear combination, the constituent dimensions can be freed (their slots reused by later dimensions).
2. **Bridging half-layers**: The output of multiple ReGLU neurons within the same FFN layer can be combined into a single persist slot rather than each occupying a separate residual dimension.

### LookUpDimension

Attention-based retrieval from the token history. Each `LookUp` operation defines:
- **Query expressions** (2D) — computed from the current token's residual stream
- **Key expressions** (2D) — computed from each past token's residual stream
- **Value expressions** — what to retrieve from the winning past token

The system uses **hardmax attention** (softmax with temperature `HARD_K = 1e10`), which effectively performs `argmax` — finding the single past token whose key best matches the query. This is critical: the WASM VM needs exact retrieval (e.g., "fetch the value at stack position 5"), not soft blending.

Tie-breaking modes:
- **`"latest"`** — among tied keys, prefer the most recent token (via `inv_log_pos`)
- **`"average"`** — compute the average of all values (used for `fetch_sum`)

### CumSumDimension

Cumulative sums via attention averaging. The `fetch_sum` function uses the "average" tie-breaking mode: since all keys are equal (`KEY_OFFSET`), attention averages all past values. Multiplying the average by `position` recovers the exact cumulative sum. This is how the VM tracks running state like stack depth, instruction cursor, and call depth.

## 1D-to-2D Key Mapping

Attention in a standard transformer computes `softmax(Q * K^T / sqrt(d_k)) * V`. To achieve **exact nearest-key matching** in 1D, the system maps 1D keys and queries into 2D:

**Key mapping** (parabolic embedding):
```
key_x = 2 * k
key_y = -k^2     (plus optional clear_key and tie-break terms)
```

**Query mapping**:
```
query_x = q
query_y = 1
```

The dot product becomes:
```
Q . K = q * 2k + 1 * (-k^2) = -(q - k)^2
```

This is maximized (equals 0) when `q == k`, achieving exact key matching via standard dot-product attention. The parabolic embedding ensures the closest key always wins.

The `clear_key` mechanism allows "deleting" keys: when `clear_key > 0`, a massive penalty (`-BIG * clear_key`) is added to `key_y`, effectively removing that token from consideration. This enables mutable state — when a local variable is overwritten, the old value's key is cleared so the new value is fetched instead.

## Expression Algebra

The `Expression` class represents linear combinations of dimensions with coefficients: `sum(c_i * dim_i)`. It supports arithmetic (`+`, `-`, `*` by scalar) and automatically eliminates zero terms. This algebra propagates through the entire system — input token embeddings, output token scoring, attention queries/keys/values, and FFN gate/value inputs are all `Expression` objects.

When `build_model()` converts the computation graph to weight tensors, each `Expression` maps to a row/column of a weight matrix via `expr_to_tensor()`, which places each dimension's coefficient at the dimension's assigned slot index.

## Graph Lifecycle

The `reset_graph()` function clears all global state (dimension lists, lookup lists, caches) and recreates the four built-in positional dimensions. `ProgramGraph` captures a snapshot of the fully-constructed graph (all dimensions, lookups, and token definitions), which is then passed to the MILP scheduler and weight constructor.

The `auto_name()` function assigns human-readable names to dimensions based on the local variable names in the caller's scope — purely for debugging and diagnostic output.
