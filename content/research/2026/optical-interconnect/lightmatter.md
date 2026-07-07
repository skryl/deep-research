---
title: "Lightmatter — The Architecture Bet"
weight: 3
---

## One-line thesis

Lightmatter is the **photonic systems company**: rather than selling a small chiplet that plugs into someone else's package, it sells the package's foundation itself — a 3D *active photonic interposer* (Passage M1000) on which customers mount their compute dies, plus conventional co-packaged optics chiplets (L200) for those who want the incremental path. It is the higher-ambition, higher-ASP, higher-execution-risk architecture.

## Origins and team — including the pivot

Founded 2017 out of MIT by **Nick Harris** (CEO; PhD in quantum photonics, ex-Micron), **Darius Bunandar** (Chief Scientist), and **Thomas Graham** (President; ex-Google, ex-Morgan Stanley). Headcount ~220 (Feb 2025), offices in Mountain View and Boston. CFO **Simona Jankowski** (July 2024) came from NVIDIA investor relations via Goldman Sachs — an IPO-preparation hire. In 2026 the company hired Google's Director of AI Infrastructure product management to lead product strategy "as the company enters a new chapter focused on production at scale."[^1]

The corporate history contains a real pivot that the marketing does not advertise: Lightmatter's first act was **photonic computing** — the Envise accelerator (2021) and Idiom software stack, which promised matrix multiplication with light at a fraction of GPU power. Envise never publicly shipped at volume; photonics can do linear algebra but not general-purpose logic, and the product line quietly receded as the company redirected to interconnect. The pivot was intelligent — Passage reuses the photonic platform where the physics actually has an edge — but it consumed years and capital, and it means today's product line is younger than the company.[^2]

## Product

- **Passage M1000** (announced March 31, 2025; availability from summer 2025) — a "3D photonic superchip": a **multi-reticle active photonic interposer of >4,000 mm²** on which up to 34 customer chiplets stack, with optical I/O available *under the entire die area* ("edgeless I/O") rather than only at the package shoreline. **114 Tbps total optical bandwidth, 256 fibers, >1.5 kW power delivery, and the first built-in solid-state optical circuit switching.** Built on GlobalFoundries Fotonix with Amkor for packaging. Accompanied by **Guide**, a high-power multi-wavelength laser engine.[^3]
- **Passage L200 / L200X** (announced same week) — more conventional 3D co-packaged optics chiplets at **32 and 64 Tbps**, co-developed with GlobalFoundries, ASE, and Amkor, **available 2026**. The L200 line concedes an important strategic point: customers want CPO chiplets before they want to re-architect onto an interposer, so Lightmatter now competes directly on Ayar's home turf while keeping the M1000 as the differentiated end-state.[^4]
- **Technical proof points**: first 16-wavelength bidirectional link on a single fiber (August 2025); M1000 presented at Hot Chips 2025.[^4]

## Funding and cap table

| Round | Date | Amount | Valuation | Key investors |
|---|---|---|---|---|
| Series C | 2023 | \$154M | — | GV (Google Ventures), SIP |
| Series C-2 | Dec 2023 | \$155M | \$1.2B | GV |
| Series D | Oct 2024 | \$400M | **\$4.4B** | **T. Rowe Price** (lead), Fidelity, GV |

Total raised: ~\$850M.[^5]

Two things stand out against Ayar's table. First, the syndicate is **financial-crossover-heavy** (T. Rowe, Fidelity) with Google as the sole strategic of note — no chipmaker investors, which reads either as independence or as absence of chipmaker conviction, depending on your prior. Second, Harris said the Series D was "most likely the last funding round" before an IPO — a statement that, twenty months later with no IPO and no new round, converts from swagger into a constraint: the next priced event is either a flat-to-up round after a customer announcement, or a public listing into a market that will demand revenue.

## Traction and 2026 momentum

- **NVLink Fusion membership (June 3, 2026)** — Lightmatter will deliver CPO *and* near-packaged optics (NPO) compatible with NVIDIA optical and SerDes technology, claiming its bidirectional architecture halves fiber and connector count. Same sanctioned lane as Ayar: optical connectivity for semi-custom XPUs inside NVIDIA racks.[^6]
- **Production-readiness signals**: GF/ASE/Amkor manufacturing partnerships; senior product hire from Google; L200 2026 availability.
- **Still no publicly named end customer and no disclosed revenue.** For a company that told investors large cloud deals were the 2025 plan, the public record shows announcements, sampling, and partnerships — not deployments.[^2]

