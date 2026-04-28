---
title: "Optics & Networking"
weight: 14
---

## The Bucket

**~10 % of the Q4 2025 13F** across two names — Lumentum (an outsized 8.7%) and Coherent. The bucket exists because as model and cluster sizes grow, the **fraction of a training run's wall-clock time spent in collective-communication operations grows superlinearly**. Inter-GPU and inter-rack interconnect bandwidth has become a primary determinant of training throughput, and pluggable optics is the marginal supply.

## Thesis

Three facts drive the bet:

1. **800G and 1.6T pluggable optics are entering volume.** Each NVIDIA GB200/GB300 NVL72 rack ships with hundreds of optical transceivers; each connection across a data-center spine adds another. Per-cluster optics dollar content is growing 3–5x with the GB200 generation.
2. **The supplier base is concentrated.** Lumentum and Coherent (along with Coherent's competitor Marvell-via-Inphi and Broadcom on the SerDes side) supply most of the laser components and full transceivers. A handful of Chinese names (Eoptolink, Innolight) round it out, but the US-China optics decoupling theme favors US-made content for hyperscaler buyers.
3. **Lumentum and Coherent are also coherent-optics plays for inter-DC interconnect.** As model training spans multiple data-center campuses (the so-called "AI gigafactory" topology), wavelength-division-multiplexed coherent optics carry traffic between sites — another structural revenue layer.

## Constituents

| Company | Ticker | Q4 2025 value | % of 13F | Sub-thesis |
|---------|--------|--------------:|--:|------------|
| [Lumentum](research/2026/situational-awareness-fund/companies/lumentum) | LITE | $478.6 M | 8.68% | Lasers + transceivers, cleanest pure-play |
| [Coherent](research/2026/situational-awareness-fund/companies/coherent) | COHR | $88.6 M | 1.61% | Lasers + DC optics + industrial |
|   | **Bucket total** | **$567.2 M** | **10.29%** |   |

## Position History

Both names were added in **Q3 2025** as part of the broader Q3 expansion. Lumentum was sized aggressively from the start, becoming a top-5 holding immediately. Coherent was sized smaller, reflecting its more diversified revenue mix (industrial lasers, materials processing) outside the AI-optics tailwind.

## Read-Through

The 5:1 sizing ratio between Lumentum and Coherent is the tell: the fund prefers the cleaner, less-diversified pure-play. This mirrors the broader portfolio pattern of preferring *concentrated thematic exposure* (CoreWeave for AI cloud, Bloom for on-site power, Intel for US fab) over diversified "pick the basket" expressions. The optics bucket also acts as an indirect NVIDIA exposure — Lumentum's content per system grew when the GB200 design moved from copper to optical interconnects above the rack.
