---
title: "Situational Awareness LP — Portfolio Reconstruction"
date: 2026-04-28
---

## Overview

[Situational Awareness LP][^1] is the AI-focused hedge fund founded in mid-2024 by Leopold Aschenbrenner, the former OpenAI Superalignment researcher whose June 2024 essay [*"Situational Awareness: The Decade Ahead"*][^2] laid out a thesis that the path to AGI/superintelligence is bottlenecked not by ideas but by **compute, power, and US fab capacity**. The fund is a long/short equity vehicle that expresses that thesis primarily through public equities and listed options on the picks-and-shovels of the AI buildout.

This deep dive reconstructs the fund's holdings from its SEC 13F-HR filings (the [Q4 2025 filing][^3] dated 2026-02-11 is the most recent at the time of writing) and groups them by investment-thesis category. There is a page per category and a page per company.

## Key Findings

- **Fund entity:** Situational Awareness LP, CIK [0002045724][^4], based in San Francisco. Co-managed with Carl Shulman.
- **Most recent 13F:** period of report 2025-12-31, filed 2026-02-11, **$5.52 B reportable value** across 29 line items (28 unique issuers).
- **Reported AUM** is ~$1.5 B per press (Fortune, Oct 2025); the gap to $5.5 B 13F gross long+option-notional is the **leverage signal**.
- **Five thematic buckets** dominate: AI cloud (CoreWeave), data-center operators (the BTC-miner-pivot complex), power & energy infra (Bloom, EQT, Solaris…), US chips (Intel, Tower), and optics/networking (Lumentum, Coherent).
- **No model-lab equities and no NVIDIA long.** The fund expresses NVIDIA exposure indirectly via CoreWeave and the data-center hosts; in Q3 2025 it actually held puts on NVDA, AVGO, MU, TSM and the SMH ETF, most of which were closed by Q4.
- **One disclosed short in Q4 2025:** puts on Infosys ADR (INFY) — an "AI displaces IT services" thesis.
- **Portfolio velocity is high.** The book grew from 6 line items / $255 M (Q4 2024) to 29 line items / $5.5 B (Q4 2025) in five quarters, with ~50% of names rotating each quarter.

## Q4 2025 Snapshot — Top 10 Holdings

| # | Issuer | Ticker | Type | Value (USD) | % | Bucket |
|---|--------|--------|------|------------:|--:|--------|
| 1 | Bloom Energy | BE | Common | $875.5 M | 15.9 % | Power |
| 2 | CoreWeave | CRWV | Calls | $774.4 M | 14.0 % | AI cloud |
| 3 | Intel | INTC | Calls | $746.8 M | 13.5 % | Chips |
| 4 | Lumentum | LITE | Common | $478.6 M | 8.7 % | Optics |
| 5 | CoreWeave | CRWV | Common | $436.7 M | 7.9 % | AI cloud |
| 6 | Core Scientific | CORZ | Common | $418.7 M | 7.6 % | Data centers |
| 7 | IREN | IREN | Common | $328.6 M | 6.0 % | Data centers |
| 8 | Applied Digital | APLD | Common | $278.0 M | 5.0 % | Data centers |
| 9 | Sandisk | SNDK | Common | $250.2 M | 4.5 % | Storage |
| 10 | Cipher Mining | CIFR | Common | $154.5 M | 2.8 % | Data centers |

Top 10 = ~86 % of the disclosed book. The full table lives on the [Holdings page](research/2026/situational-awareness-fund/holdings).

## Thesis Buckets (links)

