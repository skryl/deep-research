---
title: "CoreWeave (CRWV)"
weight: 20
---

## Snapshot

- **Ticker:** CRWV (Nasdaq, IPO March 2025)
- **Bucket:** [AI Cloud / GPU-as-a-Service](research/2026/situational-awareness-fund/categories/ai-cloud)
- **Q4 2025 fund position:** $1,211.2 M total — $436.7 M common (6.10 M sh) + $774.4 M call notional (10.81 M sh) — **21.96 % of 13F**
- **Position rank:** combined #1 issuer in fund

## Business

CoreWeave runs a US-based GPU cloud built specifically for AI training and inference. Originally founded in 2017 as Atlantic Crypto, an Ethereum-mining shop, the company pivoted to GPU rental in 2019 and was the first non-hyperscaler cloud to deploy NVIDIA H100s at scale in 2022. As of 2025 it operates ~32 data-center sites with combined contracted capacity in the multi-GW range, a fleet that includes H100, H200, B200, GB200 NVL72, and (as deliveries arrive) GB300 systems.

Revenue is heavily concentrated. Microsoft is reported to have been 50–60% of revenue at IPO (largely re-renting capacity to OpenAI), with a second large unnamed customer (widely understood to be OpenAI direct) emerging in 2025 via the multi-year reserved-capacity deals signed alongside the broader Stargate program. Smaller customers include Cohere, Mistral, Meta (limited), and a long tail of foundation-model and inference-API startups.

The business model is contracted capacity: customers commit to multi-year reserved GPU-hour blocks against which CoreWeave issues debt to finance the upfront GPU purchase. This pattern (delayed-payment hardware financing against a creditworthy contract) is the source of the company's distinctive — and controversial — 80%+ debt/EV capital structure.

## Financial Trajectory

| Period | Revenue | Notes |
|--------|--------:|-------|
| 2023 FY | $228.9 M | Pre-AI-boom miner-pivot baseline |
| 2024 FY | $1,915 M | First full year of H100 capacity at scale |
| 2025 H1 | ~$2.7 B | Stub period at IPO |
| 2025 FY | reported >$5 B | Per company guidance and press |

Gross margins are in the high-70s on operating; net income remains negative due to depreciation on the GPU fleet (5-year useful life assumed) and large interest expense on the asset-backed financing.

## Why It Fits the Thesis

CoreWeave is the cleanest publicly-traded expression of *AI compute revenue per unit of NVIDIA shipment*. Whereas Microsoft Azure / AWS / GCP report AI revenue diluted by much-larger non-AI cloud businesses, CoreWeave's revenue line is approximately a function of (NVIDIA accelerators in operation) × (hourly rate) × (utilization). The fund treats it as the most direct way to ride the NVIDIA shipment ramp without owning NVDA — a thesis that the value capture moves from the chip designer to the operator of the chip when supply tightens.

## Position History in the Fund

| Quarter | Position | Notes |
|---------|----------|-------|
| Q1 2025 | New, common only | Added in IPO quarter at small size |
| Q2 2025 | Common held flat | — |
| Q3 2025 | Common + **puts** | Hedged a sharp post-IPO rally |
| Q4 2025 | Common increased + **calls** ($774 M notional) | Puts closed, call position added — bullish reversal |

The Q3→Q4 swap from puts to large calls is one of the most decisive position changes in fund history.

## Risks

- **Customer concentration.** Microsoft + OpenAI are the bulk of revenue; loss or repricing of either is existential.
- **Debt load.** GPU-backed debt requires the underlying contracts to perform; if utilization drops, the financing structure stresses quickly.
- **GPU obsolescence.** 5-year depreciation may prove optimistic if newer NVIDIA generations compress unit economics on the H100/H200 base.
- **Hyperscaler competition.** Microsoft has incentive to migrate OpenAI workloads to its own infrastructure as it builds out.
