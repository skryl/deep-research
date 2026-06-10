---
title: "Cerebras Systems (CBRS)"
weight: 71
---

## Snapshot

- **Status:** Public since **May 14, 2026** (Nasdaq: **CBRS**) — but Atreides' stake originated entirely in private rounds, so there is no 13F position history yet; first possible 13F appearance is the Q2 2026 filing (due Aug 2026).
- **Sector:** Wafer-scale AI accelerators and AI inference cloud.
- **IPO:** Priced May 13, 2026 at **$185/share** (above the $115–125 marketed range), selling 30M Class A shares for **$5.55B** — the largest IPO of 2026 until SpaceX. Opened at $350, closed day one at $311 (+68%), ~**$95B** market cap.
- **Atreides involvement:** **Confirmed.** Co-led the $1.1B Series G (Sep 2025, $8.1B post-money) with Fidelity; participated again in the $1B Series H (Feb 2026, ~$23B post-money).
- **Likely vehicle(s):** Foundation Fund VC sleeve and/or [Special Circumstances SPVs](research/2026/atreides/private-book) — the $122M Series W SPV (Feb 2026) is a plausible but **unconfirmed** match for the Series H check.

## Business Overview

Cerebras builds the Wafer-Scale Engine — a single chip the size of an entire silicon wafer — as an alternative to clustering thousands of GPUs. The architectural bet is that keeping model weights on one enormous die eliminates the interconnect bottleneck that dominates GPU inference, and third-party benchmarks have repeatedly shown Cerebras serving frontier open models at the fastest token rates in the industry. The company has pivoted its business mix from selling systems toward selling inference capacity as a service.

Per the S-1: **2025 revenue of $510M, up 76% YoY**, with GAAP net income of $237.8M — but that profit is entirely attributable to a one-time, non-cash $363.3M gain from extinguishing a G42-related forward contract; adjusted, the company ran a non-GAAP net loss of ~$75.7M. Customer concentration is the defining feature of the P&L: **two UAE-linked entities, MBZUAI (62%) and G42 (24%), were 86% of 2025 revenue.**

The forward story is OpenAI: a binding commercial agreement (reported at **$10B+**, with some S-1 analyses putting the Master Relationship Agreement at $20B+ as capacity scales — figures vary by source) for **750MW of low-latency inference capacity by 2028, expandable toward 2GW by 2030**. OpenAI also extended Cerebras a $1B working-capital loan (Jan 2026, 6%, secured by warrants on ~33.4M shares at near-zero strike).

## Atreides' Involvement

- **Series G (confirmed, co-lead):** Sep 30, 2025 — oversubscribed **$1.1B round at $8.1B post-money, led by Fidelity Management & Research and Atreides Management**, with Tiger Global, Valor Equity Partners, 1789 Capital, Altimeter, Alpha Wave, and Benchmark participating. The Fidelity/Atreides co-lead pairing is notable given Baker's Fidelity lineage.
- **Series H (confirmed, participant):** Feb 3, 2026 — **$1B at ~$23B post-money**, led by Tiger Global; Atreides participated alongside Benchmark, Fidelity, Alpha Wave, Altimeter, AMD, Coatue, and 1789 Capital.
- **Marks:** Series G money saw roughly a ~11–12x valuation uplift to the day-one close (~$95B); even the Series H entry roughly quadrupled in three months. Position size and any IPO-related sales are **not disclosed**.
- **Vehicle (inference):** the timing of Special Circumstances Series V ($55.5M, Jan 2026) and Series W ($122M, Feb 2026 — the largest SPV Atreides has ever raised) fits the Series H window, but the mapping is our inference, **unconfirmed**.

## Why Atreides Owns It

Cerebras is the private-side mirror of the public book's "wafers" leg: a direct architectural challenge to GPU homogeneity at exactly the layer — inference throughput — where Baker has argued the economics of AI will be decided. His public framing (Invest Like the Best "Watts and Wafers," May 2026; Sohn appearances) treats inference speed and cost-per-token as the new competitive currency; Cerebras is the most extreme expression of buying the bottleneck-breaker rather than the incumbent. The OpenAI capacity deal converts the architecture bet into a contracted revenue stream, which is what makes it underwriteable for a crossover fund.

It is also a textbook case of the **crossover IPO flywheel** Atreides ran with Astera Labs, CoreWeave, and Chime: enter late-stage private rounds at valuations set before the public market re-rates the category, then hold (or add) through the IPO. The IPO saga itself created the opportunity — Cerebras first filed in **September 2024**, stalled for over a year under a CFIUS review of G42's stake, withdrew the stale S-1, and refiled **April 17, 2026** once the review resolved. Atreides' Series G check landed precisely in that limbo window, when the cap-table overhang depressed the price of a company whose inference business was inflecting.

## Risks

- **Customer concentration:** 86% of 2025 revenue from MBZUAI/G42; the UAE dependence that triggered CFIUS scrutiny is reduced but not resolved, and the OpenAI ramp is still mostly in the future.
- **OpenAI counterparty risk:** the marquee contract, the $1B loan, and the warrant package tie Cerebras' fortunes — and dilution — to a single customer's capex appetite.
- **Nvidia and custom silicon:** GPU roadmaps (and hyperscaler in-house chips) compress the inference-speed advantage; wafer-scale manufacturing economics remain unproven at high volume.
- **Valuation:** ~$95B day-one cap on $510M trailing revenue (~186x) with adjusted losses; the post-IPO float is thin and the stock has already shown high volatility.
- **Lock-up flowback:** large late-stage holders (including Atreides) become free to sell into a crowded AI-IPO calendar.

## Sources

- https://www.cerebras.ai/press-release/series-g
- https://www.cerebras.ai/press-release/cerebras-systems-raises-usd1-billion-series-h
- https://techcrunch.com/2025/09/30/a-year-after-filing-to-ipo-still-private-cerebras-systems-raises-1-1b/
- https://www.cnbc.com/2026/05/14/cerebras-cbrs-stock-trade-nasdaq-ipo.html
- https://www.cnbc.com/2026/05/13/cerebras-prices-ipo-above-expected-range-wall-street-expects-ai-flood.html
- https://www.cerebras.ai/press-release/cerebras-systems-announces-pricing-of-initial-public-offering
- https://winbuzzer.com/2026/05/04/cerebras-refiles-ipo-40-billion-valuation-xcxwbn/
- https://semiconalpha.substack.com/p/cerebras-the-ipo-returns-but-the
- https://www.techtimes.com/articles/316698/20260515/cerebras-raises-555-billion-ai-chip-ipo-86-revenue-dependence-uae-entities-unresolved.htm
- https://futurumgroup.com/insights/cerebras-s-1-teardown-is-the-23b-wafer-scale-ipo-the-end-of-gpu-homogeneity/
