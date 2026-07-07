---
title: "Optical Interconnect — Ayar Labs vs. Lightmatter"
date: 2026-07-07
---

## Overview

This deep dive compares the two most valuable private optical-interconnect startups as **VC investments at a \$4B valuation**: [Ayar Labs](ayar-labs) and [Lightmatter](lightmatter). Both sell the same top-level story — replacing copper with light at the chip package boundary so AI clusters can keep scaling — but they differ sharply in product architecture, go-to-market, capital structure, and what \$4B means relative to their last observed prices.

The \$4B mark lands differently on each company. For **Ayar Labs**, it is a ~7% step up from an *observed, market-clearing* price: the \$3.75B Series E closed in March 2026 (\$500M led by Neuberger Berman, with NVIDIA, AMD, Alchip, and MediaTek participating). For **Lightmatter**, it is a ~9% *discount* to the \$4.4B Series D of October 2024 — a round its CEO called likely the last before an IPO — with no new priced round in the twenty months since. Same number, two different epistemic states.

This is research, not investment advice. All figures are as of early July 2026 and sourced in footnotes on each page.

## Pages

1. [Market Context](market-context) — the bandwidth wall, scale-out vs. scale-up co-packaged optics, NVIDIA's copper-to-optics roadmap (Rubin → Feynman), TSMC COUPE, and the Marvell–Celestial AI acquisition that reset exit math for the whole category
2. [Ayar Labs](ayar-labs) — the standards bet: UCIe optical chiplets, external SuperNova light source, and a cap table that doubles as a customer pipeline (NVIDIA, AMD, Intel all investors)
3. [Lightmatter](lightmatter) — the architecture bet: Passage M1000 3D photonic superchip, L200 co-packaged optics, a pivot survived, and an IPO-or-bust capital structure
4. [Head-to-Head & Verdict](comparison) — dimension-by-dimension comparison, valuation math at \$4B, the Celestial AI comp, scenario analysis, and portfolio conclusions

## Key Findings

- **June 2026 was the convergence moment.** Within the same week, both companies joined NVIDIA's NVLink Fusion ecosystem (Ayar Labs June 2, Lightmatter June 3), making their optical engines electrically and optically compatible with NVIDIA SerDes and switch silicon. The merchant optical-I/O business model now runs *through* NVIDIA's rack architecture rather than around it.[^1]
- **The exit comp is the elephant in the data room.** Marvell agreed to acquire Celestial AI — the third member of the optical-I/O triumvirate — in December 2025 for \$3.25B upfront (\$1B cash + \$2.25B stock), with earnouts to \$5.5B requiring \$2B of cumulative revenue by fiscal 2029. At a \$4B entry, the *observed strategic take-out price for a peer* is roughly your cost basis. The bet must therefore be underwritten to an IPO-scale outcome, not an acquisition.[^2]
- **The market is real and the timing is now legible.** LightCounting sizes AI-cluster optics at ~\$16.5B in 2025 growing to ~\$26B in 2026, with co-packaged optics specifically reaching ~\$10B by 2030. NVIDIA's roadmap puts optical NVLink scale-up (the segment both startups actually target) at the **Feynman generation, shipping 2028** — copper carries Rubin through 2027. Revenue at scale for either company is a 2028–2030 event.[^3]
- **Ayar Labs at \$4B is buying at the market price.** The March 2026 Series E priced it at \$3.75B with the deepest strategic syndicate in semiconductors (NVIDIA, AMD, Intel Capital, HPE, Lockheed, GlobalFoundries across rounds). Three generations of TeraPHY silicon, ~15,000 units shipped by end-2024, the industry's first UCIe optical chiplet (8 Tbps), and a standards-based merchant model aligned to how hyperscalers actually buy.
- **Lightmatter at \$4B is buying a stalled mark with bigger architecture upside.** The Passage M1000 (114 Tbps active photonic interposer, >4,000 mm², integrated optical circuit switching) is the most ambitious photonic product ever productized, and L200/L200X CPO chiplets ship in 2026 via GlobalFoundries/ASE/Amkor. But there are still no publicly named end customers, no disclosed revenue, a shelved first act (the Envise photonic computer), and a flat-to-down implied mark after 20 months.
- **The common risk is vertical integration, not each other.** NVIDIA builds its own co-packaged optics for switches (Quantum-X/Spectrum-X, shipping 2025–26), Broadcom ships Tomahawk 6 "Davisson" CPO, Marvell now owns Celestial, AMD bought Enosemi and is running TSMC COUPE risk production. The merchant startups' durable niche is the non-NVIDIA XPU ecosystem — custom ASICs from Alchip, GUC, MediaTek, and hyperscaler in-house silicon — plus whatever NVLink Fusion sockets NVIDIA permits.

