---
title: "Atreides Management — Full Portfolio Deep Dive"
date: 2026-06-10
---

## Overview

[Atreides Management, LP][^1] is Gavin Baker's Boston-based **crossover fund** — long/short public equity plus a substantial private/venture book run from one research team. Baker founded it in January 2019 after 18 years at Fidelity (he ran the Fidelity OTC Portfolio 2009–2017); the firm is named for the heroic house of *Dune* and has grown from ~$308 M at launch to **$8.94 B in regulatory AUM** (Form ADV, data as of 2025-12-31).[^2]

This deep dive reconstructs the **full portfolio — public and private** — from primary sources: the Q1 2026 13F-HR (filed 2026-05-18), six quarters of 13F XML diffs, ~57 Form D filings that map the private-vehicle architecture, the May 2026 Form ADV, and Baker's unusually verbose public commentary (Sohn, Invest Like the Best, Capital Allocators, All-In).

## Key Findings

- **Q1 2026 13F: $5.00 B across 54 line items.** The single largest line is an **$808 M-notional QQQ put** (16.2%) — a structural index hedge over a concentrated innovation long book, present in five of the last six quarters. Top equity longs: **Astera Labs ($369 M), Unity ($272 M), Ciena ($263 M), Micron ($257 M), NVIDIA ($218 M)**.
- **The book is AI plumbing, not megacap AI.** Connectivity and optics (Astera, Credo, Ciena, Lumentum, Coherent, Semtech) plus memory (Micron) dominate; Microsoft was exited twice, Meta and AMD fully exited in Q4 2025. Baker's frame: the binding constraints are "**watts and wafers**," so own the bottlenecks.
- **Options express timing.** Q4 2025 was peak leverage — $2.15 B QQQ put notional plus ~$1 B NVDA exposure via calls + common (timed to the Meta–NVIDIA Blackwell/Rubin deal) — almost all unwound by Q1 2026, which is why reported value fell $8.18 B → $5.00 B without a wholesale liquidation.
- **The private book is the same thesis, one layer earlier.** Confirmed: **Cerebras** (co-led Series G, $8.1 B → in again at $23 B), **Enfabrica** (led Series B; NVIDIA later paid >$900 M for its CEO/tech), **SiFive** (led $400 M Series G, Apr 2026), **Crusoe**, **Cognition (Devin)**, **Decart**, **Lyte**, **Loop**, plus **SpaceX** — the largest VC-sleeve position, reported ~$2.5 B. Astera Labs was held privately from Series C (2021, $950 M valuation) before becoming the largest public position.
- **Form D forensics map the machine:** flagship Foundation Fund ($3.9 B sold across feeders; master $6.22 B gross), **24 deal-by-deal "Special Circumstances" SPVs** (Series A–X, accelerating sharply into 2026), the **$759 M Valor Atreides AI** JV with Valor Equity Partners, **Private Opportunities Fund II** raising since April 2026, and brand-new **150/50** and **Low Net** strategies (January 2026).
- **Notably absent:** no confirmed direct positions in xAI, Anthropic, OpenAI, or Anduril despite Baker's constant commentary — though JV partner Valor is a major xAI backer, and the anonymous SPVs could hide exposure.
- **Performance is mostly opaque:** −11.5% H1 2022 (Bloomberg) and ~+47% in 2025 (secondary reporting around the SpaceX windfall) are the only firm-attributed figures; RAUM grew $5.5 B → $8.94 B during 2025.

## Q1 2026 Snapshot — Top 10 Lines

| # | Issuer | Ticker | Type | Value | % |
|---|--------|--------|------|------:|--:|
| 1 | Invesco QQQ Trust | QQQ | **Puts** | $808.1 M | 16.2% |
| 2 | Astera Labs | ALAB | Common | $368.9 M | 7.4% |
| 3 | Unity Software | U | Common | $271.7 M | 5.4% |
| 4 | Ciena | CIEN | Common | $262.8 M | 5.3% |
| 5 | Micron Technology | MU | Common | $256.9 M | 5.1% |
| 6 | NVIDIA | NVDA | Common | $217.8 M | 4.4% |
| 7 | Amazon.com | AMZN | Common | $198.6 M | 4.0% |
| 8 | Lumentum | LITE | Common | $187.9 M | 3.8% |
| 9 | Alphabet | GOOGL | Common | $159.6 M | 3.2% |
| 10 | Coherent | COHR | Common | $150.3 M | 3.0% |

Full table on the [Holdings page](research/2026/atreides/holdings).

## Caveats

- 13F filings show long US-listed positions and listed options only — shorts (beyond disclosed puts), swaps, non-US lines, cash, and the entire private book are invisible. Option lines are valued at underlying notional, not premium at risk.
- The private-investment list mixes confidence levels (marked on the [Private Book page](research/2026/atreides/private-book)); SPV underlying assets are never disclosed in Form Ds.
- Reported "performance" figures from 13F aggregators simulate the long book only and are not fund returns.
- Data is as of 2026-06-10; Q2 2026 13F lands ~August 2026.

## Contents

| Page | Description |
|------|-------------|
| [The Firm](research/2026/atreides/firm) | Baker's Fidelity exit, launch, James Star/Crown backing, $8.94 B ADV, team, strategy, performance record |
| [Full Holdings](research/2026/atreides/holdings) | All 54 Q1 2026 line items from the SEC XML, book structure, six-quarter trajectory |
| [Portfolio Evolution](research/2026/atreides/evolution) | Quarter-by-quarter diffs Q4 2024 → Q1 2026: every entry, exit, and the options overlay |
| [Thesis Themes](research/2026/atreides/themes) | Eight buckets mapping holdings to Baker's public framework — connectivity/optics, HBM, watts, game engines, AI-pressured SaaS, the hedge |
| [The Private Book](research/2026/atreides/private-book) | Vehicle architecture from 57 Form Ds, confirmed/probable/not-confirmed private investments |

## Footnotes

[^1]: [SEC EDGAR — Atreides Management, LP, CIK 0001777813](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001777813)
[^2]: [SEC IAPD — Form ADV, CRD 301152 (filed 2026-05-29)](https://adviserinfo.sec.gov/firm/summary/301152)

## References

- [Q1 2026 13F-HR holdings XML (accession 0001777813-26-000006)](https://www.sec.gov/Archives/edgar/data/1777813/000177781326000006/Atreides13FXml.xml)
- [13f.info — Atreides Management LP](https://13f.info/manager/0001777813-atreides-management-lp)
- [Capital Allocators EP.489 — "Truth-Seeking and Crossover Investing at Atreides" (Mar 2026)](https://www.capitalallocators.com/podcast/truth-seeking-and-crossover-investing-at-atreides/)
- [Invest Like the Best EP.473 — "Watts and Wafers" (May 2026)](https://podcasts.apple.com/us/podcast/gavin-baker-watts-and-wafers/id1154105909?i=1000768706800)
- [Hedge Fund Alpha — Sohn New York 2026 fireside](https://hedgefundalpha.com/conferences/inside-mind-a-tech-sohn-2026/)
- [Bloomberg — Atreides' opportunistic venture fund (Jul 2022)](https://www.bloomberg.com/news/articles/2022-07-21/gavin-baker-s-atreides-plans-to-raise-opportunistic-venture-fund)
