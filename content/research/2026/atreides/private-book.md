---
title: "The Private Book"
weight: 5
---

Atreides is a **crossover fund** — Baker's stated thesis is that at every layer of the AI stack the key competitors are simultaneously public and private, so you cannot underwrite one side without the other.[^1] The private book is invisible in 13Fs; this page reconstructs it from SEC Form D filings (primary source), company press releases, and credible reporting. Confidence levels are marked.

## Vehicle Architecture (from SEC Form D — primary source)

EDGAR shows ~57 Atreides-related entities, all Boston. The structure:

| Vehicle | First Form D | Latest data | Role |
|---------|--------------|-------------|------|
| **Atreides Foundation Fund, LP / Ltd.** ([CIK 1777465](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001777465) / [1777228](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001777228)) | May 2019 | D/A 2026-05-29: **$1.89 B sold / 692 investors** (LP) + **$2.03 B / 260** (offshore Ltd) | Flagship crossover hedge fund (master-feeder). Privates like SpaceX sit in its "VC sleeve" |
| **Special Circumstances Fund, LLC, Series A–X** (+ mirror Cayman SPC series) | Nov 2019 | Series X filed **2026-05-14** | **24 deal-by-deal private co-invest SPVs**, ~$0.8 B total sold onshore. Underlying companies never disclosed |
| **Atreides Arrakis Fund, LP** ([CIK 1950644](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001950644)) | Oct 2022 | $64.5 M / 56 investors at filing | "Opportunistic venture fund" — structured equity, take-privates[^2] |
| **Valor Atreides AI I L.P.** (+ I-A/I-B feeders, [CIK 2033590](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0002033590)) | Jan 2025 | D/A 2026-02-05: **$758.7 M sold / 664 investors** | Dedicated AI venture JV with **Valor Equity Partners**; PitchBook pegs it at ~$780 M |
| **Flint Hills Valor Atreides AI L.P.** ([CIK 2076559](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0002076559)) | Jul 2025 | $21.7 M of $30 M sold | Parallel/feeder vehicle to the Valor JV |
| **Atreides Private Opportunities Fund II, LP / Offshore II** ([CIK 2121510](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0002121510) / 2121509) | **Apr 27, 2026** | $0 sold at filing — currently raising | New dedicated PE-style fund. Form ADV reveals the lineage: the 2022 Arrakis raise lives on as "Atreides Private Opportunities Master Fund I, LP" ($246 M gross, 12/31/2025) |
| Atreides 150/50 Technology Fund + Low Net Fund | Jan 2026 | $10 M / $5 M initial | New *public-markets* hedge strategies, listed for completeness |

The Special Circumstances SPV cadence is a deal-flow seismograph: Series Q ($11.7 M, Jan 2025), R ($19.1 M, Mar 2025), S ($64.2 M, Sep 2025), T ($11.3 M, Sep 2025), U ($55.5 M, Nov 2025), V ($55.5 M, Jan 2026), W (**$122.0 M**, Feb 2026 — the largest ever), X ($82.6 M, May 2026). Private dealmaking accelerated sharply through late 2025 into 2026.

## Confirmed Private Investments

