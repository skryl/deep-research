---
title: "Attention and Hull Cache"
weight: 5
---

## Overview

Standard autoregressive transformer inference is O(n) per token because each new token must attend over all previous tokens. For programs generating hundreds of thousands or millions of tokens, this becomes prohibitive. The Transformer VM solves this with an **O(log n) convex hull KV cache** that exploits the specific structure of hardmax attention.

## Hardmax Attention

The model uses softmax attention with an extreme temperature scaling (`HARD_K = 1e10`), which makes it behave as **argmax** — for each query, exactly one past key "wins" and its value is returned with weight ~1.0. This is not an approximation; the WASM interpreter's correctness requires exact retrieval.

In standard softmax attention, the output is a weighted blend of all values. In hardmax, it's effectively:

```
output = V[argmax_i(Q . K_i)]
```

This means the attention output depends only on the **winning key** — all other keys are irrelevant.

## Why Convex Hulls?

The winning key maximizes the dot product `Q . K`. In 2D (which is the key dimension used throughout this system), this is equivalent to finding the point on the **upper convex hull** of the key set that has the maximum projection along the query direction.

Geometrically: the 2D keys form a point cloud. The query defines a direction. The point furthest in that direction is always a **vertex of the convex hull** — interior points can never be optimal. This means we only need to maintain the convex hull of the key set, not the full set.

An incremental 2D convex hull supports:
- **Insert**: O(log n) amortized — add a new point, update the hull
- **Query**: O(log n) — binary search the hull vertices for the maximum dot product

## The CHT (Convex Hull Trick) Implementation

The C++ header `transformer_vm/attention/hull2d_cht.h` implements a 2D convex hull data structure optimized for this use case. It maintains the upper hull of all inserted 2D key points, supporting:

1. **`insert(kx, ky, vx, vy, seq)`**: Add a new key-value pair with sequence number
2. **`query(qx, qy)`**: Find the key maximizing `qx * kx + qy * ky`, return its value `(vx, vy)` and sequence number

The hull is maintained as a sorted structure, enabling O(log n) binary search for the tangent point given any query direction.

## Python Wrapper

The `HullKVCache` class (`transformer_vm/attention/hull_cache.py`) wraps the C++ extension via pybind11:

```python
class HullKVCache:
    def __init__(self, n_layers, n_heads):
        ext = _load_ext()  # JIT-compile hull_ext.cpp
        self._cache = ext.HullKVCache(n_layers, n_heads)

    def layer_step(self, layer, keys, queries, values):
        # Insert KV pair and query all heads in one call
        return self._cache.layer_step(layer, keys, queries, values, self._seq)
```

The extension is built on first use via PyTorch's `torch.utils.cpp_extension.load()`, compiling `hull_ext.cpp` with C++17 and O3 optimization.

## Tiebreak Modes

Each head has a configurable tiebreak mode:
- **Latest** (`tiebreak=1`): When multiple keys have the same maximum dot product, return the value from the most recent token. This is used for mutable state (local variables, memory, stack) where overwrites should shadow previous values.
- **Average** (`tiebreak=0`): Return the average of all values. This is used for `fetch_sum` (cumulative sums), where the attention is intentionally averaging all past tokens.

## Standard Cache Fallback

The `StandardKVCache` (`transformer_vm/attention/standard_cache.py`) provides an O(n) reference implementation that stores all keys/values and computes full softmax attention at each step. This is used for correctness testing and as a fallback when the C++ hull extension isn't available. The `--nohull` flag enables this mode.

## Impact on Performance

For the Sudoku solver example (~900K tokens), the hull cache reduces per-token attention cost from O(900K) to O(log 900K) ~ O(20), enabling the ~30K tok/s throughput. Without the hull cache, the same program would be roughly 45,000x slower per token at the end of execution.