## Snapshot

| | **Ayar Labs** | **Lightmatter** |
|---|---|---|
| Valuation (this doc) | \$4B (last round: \$3.75B, Mar 2026) | \$4B (last round: \$4.4B, Oct 2024) |
| Founded | 2015 (MIT/Berkeley/CU Boulder, DARPA POEM) | 2017 (MIT) |
| Total raised | ~\$870M | ~\$850M |
| Core product | TeraPHY UCIe optical chiplet (8 Tbps) + SuperNova external laser | Passage M1000 3D photonic interposer (114 Tbps) + L200/L200X CPO (32/64 Tbps) + Guide laser |
| Model | Merchant chiplet, UCIe standards | System-level photonic interposer + CPO chiplets |
| Foundry | GlobalFoundries Fotonix (45SPCLO); TSMC path via Alchip/GUC | GlobalFoundries Fotonix; ASE, Amkor packaging |
| Strategic investors | NVIDIA, AMD, Intel, HPE, Lockheed, GF, Alchip, MediaTek | GV (Google), Fidelity, T. Rowe Price (financial-heavy) |
| NVLink Fusion | ✅ June 2, 2026 | ✅ June 3, 2026 |
| Disclosed shipments | ~15,000 units (through 2024); volume production ramp funded by Series E | Sampling/production-readiness; L200 availability 2026 |
| Named end customers | None disclosed (partners: Fujitsu, HPE, Alchip, GUC) | None disclosed |
| Headcount | ~214 (Oct 2025) | ~220 (Feb 2025) |

[^1]: [Ayar Labs Joins NVIDIA NVLink Fusion Ecosystem — Ayar Labs](https://ayarlabs.com/news/ayar-labs-joins-nvidia-nvlink-fusion-ecosystem-to-bring-co-packaged-optics-to-rack-scale-ai-infrastructure/); [Lightmatter Joins NVIDIA NVLink Fusion — Business Wire](https://www.businesswire.com/news/home/20260602479000/en/Lightmatter-Joins-NVIDIA-NVLink-Fusion-and-Powers-Next-Generation-AI-Infrastructure-with-Photonic-Interconnects)
[^2]: [Marvell to acquire Celestial AI for as much as \$5.5 billion — CNBC](https://www.cnbc.com/2025/12/02/mrvl-earnings-q3-2026-acquires-celestial-ai.html); [Marvell Closes \$3.25 Billion Celestial AI Acquisition — Fintool](https://fintool.com/news/marvell-celestial-ai-optical-interconnect)
[^3]: [LightCounting — AI creates a new wave in demand for optical transceivers and accelerates CPO adoption (Jan 2026)](https://www.lightcounting.com/newsletter/en/january-2026-optics-for-ai-clusters-366); [NVIDIA updates data center roadmap — Tom's Hardware](https://www.tomshardware.com/pc-components/gpus/nvidia-updates-data-center-roadmap-with-rosa-cpu-and-stacked-feynman-gpus-optical-nvlink-groq-lpus-with-nvfp4-and-nvlink-also-on-deck)