## Bull case at \$4B

1. **You're buying below the last round.** \$4B is ~9% under the October 2024 mark — the only discount available anywhere in this category — for the company with the most differentiated product architecture.
2. **If interposers win, Lightmatter owns the category.** The M1000 is not a faster transceiver; it is a different way to build packages. Should 2028-era XPUs move to optical interposers with integrated circuit switching (the logical endpoint of the bandwidth wall), no competitor — including NVIDIA — has a comparable productized platform.
3. **Higher value capture per socket.** An active interposer plus laser engine is a system sale at 10–100× a chiplet's ASP; fewer design wins are needed for the same revenue.
4. **Two-lane strategy**: L200 competes for the near-term CPO chiplet business while M1000 holds the architectural high ground — a real hedge, not a pivot.
5. **IPO-ready plumbing**: NVIDIA-alumni CFO, crossover investor base built for a listing, Google relationship.

## Bear case at \$4B

1. **The mark is stale and the signal is negative.** No priced round in 20 months, after a near-4× markup, with public "last round before IPO" statements — flat is the friendly interpretation.
2. **Execution surface is enormous.** A >4,000 mm² multi-reticle active interposer with kilowatt-class power delivery is among the hardest packaging objects ever attempted; thermal sensitivity of photonics next to multi-kW compute is exactly the problem Marvell cited when it bought Celestial's thermally-robust alternative.
3. **The customer asks for the whole package.** Adopting M1000 means re-architecting your chip around Lightmatter — a far bigger commitment than socketing an 8 Tbps UCIe chiplet, from a startup that already sunset one product line (Envise).
4. **No chipmaker strategics on the cap table** and the burn profile of a systems company; if the market slips a year, the financing options are all dilutive or public.
5. **Same ceiling from the Celestial comp** — \$3.25B guaranteed was the observed strategic exit for a peer; at \$4B you cannot underwrite to M&A.

[^1]: [Lightmatter valuation, funding & news — Sacra](https://sacra.com/c/lightmatter/); [Who is the CEO of Lightmatter — Clay](https://www.clay.com/dossier/lightmatter-ceo)
[^2]: [Report: Lightmatter Business Breakdown & Founding Story — Contrary Research](https://research.contrary.com/company/lightmatter)
[^3]: [Lightmatter Unveils Passage M1000 Photonic Superchip — Business Wire](https://www.businesswire.com/news/home/20250331220170/en/Lightmatter-Unveils-Passage-M1000-Photonic-Superchip-Worlds-Fastest-AI-Interconnect); [Lightmatter Passage M1000 at Hot Chips 2025 — ServeTheHome](https://www.servethehome.com/lightmatter-passage-m1000-at-hot-chips-2025/)
[^4]: [Lightmatter Announces Passage L200 — Lightmatter](https://lightmatter.co/press-release/lightmatter-announces-passage-l200-the-fastest-co-packaged-optics-for-ai/); [Lightmatter unveils M1000 and L200 Passage photonic interconnects — DCD](https://www.datacenterdynamics.com/en/news/lightmatter-unveils-m1000-and-l200-passage-photonic-interconnects/)
[^5]: [Lightmatter Raises \$400M Series D; Quadruples Valuation to \$4.4B — Business Wire](https://www.businesswire.com/news/home/20241016498931/en/Lightmatter-Raises-$400M-Series-D-Quadruples-Valuation-to-$4.4B-as-Photonics-Leader-for-Next-Gen-AI-Data-Centers); [Google backs Lightmatter again in \$400M fundraising — optics.org](https://optics.org/news/15/10/36)
[^6]: [Lightmatter Joins NVIDIA NVLink Fusion — Business Wire](https://www.businesswire.com/news/home/20260602479000/en/Lightmatter-Joins-NVIDIA-NVLink-Fusion-and-Powers-Next-Generation-AI-Infrastructure-with-Photonic-Interconnects); [Scale-Up is a Problem Made for Photonics — Lightmatter](https://lightmatter.co/blog/scale-up-is-a-problem-made-for-photonics/)