| Company | What | Round / Date | Source |
|---------|------|--------------|--------|
| **[Cerebras Systems](research/2026/atreides/companies/cerebras)** | Wafer-scale AI chips — **IPO'd May 14, 2026 (Nasdaq: CBRS)** | **Co-led** $1.1 B Series G @ $8.1 B (Sep 2025); participated $1 B Series H @ ~$23 B (Feb 2026) | [Cerebras PR](https://www.cerebras.ai/press-release/series-g), [TechCrunch](https://techcrunch.com/2025/09/30/a-year-after-filing-to-ipo-still-private-cerebras-systems-raises-1-1b/), [Series H PR](https://www.cerebras.ai/press-release/cerebras-systems-raises-usd1-billion-series-h) |
| **[Enfabrica](research/2026/atreides/companies/enfabrica)** | AI networking silicon | **Led** $125 M Series B (Sep 2023), Baker board seat; NVIDIA later paid >$900 M for CEO + tech license | [Business Wire](https://www.businesswire.com/news/home/20230912219337/en/Enfabrica-Raises-%24125-Million-Series-B-to-Fuel-Ramp-of-AI-Infrastructure-Networking-Chips), [CNBC](https://www.cnbc.com/2025/09/18/nvidia-spent-over-900-million-on-enfabrica-ceo-ai-startup-technology.html) |
| **[SiFive](research/2026/atreides/companies/sifive)** | RISC-V datacenter IP | **Led** $400 M Series G @ $3.65 B (**Apr 2026**) | [SiFive PR](https://www.sifive.com/press/sifive-raises-400-million-to-accelerate-high-performance-risc-v-data-center-solutions) |
| **[Crusoe Energy](research/2026/atreides/companies/crusoe)** | AI datacenters / power | $1.375 B Series E @ >$10 B (Oct 2025), co-led by Valor + Mubadala | [Crusoe newsroom](https://www.crusoe.ai/resources/newsroom/crusoe-announces-series-e-funding) |
| **[Cognition AI](research/2026/atreides/companies/cognition)** | Devin coding agent | >$1 B Series D @ $26 B (**May 2026**), new investor | [Cognition blog](https://cognition.ai/blog/series-d) |
| **[Decart](research/2026/atreides/companies/decart)** | Generative world models | $300 M Series C @ ~$4 B (May 2026) | [CTech](https://www.calcalistech.com/ctechnews/article/sjt9ncukgl) |
| **Lyte** | Robot perception ("physical AI") | $107 M stealth-exit round (Jan 2026) | [Business Wire](https://www.businesswire.com/news/home/20260105818373/en/Lyte-Emerges-From-Stealth-With-$107-Million-to-Build-the-Perception-Foundation-for-Physical-AI) |
| **Loop** | Supply-chain AI | **Led** $95 M Series C (Apr 2026) — via the Valor Atreides AI fund | [TechCrunch](https://techcrunch.com/2026/04/17/loop-raises-95m-to-build-supply-chain-ai-that-predicts-disruptions/) |
| **[Astera Labs](research/2026/atreides/companies/astera-labs)** | AI connectivity (pre-IPO) | $50 M Series C @ $950 M (Sep 2021); Baker: held "since Series C" — now the top public equity position | [Intel Capital PR](https://www.intelcapital.com/astera-labs-secures-50m-in-series-c-funding-at-a-950m-valuation-to-accelerate-product-and-customer-momentum/) |
| **[SpaceX](research/2026/atreides/companies/spacex)** | Launch / Starlink — **IPO priced at $135 (~$1.77 T), Nasdaq debut as SPCX set for June 12, 2026** | Long-standing holding; described in 2022 internal docs as the **largest position in the fund's VC sleeve**; ~$2.5 B reported value (Apr 2026, single source) | [TechCrunch](https://techcrunch.com/2025/01/01/internal-spacex-documents-show-the-sweet-stock-deals-offered-to-investors-like-a16z-gigafund/), [GuruFocus](https://www.gurufocus.com/news/8877951/spacex-investment-boosts-gains-for-atreides-capital-spac) |
| **Xsight Labs** | Israeli networking semis | Venture investor; Baker on the board | [Atreides team bio](https://atreidesmgmt.com/team/gavin-baker/) |

The pattern is unmistakable: **the private book is the same thesis as the public book, one layer earlier.** Cerebras/SiFive/Enfabrica/Xsight = compute and connectivity silicon (the private Astera/Credo). Crusoe = watts (the private Vistra/CoreWeave). Lyte/Decart/Cognition = the application/robotics frontier. Several public positions (Astera confirmed; ACV Auctions, Sonder probable; CoreWeave, Chime, EquipmentShare inferred from IPO-window timing only — public funding records don't name Atreides) began as private-side positions and crossed over at IPO. And the crossover now runs both directions: Cerebras listed in May 2026 and SpaceX lists June 12, 2026, moving the two flagship private marks into the public book.

## Probable (weaker sourcing — firm bios, databases)

Earlier venture positions attributed to Atreides in profiles and databases, typically $10–50 M checks: **ACV Auctions, Sonder, DriveNets, Druva, K Health, Nexar, Premise Data, Electric AI, Mythic AI**.[^3] Via the Valor Atreides AI fund: **Heron Power, Bedrock Robotics** (PitchBook).

## Explicitly Not Confirmed

Despite Baker's constant public commentary on them, **no source places Atreides in disclosed investor lists for xAI, Anthropic, OpenAI, Anduril, Stripe, Databricks, Groq, Figure, Mistral, Safe Superintelligence, Scale AI, or Neuralink.** Two important nuances:

1. **Valor Equity Partners — the JV partner — is a major xAI backer.** A "Valor Atreides AI" LP could plausibly carry indirect xAI exposure, but the Form Ds disclose nothing about underlying assets. Treat as rumor-grade.
2. The 24 Special Circumstances SPVs are deal-specific and anonymous; some of the larger 2025–26 series (W at $122 M, X at $83 M) plausibly map to the confirmed rounds above (Cerebras H, SiFive G, Cognition D timing all fit), but the mapping is inference, not fact.

## Footnotes

[^1]: [Capital Allocators EP.489 — "Truth-Seeking and Crossover Investing at Atreides" (Mar 2, 2026)](https://www.capitalallocators.com/podcast/truth-seeking-and-crossover-investing-at-atreides/)
[^2]: [Bloomberg — "Gavin Baker's Atreides plans to raise opportunistic venture fund" (Jul 21, 2022)](https://www.bloomberg.com/news/articles/2022-07-21/gavin-baker-s-atreides-plans-to-raise-opportunistic-venture-fund)
[^3]: [The Marque — Gavin Baker profile](https://www.themarque.com/profile/gavin-baker); [Insider Monkey — Atreides Management](https://www.insidermonkey.com/hedge-fund/atreides+management/1215/)
