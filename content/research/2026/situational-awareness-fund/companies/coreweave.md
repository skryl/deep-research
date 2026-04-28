---
title: "CoreWeave (CRWV)"
weight: 20
---

## Snapshot

- **Ticker:** CRWV (Nasdaq, IPO March 28, 2025 at $40)
- **Bucket:** [AI Cloud / GPU-as-a-Service](research/2026/situational-awareness-fund/categories/ai-cloud)
- **Q4 2025 fund position:** **$1,211.2 M total** — $436.7 M common (6.10 M sh) + $774.4 M call notional (10.81 M sh) — **21.96 % of 13F**
- **Position rank:** combined #1 issuer in fund
- **HQ:** Roseland, NJ

## Business Overview

CoreWeave runs a US-based GPU cloud built specifically for AI training and inference. Originally founded in 2017 as Atlantic Crypto, an Ethereum-mining shop, the company pivoted to GPU rental in 2019 and was the first non-hyperscaler cloud to deploy NVIDIA H100s at scale in 2022. As of late 2025 it operates **~32 data-center sites**, ~360–470 MW contracted power scaling to >1 GW pipeline, and a fleet that includes H100, H200, B200, GB200 NVL72, and (as deliveries arrive) GB300 systems.

The business model is **contracted capacity**: customers commit to multi-year reserved GPU-hour blocks against which CoreWeave issues delayed-draw term loan ("DDTL") debt collateralized by the underlying GPUs. This pattern — large, creditworthy customer contracts financing the GPU purchase — is the source of the company's distinctive 80%+ debt/EV capital structure.

## Financial Trajectory

| Metric (USD M) | FY2022 | FY2023 | FY2024 | FY2025 (guide) |
|----------------|-------:|-------:|-------:|--------------:|
| **Revenue** | 15.8 | 228.9 | **1,915** | **5,150–5,350** |
| YoY growth | — | +1,346 % | +737 % | +169 % (mid) |
| Gross margin (revenue level) | — | — | ~74 % | ~74 % |
| Adjusted EBITDA | — | — | ~1,200 (62 % margin) | — |
| **Net income (loss)** | — | — | **−863** | (loss) |

The FY24 net loss of ~$863 M is driven by:
- ~$830 M in depreciation on the GPU fleet (assumed 5-year useful life)
- ~$580 M in interest expense on the asset-backed financing
- Stock-based compensation related to pre-IPO grants

EBITDA is meaningfully positive (~62 % margin) — the loss is entirely below-the-line.

### Quarterly Trajectory (FY25)

| Quarter | Revenue (~$M) |
|---------|--------------:|
| Q1 2025 | ~981 |
| Q2 2025 | ~1,210 |
| Q3 2025 | ~1,360 |

Sequential growth has been ~20–30 % each quarter as new GPU clusters come online and the OpenAI deal contributes incrementally.

## Customer Concentration

| Customer | % of FY24 revenue | Notes |
|----------|------------------:|-------|
| **Microsoft** | ~62 % | Largely re-renting capacity to OpenAI |
| **Top 2 customers combined** | ~77 % | Microsoft + a second hyperscaler-adjacent customer |
| **OpenAI direct** | growing in 2025 | $11.9 B deal Sept 2024, expanded by ~$4 B in 2025 |
| Smaller customers | balance | Cohere, Mistral, Meta (limited), AI startups |

The OpenAI direct relationship is structurally important — it diversifies revenue beyond the Microsoft channel and creates a long-term anchor that can absorb GB200/GB300 capacity as it deploys.

## Balance Sheet (~Q3 2025)

| Item | $M |
|------|---:|
| Cash + investments | ~3,000–4,000 |
| **Total debt (DDTL + bonds)** | **~11,000–13,000** |
| Net debt / TTM Adj. EBITDA | ~5–7× |

The capital structure is unusual: GPUs are pledged as collateral against term loans drawn down as deployments scale. The structure works as long as customer contracts perform; if utilization drops or customer credit deteriorates, the financing model stresses quickly.

## Capex & Backlog

- **FY24 capex:** ~$8.7 B
- **FY25 capex guide:** $20 B+
- **FCF (FY24):** approximately −$6 B to −$7 B (capex consumed everything)
- **Contracted backlog (RPO) post-IPO:** ~$15 B; growing to **$30 B+** range with OpenAI expansion

The contracted backlog is the key "distance from danger" metric — multi-year contracted revenue underwrites the term-loan stack.

## Stock Performance

- IPO March 28, 2025 at $40 (downsized from the initial $47–55 range)
- Highly volatile post-IPO; traded in the $35–185 range through 2025
- The fund initially held common only (Q1 2025), held puts in Q3 2025, then closed the puts and added a $774 M call notional position in Q4 2025

## Why It Fits the Thesis

CoreWeave is the **purest publicly-traded expression of "AI compute revenue per unit of NVIDIA shipment"**. Whereas Microsoft Azure / AWS / GCP report AI revenue diluted by much-larger non-AI cloud businesses, CoreWeave's revenue line is approximately a function of:

(NVIDIA accelerators in operation) × (hourly rate) × (utilization)

The fund treats it as the most direct way to ride the NVIDIA shipment ramp without owning NVDA — a thesis that the value capture moves from the chip designer to the operator of the chip when supply tightens. Holding *both* the common (long delta) and a much larger call-option position (convex, levered upside) is consistent with high conviction in the upside scenario.

## Position History in the Fund

| Quarter | Position |
|---------|----------|
| Q1 2025 | New common, small size (post-IPO) |
| Q2 2025 | Common held flat |
| Q3 2025 | Common + **puts** (hedge against post-IPO rally) |
| Q4 2025 | Puts closed; **calls added at $774 M notional**; common increased to 6.1 M sh |

The Q3→Q4 swap from puts to large calls is one of the most decisive position changes in fund history.

## Risks

- **Customer concentration.** Microsoft + OpenAI account for the bulk of revenue; loss or repricing of either is existential.
- **GPU obsolescence.** 5-year depreciation may prove optimistic if newer NVIDIA generations compress unit economics on the H100/H200 base.
- **Debt load.** Asset-backed term loans require the underlying contracts to perform; if utilization drops, the structure stresses fast.
- **Hyperscaler competition.** Microsoft has incentive to migrate OpenAI workloads to its own infrastructure as it builds out.
- **NVIDIA allocation risk.** CoreWeave's competitive moat is partly NVIDIA's preferred-access designation; that could erode if NVIDIA expands allocation to peers.

## Sources

- CoreWeave **S-1** (filed March 2025)
- CoreWeave Q1 / Q2 / Q3 2025 **10-Q** filings
- OpenAI deal press releases (September 2024; 2025 expansion)
- CoreWeave investor relations
