---
title: "Sandisk (SNDK)"
weight: 60
---

## Snapshot

- **Ticker:** SNDK (Nasdaq, spun from Western Digital February 21, 2025)
- **Bucket:** [Storage & Memory](research/2026/situational-awareness-fund/categories/storage-memory)
- **Q4 2025 fund position:** $250.2 M (1.05 M sh) — **4.53 % of 13F**, **#9 holding**
- **Fiscal year:** ends late June (inherited from WDC)
- **HQ:** Milpitas, CA

## Business Overview & Spin Context

Sandisk is the **NAND flash and SSD pure-play** spun out of Western Digital on February 21, 2025 (1:3 distribution to WDC shareholders). The spin completed a separation that had been logical for years: WDC's HDD business and Flash business have very different capex requirements, customer mixes, and cyclicality.

Sandisk holds a long-standing **50/50 fab joint venture with Kioxia** (the former Toshiba Memory) operating multiple 3D NAND fabs at **Yokkaichi and Kitakami in Japan**, plus its own controller/firmware engineering and a strong consumer brand (SanDisk-branded SSDs, memory cards, USB).

Following the spin, Sandisk is a clean exposure to:

- **Client SSDs** — PC and laptop OEM
- **Consumer storage** — cards, USB, portable SSDs (the SanDisk retail brand)
- **Mobile NAND** — UFS for smartphones
- **Enterprise SSDs** — data-center capacity drives, high-performance NVMe (the AI-relevant segment)

## Financial Trajectory (combined Flash segment / pro-forma WDC era)

| Metric (USD M) | FY22 (Jun-22, WDC Flash) | FY23 | FY24 | FY25 (Jun-25, first as Sandisk) |
|----------------|-------------------------:|----:|----:|--------------------------------:|
| **Revenue** | 9,750 | 6,320 (−35 %, NAND down-cycle) | **6,660** (+5 %) | **7,400–7,600** (+12–14 %) |
| Gross margin | — | trough negative | recovering | ~30 % non-GAAP by F4Q'25 |
| Operating margin | — | negative | mixed | swung positive FY25 |
| Net income | — | loss | mixed | modest profit FY25 |
| Adj. EBITDA | — | — | — | **1,200–1,500** FY25 |

### Quarterly Trajectory

Recent quarters: ~$1.7 B → $1.9 B → $2.0 B+ trajectory through CY 2025 as NAND ASP recovered and bit shipments grew.

## Cash Flow & Balance Sheet

- **Capex:** Shared with Kioxia at the JV fabs (Yokkaichi/Kitakami); Sandisk standalone capex ~$0.6–1.0 B
- **FCF:** Positive in upcycle FY25
- **Total debt** (allocated at spin): ~$2.0–2.5 B
- **Net debt / EBITDA:** 1.5–2× — manageable

## Segment / Product Mix

| Segment | % of revenue | Notes |
|---------|-------------:|-------|
| **Client SSD** | ~30–35 % | PC OEM (Dell, HP, Lenovo) |
| **Consumer (retail)** | ~25–30 % | SanDisk-branded — high-margin retail |
| **Mobile NAND (eMMC/UFS)** | ~15–20 % | Smartphones |
| **Enterprise SSD** | ~15–20 % | The AI-relevant segment, smallest leg |

Enterprise SSD is historically the **weakest leg** for the Sandisk/Kioxia consortium vs. Samsung and Solidigm. This is both the bull and bear case: bull = room to grow share; bear = competitive disadvantage.

## NAND Cycle Context

Three structural shifts make NAND interesting in the AI cycle:

1. **Inference-time KV-cache offload to fast NAND** — long-context inference creates pressure to swap KV state out of HBM and onto fast NAND tiers (NVMe-attached or CXL-attached). Per-token economics favor cheaper-but-fast storage where latency permits.
2. **Training dataset persistence at multi-PB scale** — frontier labs hoard multi-petabyte training datasets that need fast NAND for repeated epoch reads.
3. **Supply discipline** — NAND is a commodity oligopoly (Samsung, Kioxia/Sandisk, SK Hynix, Micron, YMTC). After the 2023–2024 down-cycle, surviving suppliers cut capex sharply. Prices recovered in 2025.

## Operational KPIs

- **Bit shipments:** Mid-teens % YoY growth FY25
- **ASP/bit:** Up double-digit % YoY in FY25 on supply discipline
- **Capex:** Disciplined; **BiCS8 (218-layer)** ramping; **BiCS9** in development
- **Kioxia JV:** 50/50 wafer split; node transitions are the key cost-down lever

## Why It Fits the Thesis

Two AI-relevant pressures favor NAND structurally (above), and the fund's choice of SNDK over **Micron** (which it was actually short via puts in Q3 2025) reflects a view that **NAND is the better-positioned memory class** vs. DRAM/HBM, where consensus is already crowded.

Specifically:
- The Q3 2025 MU put position (closed by Q4) signals the fund is **negative on DRAM/HBM near-term** (consensus too bullish, supply ramping fast).
- The SNDK long signals **positive on NAND** (less crowded, structural inference-tier demand, supply discipline).

The bet is therefore not on memory broadly but on the **NAND vs. DRAM relative call**.

## Position History in the Fund

| Quarter | Position |
|---------|----------|
| Q3 2025 | Held WDC + initial SNDK exposure (post-spin) |
| Q4 2025 | Rotated entirely into SNDK at 1.05 M sh; exited residual WDC |

## Risks

- **NAND pricing volatility** — commodity exposure remains.
- **Kioxia JV dependency** for fab capacity and capex decisions.
- **HBM cannibalization** if AI inference architectures shift more aggressively to DRAM-based caching.
- **Enterprise SSD competitive disadvantage** vs. Samsung and Solidigm — slower share gain in the highest-margin AI workload.
- **Limited stand-alone history** — first stand-alone 10-K only covers a stub period; less data for analysts to anchor on.

## Sources

- WDC FY24 10-K (pre-spin)
- Sandisk Form 10 / spin filings
- Sandisk first 10-Q post-spin
- Sandisk investor day post-spin (February 2025)
