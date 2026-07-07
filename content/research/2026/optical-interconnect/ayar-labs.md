---
title: "Ayar Labs — The Standards Bet"
weight: 2
---

## One-line thesis

Ayar Labs is the **merchant optical-I/O chiplet company**: a small, standards-compliant (UCIe) electro-optical chiplet that any chipmaker can drop into their package, powered by an external, field-replaceable laser — betting that the industry adopts optics the way it adopted every other interface: through open standards and multi-vendor supply, not proprietary systems.

## Origins and team

Ayar Labs is the longest-running pure-play in the category. Its technology descends from **DARPA's POEM program** (Photonically Optimized Embedded Microprocessors), a Berkeley/MIT/CU Boulder collaboration that produced a landmark 2015 *Nature* paper: a microprocessor with 70M transistors and 850 photonic components, demonstrating optical I/O in a standard CMOS process. The company was founded in 2015 by **Mark Wade** (CEO since December 2023), **Vladimir Stojanovic** (CTO, ex-Berkeley professor who led POEM), **Chen Sun**, and **Alex Wright-Gladstein**, with MIT's Rajeev Ram and CU Boulder's Milos Popovic as academic co-founders.[^1]

The founder-market fit is unusually literal: the people who wrote the founding papers of monolithic optical I/O still run the company's technology. Headcount was ~214 as of October 2025 — small relative to its valuation, consistent with a chiplet (not systems) scope.[^2]

## Product

- **TeraPHY** — an optical I/O chiplet that sits next to the host die in-package. The third-generation part, announced March 31, 2025, is the **industry's first UCIe optical chiplet**: 8 Tbps bidirectional bandwidth, ~10 ns per-port latency, 16 wavelengths per port, and power claimed at 1/4–1/8 of conventional interconnects (<5 pJ/bit). UCIe compliance means any chip team designing to the standard die-to-die interface can integrate it without a bespoke electrical spec.[^3]
- **SuperNova** — an external 16-wavelength DFB laser source (CW-WDM MSA compliant) driving up to 16 Tbps across 256 channels. Keeping the laser *outside* the package is a deliberate reliability position: lasers are the highest-failure-rate component, and an external, pluggable source means a laser failure is a field swap, not a dead \$40K accelerator. This is a genuine philosophical divide with in-package laser approaches.[^3]
- **Manufacturing** — GlobalFoundries Fotonix (45SPCLO monolithic photonics platform), with a TSMC-ecosystem path opening via Alchip and Global Unichip (GUC) partnerships and a new Hsinchu office. Roughly **15,000 TeraPHY units had shipped by December 2024** — engineering and qualification volumes, not revenue scale, but three silicon generations of learning.[^2]

## Funding and cap table

| Round | Date | Amount | Valuation | Key investors |
|---|---|---|---|---|
| Series B | Nov 2020 | \$35M | — | Intel Capital, Lockheed Martin Ventures |
| Series C | Apr 2022 | \$130M | — | HPE, NVIDIA, GlobalFoundries |
| Series D | Dec 2024 | \$155M | ~\$1B | Advent, Light Street, **AMD Ventures, Intel Capital, NVIDIA** |
| Series E | Mar 2026 | \$500M | **\$3.75B** | **Neuberger Berman** (lead), ARK Invest, Insight Partners, QIA, Sequoia Global Equities, 1789 Capital, **AMD, NVIDIA, Alchip, MediaTek** |

Total raised: ~\$870M.[^4]

The cap table is the moat argument in miniature: **NVIDIA, AMD, and Intel are all investors** — the only optical startup all three GPU/CPU vendors have backed — plus HPE, Lockheed, GlobalFoundries, and now the Taiwanese ASIC channel (Alchip, MediaTek) that builds hyperscaler custom silicon. Strategic investment is not a purchase order, but in semiconductors it is usually a prerequisite for one: these investments buy the insiders information rights on the technology they may socket.

## Traction and 2026 momentum

- **Series E (\$500M, March 2026)** explicitly funds high-volume production and test capacity, Taiwan expansion, and CPO deployment acceleration — the round of a company tooling for a ramp, not searching for product-market fit.[^4]
- **NVLink Fusion membership (June 2, 2026)** — TeraPHY becomes optically and electrically compatible with NVIDIA SerDes and switch silicon; Ayar CTO Stojanovic and Alchip's CTO jointly pitched integrating CPO into next-gen AI accelerators and scale-up switches.[^5]
- **Ecosystem**: named collaborations across Fujitsu, HPE, Alphawave, d-Matrix, ASE, Corning, Sivers, Lumentum. Still **no named volume end customer** — the gap between qualification and production that defines the whole category.