| Bucket | % of 13F | Page |
|--------|---------:|------|
| AI Cloud / GPU-as-a-Service | 22.0 % | [AI Cloud](research/2026/situational-awareness-fund/categories/ai-cloud) |
| Data-Center Operators (HPC pivots) | 25.3 % | [Data Centers](research/2026/situational-awareness-fund/categories/data-centers) |
| Power & Energy Infrastructure | 21.9 % | [Power & Energy](research/2026/situational-awareness-fund/categories/power-energy) |
| Semiconductors / Chips | 15.1 % | [Chips](research/2026/situational-awareness-fund/categories/chips) |
| Optics / Networking | 10.3 % | [Optics & Networking](research/2026/situational-awareness-fund/categories/optics-networking) |
| Storage / Memory | 4.5 % | [Storage & Memory](research/2026/situational-awareness-fund/categories/storage-memory) |
| Real Estate (paired) | 0.9 % | [Real Estate](research/2026/situational-awareness-fund/categories/real-estate) |
| Shorts (Puts) | 0.2 % | [Shorts](research/2026/situational-awareness-fund/categories/shorts) |

## Caveats

- 13F-HR filings only show **long US equity positions and listed options**. Shorts (other than puts), non-US listings, private holdings, and cash are excluded.
- Press references private exposure to model labs (e.g., reportedly Anthropic). Not visible in 13F; confidence is low on specifics.
- Option lines are reported at the **value of the underlying shares**, not premium paid. Real cash-at-risk on the CRWV ($774 M) and INTC ($747 M) call lines is much smaller.
- Ticker mapping is inferred from CUSIPs and issuer names — CUSIPs in the SEC XML are the authoritative key.

## Footnotes

[^1]: [SEC EDGAR — Situational Awareness LP filings](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0002045724)
[^2]: ["Situational Awareness: The Decade Ahead" — Leopold Aschenbrenner (June 2024)](https://situational-awareness.ai/)
[^3]: [13F-HR Q4 2025 — primary doc XML](https://www.sec.gov/Archives/edgar/data/2045724/000204572426000002/primary_doc.xml)
[^4]: [SEC EDGAR CIK 0002045724](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0002045724)

## References

- [Fortune — "Inside Leopold Aschenbrenner's $1.5 B AI hedge fund" (Oct 2025)](https://fortune.com/2025/10/08/leopold-aschenbrenner-openai-ftx-1-5-billion-hedge-fund-situational-awareness/)
- [Fortune — coverage of Q4 2025 13F (Mar 2026)](https://fortune.com/2026/03/05/leopold-aschenbrenner-ai-hedge-fund-superintelligence-agi-power-companies-crypto-miners/)
- [WhaleWisdom — Situational Awareness LP](https://whalewisdom.com/filer/situational-awareness-lp)
- [HedgeFollow — Situational Awareness LP](https://hedgefollow.com/funds/Situational+Awareness)
- [Q4 2025 13F holdings XML](https://www.sec.gov/Archives/edgar/data/2045724/000204572426000002/SALP_13FQ425.xml)

## Contents

| File | Description |
|------|-------------|
| [Fund Thesis](research/2026/situational-awareness-fund/thesis) | Aschenbrenner's "Situational Awareness" essay translated into an investment framework |
| [Full Holdings](research/2026/situational-awareness-fund/holdings) | All 29 line items in Q4 2025 plus 5-quarter trajectory |
| [AI Cloud](research/2026/situational-awareness-fund/categories/ai-cloud) | CoreWeave (CRWV common + calls) |
| [Data Centers](research/2026/situational-awareness-fund/categories/data-centers) | CORZ, IREN, APLD, CIFR, RIOT, HUT, BTDR, BITF, CLSK, WYFI |
| [Power & Energy](research/2026/situational-awareness-fund/categories/power-energy) | BE, EQT, SEI, PSIX, BW, LBRT, PUMP |
| [Chips](research/2026/situational-awareness-fund/categories/chips) | INTC, TSEM |
| [Optics & Networking](research/2026/situational-awareness-fund/categories/optics-networking) | LITE, COHR |
| [Storage & Memory](research/2026/situational-awareness-fund/categories/storage-memory) | SNDK |
| [Real Estate](research/2026/situational-awareness-fund/categories/real-estate) | KRC |
| [Shorts](research/2026/situational-awareness-fund/categories/shorts) | INFY puts |
