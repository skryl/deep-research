---
title: "Enfabrica (private)"
weight: 72
---

## Snapshot

- **Status:** Private — but effectively hollowed out: in **September 2025 NVIDIA paid over $900M** (cash and stock) to hire CEO Rochan Sankar and other key employees and to license Enfabrica's technology. The corporate entity was not acquired.
- **Sector:** AI networking silicon — "Accelerated Compute Fabric" (ACF) SuperNICs that aggregate networking, PCIe/CXL, and memory pathways for GPU clusters.
- **Last known valuation:** ~**$600M** post-money after a $115M late-2024 round (PitchBook, via CNBC) — i.e., the NVIDIA payment exceeded the company's last private valuation by ~50%.
- **Atreides involvement:** **Confirmed.** Atreides **led the $125M Series B** (Sep 2023); Gavin Baker took a board seat.
- **Likely vehicle(s):** Foundation Fund VC sleeve and/or a [Special Circumstances SPV](research/2026/atreides/private-book) — the Sep 2023 timing predates the Valor Atreides AI JV (first Form D Jan 2025), so the JV is ruled out. Vehicle attribution is inference, **unconfirmed**.

## Business Overview

Enfabrica, founded in 2019–2020 by Rochan Sankar (ex-Broadcom switching) and Shrijeet Mukherjee (ex-Google networking), designed a new category of datacenter chip: a converged ACF SuperNIC intended to replace the patchwork of NICs, PCIe switches, and top-of-rack gear that bottlenecks large GPU clusters. The company claimed its fabric could coherently connect **over 100,000 GPUs**, with multi-terabit (3.2Tbps-class) throughput per device, and in 2025 introduced EMFASYS, a memory-fabric system extending the same silicon toward pooled external memory for inference. The pitch was squarely aimed at the scale-out networking layer where Nvidia (Mellanox heritage), Broadcom, and hyperscaler in-house designs compete.

The reported strength of the design is the reason the story ended the way it did: rather than buy the company, **NVIDIA executed a license-plus-acquihire**, taking the CEO, key engineers, and technology rights for >$900M while leaving the corporate shell — and its cap table — behind. It mirrors the 2025 pattern of Meta/Scale AI, Google/Windsurf-style transactions structured to avoid merger review.

## Atreides' Involvement

- **Series B lead (confirmed):** September 2023 — Atreides led the **$125M Series B**, with NVIDIA itself participating; the round was reported as a ~5x valuation step-up from Series A. Baker joined the board (Business Wire announcement).
- **Late-2024 round:** $115M from Spark Capital, Arm, Samsung, and Cisco at ~$600M post-money (PitchBook). Atreides' participation in this round is **not reported**.
- **Outcome for shareholders (unresolved):** This is the key open question. Public reporting (CNBC, Sep 18, 2025) confirms the >$900M went to hiring Sankar and staff and licensing the technology, but **no source discloses how much, if any, of the consideration flowed to Enfabrica's shareholders**, whether the license fee was paid to the company (and could fund a distribution), or what the residual entity is worth. We could find no 2026 reporting on a wind-down, secondary sale, or distribution. Treat Atreides' realized outcome as **unknown**; given Atreides led at a valuation well below $600M and NVIDIA's payment exceeded the last round's headline valuation, a positive outcome is **probable** if proceeds were shared, but that is inference.

## Why Atreides Owns It

Enfabrica was a pure expression of Baker's connectivity-bottleneck thesis — the same logic as the public-book positions in optics and interconnect (Astera Labs from its Series C, Credo, Ciena/Coherent-type names): as GPU FLOPs outrun network and memory bandwidth, the value migrates to whoever un-bottlenecks the cluster. Leading a Series B with a board seat is unusually early and concentrated for Atreides, signaling high conviction that the NIC/fabric layer would be a chokepoint. The thesis was arguably vindicated in the most backhanded way possible: the incumbent monopolist judged the technology and team worth >$900M — 50% above the company's last private mark — but structured the deal so that validation didn't automatically translate into a clean shareholder exit. As a case study, Enfabrica is now the canonical example of "acquihire-and-license" risk in AI venture: being right on the bottleneck does not guarantee the cap table gets paid.

## Risks

- **Realization risk (the dominant one):** with the CEO, key staff, and a technology license gone to NVIDIA, the residual company's value and any path to shareholder liquidity are undisclosed; Atreides' paper gain may not be fully realizable.
- **Precedent risk:** the deal structure (avoiding formal acquisition) faces ongoing antitrust/regulatory scrutiny of acquihires; any unwinding or litigation would cloud outcomes further.
- **Information vacuum:** as a private shell post-deal, Enfabrica has no obligation to disclose distributions; everything beyond Sep 2025 reporting is opaque.
- **Counterfactual competition:** even before the deal, Enfabrica faced Broadcom, Nvidia's own NIC roadmap, and the Ultra Ethernet Consortium commoditizing the layer it targeted.

## Sources

- https://www.businesswire.com/news/home/20230912219337/en/Enfabrica-Raises-%24125-Million-Series-B-to-Fuel-Ramp-of-AI-Infrastructure-Networking-Chips
- https://www.cnbc.com/2025/09/18/nvidia-spent-over-900-million-on-enfabrica-ceo-ai-startup-technology.html
- https://techstartups.com/2025/09/19/nvidia-spends-900m-to-hire-enfabrica-ceo-and-license-ai-startup-tech-for-hardware-push/
- https://www.techbuzz.ai/articles/nvidia-drops-900m-on-enfabrica-ceo-hire-in-mega-acquihire
- https://www.jonpeddie.com/news/rochan-sankar-joins-nvidia-networking-team/
- https://seekingalpha.com/news/4496441-nvidia-hires-enfabrica-ceo-and-licenses-ai-startups-tech-for-over-900m
