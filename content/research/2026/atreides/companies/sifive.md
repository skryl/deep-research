---
title: "SiFive (private)"
weight: 73
---

## Snapshot

- **Status:** Private; CEO Patrick Little has described the Series G as the company's **final private round before an IPO** (no S-1 filed as of June 2026).
- **Sector:** RISC-V processor IP — scalar, vector, and matrix CPU/accelerator cores licensed for AI datacenter silicon.
- **Latest known valuation:** **$3.65B** post-money, set by the $400M Series G announced **April 9, 2026**. (Earlier press chatter rounded this to "~$4B"; the company's own release says $3.65B.)
- **Atreides involvement:** **Confirmed.** Atreides **led** the oversubscribed $400M Series G; Gavin Baker is quoted in the press release.
- **Likely vehicle(s):** Timing fits the [Special Circumstances](research/2026/atreides/private-book) Series X SPV ($82.6M, Form D filed May 14, 2026) and/or the newly raising Atreides Private Opportunities Fund II (Form D Apr 27, 2026) — both **inferences, unconfirmed**.

## Business Overview

SiFive, founded in 2015 by RISC-V's inventors (Krste Asanović, Yunsup Lee, Andrew Waterman), is the flagship commercial steward of the open RISC-V instruction set — an Arm-style IP licensing business rather than a chipmaker. After years of broad embedded/consumer licensing (and reported, rebuffed Intel acquisition interest in 2021), the company has refocused on **high-performance RISC-V for the AI datacenter**: customizable scalar/vector/matrix CPU and system IP that hyperscalers can embed inside their own accelerators and host processors.

The Series G materials lean hard into that pivot: proceeds fund datacenter-class core R&D, a software ecosystem push (the release cites existing ports of CUDA, RedHat, and Ubuntu), and customer enablement including **NVIDIA NVLink Fusion integration** — i.e., RISC-V hosts inside Nvidia-centric racks. NVIDIA's own participation in the round (alongside Apollo, Point72 Turion, T. Rowe Price, Prosperity7, and Sutter Hill) is the strongest external validation: Nvidia has already ported CUDA infrastructure to RISC-V and benefits from a credible open alternative to Arm at the host-CPU layer. SiFive does not disclose revenue; its model is upfront license fees plus per-chip royalties, so financials remain **unknown**.

## Atreides' Involvement

- **Series G lead (confirmed):** April 9, 2026 — Atreides led the oversubscribed **$400M round at $3.65B post-money**. Baker's quote in the release frames the thesis explicitly: "For decades, proprietary ISAs have constrained how the world's most sophisticated chip designers build and differentiate their silicon."
- **Check size:** Atreides' individual allocation within the $400M is **not disclosed**.
- **Pre-IPO positioning:** with the CEO publicly flagging this as the last private round, the investment is a classic Atreides crossover entry — the same pre-IPO playbook as Astera Labs (Series C, 2021), CoreWeave, and Cerebras.

## Why Atreides Owns It

SiFive is a leveraged bet on the "wafers" half of Baker's watts-and-wafers framework, one layer below the chips themselves: if every hyperscaler and AI lab is building custom silicon, the scarce input is licensable, customizable CPU IP that isn't controlled by Arm (post-IPO, royalty-maximizing, Qualcomm-litigating) or x86 incumbents. An open ISA with a $100B+ stated TAM for next-gen AI silicon gives SiFive a toll-booth position on the custom-accelerator boom that Atreides already plays publicly via Broadcom/Marvell-style design-win exposure. The NVLink Fusion angle matters to the thesis: SiFive doesn't have to beat Nvidia, it has to become the open host-CPU standard *inside* Nvidia's ecosystem and the hyperscalers' in-house programs simultaneously. And as the presumptive last money in before an S-1, the round gives Atreides its preferred structure: late-stage entry, near-term IPO catalyst, and the option to compound the position in the public book — the crossover flywheel running exactly as designed.

## Risks

- **Arm's entrenchment:** the software ecosystem, toolchains, and engineer familiarity still overwhelmingly favor Arm in the datacenter; RISC-V datacenter deployments remain early and royalty streams take years to ramp.
- **IP business model:** licensing revenue is lumpy and royalty economics are thin unless design wins ship at hyperscale volume; SiFive restructured as recently as 2023 when the broad-market strategy stalled.
- **No disclosed financials:** the $3.65B valuation cannot be sanity-checked against revenue; the mark rests on the strategic narrative and the investor syndicate.
- **Geopolitics of openness:** RISC-V's openness invites export-control scrutiny (Chinese adoption of the ISA is a recurring congressional concern), which could constrain SiFive's market or complicate an IPO.
- **IPO-window dependence:** Atreides' exit math assumes the 2026 AI-IPO window (Cerebras, SpaceX) stays open; a risk-off turn strands the position at a rich private mark.

## Sources

- https://www.sifive.com/press/sifive-raises-400-million-to-accelerate-high-performance-risc-v-data-center-solutions
- https://www.businesswire.com/news/home/20260409986099/en/SiFive-Raises-$400-Million-to-Accelerate-High-Performance-RISC-V-Data-Center-Solutions-Company-Valuation-Now-Stands-at-$3.65-Billion
- https://www.datacenterdynamics.com/en/news/risc-v-chip-designer-sifive-raises-400m-in-funding-round-that-saw-participation-from-nvidia/
- https://thenextweb.com/news/sifive-400m-series-g-risc-v-ipo
- https://www.finsmes.com/2026/04/sifive-raises-400m-in-series-g-funding.html
- https://theaiinsider.tech/2026/04/10/sifive-secures-400m-series-g-to-advance-risc-v-architecture-for-ai-infrastructure/
