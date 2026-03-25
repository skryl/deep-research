---
title: "MILP Scheduler"
weight: 3
---

## Overview

The MILP scheduler (`transformer_vm/scheduler/milp.py`) solves a critical optimization problem: given the computation graph (hundreds of dimensions with complex dependencies), assign each operation to a transformer layer and phase to **minimize `d_model`** — the width of the residual stream.

A smaller `d_model` means fewer parameters, less memory, and faster inference. But operations have data dependencies (you can't compute `add_byte` before `add_value`), and different operation types must go in specific phases within a layer. The MILP formulation finds the optimal assignment.

## Layer Structure

Each transformer layer has a **4-phase** structure:

| Phase | Index | Operation Type | Mechanism |
|-------|-------|---------------|-----------|
| 0 | `4L` | Attention (LookUp) | Multi-head attention retrieves values from history |
| 1 | `4L+1` | Persist1 | Linear projection stores attention results |
| 2 | `4L+2` | FFN (ReGLU) | Gated nonlinear computation |
| 3 | `4L+3` | Persist2 | Linear projection stores FFN results |

This maps directly to the standard transformer architecture: each layer does attention followed by FFN, with each half producing intermediate results (persists) that feed forward.

## What the MILP Minimizes

The objective is to minimize `D_half = d_model / 2`. The constraint is that at every persist boundary (phases 1 and 3 of every layer), the number of **simultaneously live dimensions** that need a residual slot must not exceed `2 * D_half`.

A dimension is "live" from the phase it's produced until the last phase where any consumer reads it. Dimensions that are produced and fully consumed within the same half-layer (e.g., a ReGLU whose output is immediately captured by a persist in the same layer) are "internal" and don't need a slot.

Additionally, the attention half-layer has its own width constraint:

```
2 * D_half >= 2 * n_lookup_heads + dying_dims + passthrough_dims
```

This accounts for the fact that attention heads consume pairs of residual slots (for 2D keys), and passthrough operations (copying values through attention for persist1) also consume heads.

## Decision Variables

The MILP uses several classes of integer/binary variables:

- **`k[op]`**: Layer index (0 to N-1) for each operation
- **`z[op]`**: Binary, for persist operations only — 0 means persist1 (phase 1), 1 means persist2 (phase 3)
- **`death[d]`**: Integer, the last phase where dimension `d` is consumed
- **`ns[d]`**: Binary, whether a lookup/reglu dimension needs a residual slot (survives past its half-layer)
- **Various indicator variables** for tracking which operations land in which layers

## Key Constraints

**Dependency ordering**: If operation B depends on operation A's output, then `phase(B) >= phase(A) + 1`.

**Phase parity**: LookUps must go in phase 0 (attention), ReGLUs in phase 2 (FFN), Persists in phase 1 or 3.

**Tight coupling**: ReGLU/persist operations that consume `fetch_sum` (average-mode lookups) must be in the **same layer** as the lookup, because the position multiplication in `fetch_sum` requires the lookup result to be in the same residual stream step.

**Width at boundaries**: At each persist boundary, the count of live slotted dimensions must fit within `d_model`.

**FFN width limit**: Optionally, the number of ReGLU neurons per layer can be capped with `max_ffn`.

## Solver and Output

The MILP is solved using HiGHS (preferred) or CBC via the PuLP library, with a 1-hour time limit. The optimal solution typically finds a schedule with 7-10 layers for the universal WASM interpreter.

The output includes:
- **`plan.yaml`**: Complete schedule showing which operations go where, with dependency and linear widths at each boundary
- **`std_layers`**: Python data structure consumed by the weight constructor
- **`alive_after`**: At each boundary, the set of dimensions that are still live
- **Linear width analysis**: The rank of the future-consumption matrix at each boundary, showing how much information is actually needed (often much less than the dependency width)

## Interval Coloring

After the MILP determines *when* each dimension is live, the `interval_coloring()` function determines *which slot* each dimension occupies. This is a greedy algorithm: dimensions are processed in birth order, and each is assigned the lowest-numbered free slot (one whose previous occupant has died). This maximizes slot reuse and keeps `d_model` small.

Three slots are permanently reserved for the positional dimensions (`position`, `inv_log_pos`, `position_sq`) because the embedding writes to them on every token.