## Bull case at \$4B

1. **You are paying the market price.** \$4B is +7% over a \$3.75B round priced four months ago by sophisticated crossover investors with full data-room access. No valuation leap of faith is required — only agreement with March 2026 pricing.
2. **Standards win interface wars.** UCIe is backed by Intel, AMD, NVIDIA, TSMC, Samsung, and every hyperscaler. If optical attach happens through open chiplet interfaces, Ayar has a multi-year head start on the only compliant part.
3. **The cap table converts.** Custom XPU programs at hyperscalers (via Alchip/GUC/MediaTek) plus NVLink Fusion give multiple, independent paths to a 2027 design win shipping in 2028 Feynman-era systems.
4. **External laser = the reliability story hyperscalers want.** Serviceability at datacenter scale is a first-order purchasing criterion, and Ayar owns the clean version of that argument.
5. **Capital efficiency**: three silicon generations and a production ramp on \$870M raised, with a 214-person team — a materially lower burn architecture than systems-scope peers.

## Bear case at \$4B

1. **Chiplet ASPs are small.** A merchant I/O chiplet captures a thin slice of package value; billions in revenue require enormous unit volumes (the company's own forecast of >100M units by 2028 shows the shape of what "success" must be).
2. **No named anchor customer** after a decade of existence and eleven years of the technology existing. Qualification cycles keep ending in incumbent silicon.
3. **TSMC COUPE** could make "optical I/O chiplet" a foundry checkbox by 2027, collapsing merchant differentiation exactly when Ayar's ramp begins.
4. **NVIDIA optionality cuts both ways** — its investment and NVLink Fusion membership coexist with a first-party photonics program; the biggest buyer is also the most capable substitute.
5. **The Celestial comp** caps the M&A downside-exit at roughly cost basis: \$4B entry needs an IPO.

[^1]: [Photonic communication comes to computer chips — MIT News](https://news.mit.edu/2018/startup-ayar-labs-optoelectronic-computer-chips-0406); [Ayar Labs Names Mark Wade CEO — Ayar Labs](https://ayarlabs.com/news/ayar-labs-names-mark-wade-ceo/)
[^2]: [Report: Ayar Labs Business Breakdown & Founding Story — Contrary Research](https://research.contrary.com/company/ayar-labs)
[^3]: [Ayar Labs Unveils World's First UCIe Optical Chiplet for AI Scale-Up Architectures — Business Wire](https://www.businesswire.com/news/home/20250331044779/en/Ayar-Labs-Unveils-Worlds-First-UCIe-Optical-Chiplet-for-AI-Scale-Up-Architectures); [Ayar Labs prepares to fulfil its optical I/O vision — Gazettabyte](https://gazettabyte.com/ayar-labs-prepares-to-fulfil-its-optical-input-output-i-o-vision/)
[^4]: [Ayar Labs Closes \$500M Series E, Accelerates Volume Production of Co-Packaged Optics — Business Wire](https://www.businesswire.com/news/home/20260303608615/en/Ayar-Labs-Closes-$500M-Series-E-Accelerates-Volume-Production-of-Co-Packaged-Optics); [Ayar Labs Raises US\$500 Million — Optics & Photonics News](https://www.optica-opn.org/home/industry/2026/march/ayar_labs_raises_us$500_million/); [Ayar Labs raises \$155m in Series D — Semiconductor Today](https://www.semiconductor-today.com/news_items/2024/dec/ayar-labs-121224.shtml)
[^5]: [Ayar Labs Joins NVIDIA NVLink Fusion Ecosystem — Ayar Labs](https://ayarlabs.com/news/ayar-labs-joins-nvidia-nvlink-fusion-ecosystem-to-bring-co-packaged-optics-to-rack-scale-ai-infrastructure/); [Ayar Labs joins NVLink Fusion — SDxCentral](https://www.sdxcentral.com/news/ayar-labs-joins-nvlink-fusion-bringing-co-packaged-optics-to-nvidias-ai-infrastructure/)
