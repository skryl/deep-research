---
title: "The QQQ Hedge (QQQ puts)"
weight: 62
---

## Snapshot

- **Instrument:** Put options on the Invesco QQQ Trust (Nasdaq-100 ETF) — not a company position
- **Bucket:** [The Hedge](research/2026/atreides/themes)
- **Q1 2026:** Puts on 1,400,000 underlying QQQ shares, $808.1 M notional, 16.15% of the 13F — the single largest line in the filing
- **Pattern:** Present in five of the last six quarters; peaked at $2.15 B notional (26.27% of the book) in Q4 2025
- **Related hedges:** A one-quarter SMH put ($211 M notional, Q1 2025) and single-name Micron puts ($200 M notional, Q4 2025)

## How the Hedge Works

Atreides runs a concentrated book of idiosyncratic innovation longs — AI connectivity, optics, memory, game engines — and pairs it with a short on the index those names trade inside of. The construction is **high gross, controlled net**: the fund can stay maximally exposed to the specific bets (Astera Labs, Ciena, Micron, Unity) without carrying maximal exposure to the Nasdaq itself. When the longs outperform the index, the structure captures the spread; when the whole tape de-rates, the puts absorb part of the beta drawdown.

The QQQ put is the standing expression of this, but Atreides flexes the same idea through other instruments. In Q1 2025 — the one stretch when the QQQ put was absent — the fund instead held a put on the **VanEck Semiconductor ETF (SMH)**: $211.5 M notional on 1,000,000 underlying shares, 6.42% of that quarter's 13F, gone the following quarter. A sector hedge replaced the index hedge in a quarter when the book's semis weighting was the concern. In Q4 2025, at peak defensiveness, Atreides also held **single-name Micron puts** — $199.8 M notional on 700,000 shares — stacked directly on top of a $210.9 M Micron common position, a collar-like overlay on one of its highest-conviction longs. The Micron puts were closed in Q1 2026; the stock was kept and grown.

In January 2026 Atreides productized the construction: Form D filings dated January 16, 2026 show the launch of the **Atreides 150/50 Technology Fund** (initial closes of $10.0 M for the LP and $40.0 M for the offshore Ltd vehicle) and an **Atreides Low Net Fund** — vehicles whose names describe exactly what the 13F has been showing: levered long innovation, short index, low net.

## History

| Quarter | Type | Shares/Notional | Value | % of 13F |
|---|---|---:|---:|---:|
| Q4 2024 | Put | 2,700,000 | $1,380,321,000 | 30.22% |
| Q1 2025 | — | not held | — | — |
| Q2 2025 | — | not held | — | — |
| Q3 2025 | Put | 2,000,000 | $1,200,740,000 | 23.38% |
| Q4 2025 | Put | 3,500,000 | $2,150,085,000 | 26.27% |
| Q1 2026 | Put | 1,400,000 | $808,052,000 | 16.15% |

The Q1–Q2 2025 gap is not unhedged: Q1 2025 carried the SMH put instead, and Q1 2025 was also the quarter of large NVDA call exposure — the most risk-on configuration in the window. The hedge returned at scale in Q3 2025, was pressed to its maximum in Q4 2025 (3.5 M underlying shares, $2.15 B, 26% of the book — the same quarter as the Micron put overlay and full exits of Meta and AMD), then was cut by 62% in notional terms in Q1 2026.

## What It Says About Net Exposure

Read as a single dial, the QQQ line is the closest thing in the filings to a statement of Gavin Baker's market view:

- **Q4 2024 (30% of 13F):** maximum caution into 2025.
- **Q1–Q2 2025:** hedge off (semis-specific SMH put only), NVDA calls on — risk-on.
- **Q3–Q4 2025 (23% → 26%):** defensiveness rebuilt and pressed during the loudest stretch of the AI-bubble debate, while the long book stayed fully invested — the barbell at its widest (Q4 2025 simultaneously held $653 M of NVDA call notional and $2.15 B of QQQ put notional).
- **Q1 2026 (16%):** a 62% cut in hedge notional — re-risking, not capitulation; the put remains the largest line.

The pattern argues the hedge is **structural with a tactical dial**, not an episodic market call: it exists in some size almost always, and what changes is how hard it is pressed. The January 2026 launch of the 150/50 and Low Net funds confirms the firm regards "concentrated tech longs + index short" as its core architecture, now offered to LPs as standalone products.

## Caveats

- **13F put lines show the notional market value of the underlying shares, not premium.** The actual capital at risk in the options is far smaller than $808 M; a 16.15% "position" might represent low-single-digit percent of NAV in premium.
- **Strikes and expiries are not disclosed.** There is no way to know how far out-of-the-money the puts are, their duration, or whether they are outright puts or put spreads (spreads would overstate effective protection).
- **13Fs omit short stock, swaps, and non-US positions.** The QQQ put is the visible hedge; the true net exposure of the fund cannot be computed from the filing.
- **Quarter-end snapshots only.** Puts rolled or monetized intra-quarter are invisible; the Q1–Q2 2025 "gap" could overstate how unhedged the book actually was.
- **Denominator distortion:** because the put is reported at underlying notional, it inflates total 13F "value," making every equity position look smaller as a percentage than it is relative to the real long book (~$4.19 B ex-put in Q1 2026).

## Sources

- [Atreides 13F-HR Q1 2026 holdings XML (SEC)](https://www.sec.gov/Archives/edgar/data/1777813/000177781326000006/Atreides13FXml.xml)
- [Atreides 13F filing history on SEC EDGAR (CIK 1777813)](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001777813&type=13F-HR&dateb=&owner=include&count=40)
- [Atreides 150/50 Technology Fund, LP — Form D (formds.com)](https://formds.com/issuers/atreides-150-50-technology-fund-lp)
- [Atreides 150/50 Technology Fund, Ltd. — Form D (formds.com)](https://formds.com/issuers/atreides-150-50-technology-fund-ltd)
- [13f.info — Atreides Management LP filings](https://13f.info/manager/0001777813-atreides-management-lp)
