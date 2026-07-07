---
title: "Aalo Atomics — The Capital-Efficiency Bet"
weight: 4
---

## Snapshot

| | |
|---|---|
| Valuation | **\$2–3B assumed per this doc's prompt.** Last *disclosed* mark: ~\$450M (Aug 2025 Series B); an undisclosed **Series B-II closed May 25, 2026** with Ontario Teachers' Pension Plan participating |
| Founded | 2023, Austin, TX |
| Founders | Matt Loszak (CEO — repeat software founder, physics background) and **Yasir Arafat (CTO — led INL's MARVEL microreactor, key figure behind Westinghouse's eVinci)** |
| Capital raised (disclosed) | >\$136M: \$6M seed (2023), ~\$30M Series A (2024), \$100M Series B (Aug 2025, led by **Valor Equity Partners**) + undisclosed B-II |
| Other investors | Fine Structure Ventures, Hitachi Ventures, **NRG Energy**, Tishman Speyer, Kindred, 50Y, Harpoon, Crescent Enterprises, Crosscut, Alumni Ventures, MCJ, Nucleation, Ontario Teachers' |
| Technology | Aalo-1: 10 MWe sodium-cooled, non-pressurized pool-type microreactor, **UZrH (TRIGA-type) fuel at 5% LEU** |
| Datacenter product | **Aalo Pod ("XMR")**: 5 × Aalo-1 sharing one turbine = **50 MWe per pod**, scalable to gigawatts |
| Demonstrated | **Aalo-X critical test reactor achieved criticality July 4, 2026** at INL — fourth reactor under the DOE pilot |
| Commercial pipeline | Idaho Falls Power PPA negotiation (7 × Aalo-1 ≈ 75 MW, ~2030); Project Ascension (10 MWe + on-site datacenter at INL, 2027); full NRC COLA planned 2026 |
| Target economics | **~7¢/kWh NOAK LCOE** |

## The thesis

Aalo is the "boring is beautiful" version of the startup-nuclear bet. Where Valar leads with vision and Oklo with institutional maturity, Aalo's edge is **engineering conservatism wrapped in startup speed**: take the most demonstrated fuel form in history (UZrH — TRIGA fuel, used safely in research reactors since the 1950s), a coolant with 30 years of US fast-reactor fleet experience (sodium, at atmospheric pressure), a design directly derived from a national-lab program the CTO personally led (MARVEL), and put all of the innovation into **manufacturing and integration** rather than reactor physics.[^1]

The product framing is genuinely datacenter-native. Aalo coined the **"XMR" (extra modular reactor)** category: the **Aalo Pod** packages five factory-built 10 MWe Aalo-1 reactors around one shared **Baker Hughes steam turbine** for 50 MWe per pod — sized to match a datacenter hall, with pods tiling to gigawatt campuses. Both the reactor *and the plant* are modular; the pitch is "reactors from a factory line in months, not construction sites over years."[^2]

## Technology

**Aalo-1** (commercial unit): 10 MWe, sodium-cooled, non-pressurized pool-type, UZrH fuel elements, passive decay-heat removal by ambient air convection, high burnup, no operator-action safety case. Sodium's heat-transfer advantage lets the core run ~10× denser per unit size than water designs, which is what makes the factory-built form factor work.[^3]

Why the fuel choice matters more than it looks:

- **UZrH is self-regulating**: the hydrogen moderator is *in the fuel*, so reactivity feedback is prompt and strongly negative — TRIGA reactors' famous pulse tolerance. This is the physics basis for siting adjacent to a datacenter with a skeleton crew.
- **5% LEU is a solved supply chain.** Aalo became the **first US advanced-reactor company with a commercial enriched-uranium delivery contract** (Urenco, July 2025), and in March 2026 signed fuel *fabrication* with **Global Nuclear Fuel** (the GE Vernova JV), with Urenco USA having completed enrichment of the feedstock. Oklo needs HALEU (post-2029 at scale); Valar needs TRISO (tiny fab base); **Aalo can order fuel from the existing industry today.**[^4]
- The MARVEL lineage is real, not marketing: Arafat ran MARVEL at INL and was pivotal to eVinci at Westinghouse before that. Aalo is effectively the commercial spinout of the national lab's microreactor learning curve.

## Execution record: criticality on ~\$136M

| Date | Event |
|---|---|
| Jul 2025 | **Urenco LEU contract** — first commercial enriched-uranium delivery contract for a US advanced-reactor company |
| Aug 2025 | \$100M Series B led by Valor Equity Partners |
| Sep 2025 | **Groundbreaking for Aalo-X at INL**; Baker Hughes turbine selected |
| Nov 2025 | Reactor modules shipped from Austin factory; on-track milestones for 2026 criticality |
| Mar 2026 | Fuel fabrication contract with Global Nuclear Fuel; enriched feedstock delivered |
| May 2026 | Series B-II (undisclosed) with **Ontario Teachers' Pension Plan** |
| **Jul 4, 2026** | **Aalo-X criticality at INL, 12:20 a.m. MT** — fourth DOE-authorized reactor, ~10 months from groundbreaking |
| Next | **Project Ascension**: second reactor beside Aalo-X — a commercial-scale 10 MWe unit powering an **on-site datacenter in 2027** |

Ten months from groundbreaking to criticality, on roughly \$136M of lifetime disclosed funding, is the standout capital-efficiency datapoint across the entire cohort — Valar consumed ~4× the capital and Oklo ~15× the calendar time to reach comparable-or-lesser demonstration milestones.[^5]

## Commercial pipeline

- **Idaho Falls Power**: negotiating a PPA for a fleet of **seven Aalo-1 reactors (~75 MW)** at IFP's Energy Research Park, with an up-to-80-year land lease; online no earlier than ~2030. A municipal utility is a modest anchor customer, but it is a *named counterparty negotiating actual power prices* — something Valar lacks entirely.[^6]
- **Project Ascension (2027)**: the INL reactor-plus-datacenter pairing would be the first demonstration of the actual product (nuclear electrons → racks) at commercial reactor scale.
- **NRC**: Aalo plans a **full COLA submission in 2026** — running the conventional path in parallel with DOE authorization, the same dual-track shape as Oklo and unlike Valar's litigation-plus-offshore posture.
- Strategic investors read like a channel map: **NRG Energy** (merchant power), **Hitachi Ventures** (nuclear supply chain), **Tishman Speyer** (real estate/datacenter development), Ontario Teachers' (infrastructure capital for eventual project finance).

## Bull case

1. **Best technology-risk-per-dollar in the cohort**: proven fuel + proven coolant + national-lab pedigree; the bet is manufacturing, not physics.
2. **Only player on a commercial LEU fuel supply chain** — no HALEU cliff, no TRISO bottleneck; fuel firsts (Urenco, GNF) are durable structural advantages.
3. **Capital efficiency compounds**: reaching criticality on ~\$136M implies the Series B-II and subsequent rounds buy far more progress per dollar than peers.
4. **50 MWe pod is the right unit size** for datacenter campuses — big enough to matter (vs. Valar's 5 MWe), small enough to factory-build (vs. Oklo's 75 MWe site-built powerhouse).
5. 2027 reactor-plus-datacenter demo at INL is the nearest-term "product actually exists" event of the three companies.

## Bear case

1. **Thinnest balance sheet**: ~\$136M disclosed (plus an undisclosed B-II) against a roadmap — factory, COLA, Project Ascension, Idaho Falls fleet — that plausibly needs \$1B+. Financing risk is the dominant risk; a hard capital market in 2027 hits Aalo first.
2. **Aalo-X is a critical *test* reactor**, not a power unit: electricity production, turbine integration, and sustained full-power operation are still ahead (Project Ascension carries that burden).
3. UZrH fuel has never run at Aalo-1's target power density/burnup in a commercial power configuration; TRIGA heritage de-risks safety more than it de-risks economics or fuel lifetime.
4. **7¢/kWh NOAK is a target, not a track record** — and FOAK pods will be far above it; datacenter buyers comparing against gas turbines at ~\$80–110/MWh all-in may not pay the early premium.
5. Anchor commercial traction (a municipal utility PPA *negotiation*, ~2030 delivery) is the weakest hyperscaler validation of the three; no Meta/Nvidia-class logo yet.
6. At the doc's assumed **\$2–3B**, an investor is paying 4–7× the last disclosed mark — pricing in the criticality win and then some. (Symmetrically: if a new round actually clears near \$450M–\$1B, that's the best value in the sector.)

[^1]: [Aalo — company site](https://www.aalo.com/); [Aalo Atomics Achieves Criticality Milestone; Meets Executive Order Goal — Business Wire](https://www.businesswire.com/news/home/20260706396342/en/Aalo-Atomics-Achieves-Criticality-Milestone-Meets-Executive-Order-Goal); [Idaho Falls Power Negotiating PPA for MARVEL-Inspired Aalo-1 Nuclear Fleet — POWER](https://www.powermag.com/idaho-falls-power-negotiating-ppa-for-marvel-inspired-aalo-1-nuclear-fleet/)
[^2]: [Aalo unveils microreactors option for data centres — World Nuclear News](https://www.world-nuclear-news.org/articles/aalo-reveals-microreactor-solution-for-data-centres); [Aalo Atomics Unveils Prototype of Industry's First Fully Modular Nuclear Plant ("XMR") — Business Wire](https://www.businesswire.com/news/home/20250408192117/en/Aalo-Atomics-Unveils-Prototype-of-Industrys-First-Fully-Modular-Nuclear-Plant-Xmr-New-Breed-of-Reactor-Is-Purpose-Built-for-AI-and-Data-Centers); [Aalo Pod — aalo.com](https://www.aalo.com/aalo-x)
[^3]: [Idaho Falls Power PPA — POWER](https://www.powermag.com/idaho-falls-power-negotiating-ppa-for-marvel-inspired-aalo-1-nuclear-fleet/); [Aalo Atomics Nabs 1st U.S. Advanced Nuclear Fuel Deal — Data Center Frontier](https://www.datacenterfrontier.com/energy/article/55314289/aalo-atomics-breaks-ground-on-xmr-reactor-eyes-ai-data-center-integration-at-inl)
[^4]: [Aalo Signs Historic Fuel Deal with Urenco — Aalo](https://www.aalo.com/post/fuel-duel-with-urenco); [Aalo Becomes First U.S. Nuclear Reactor Company with a Contract for Commercial Delivery of Enriched Uranium — Business Wire](https://www.businesswire.com/news/home/20250910715287/en/Aalo-Atomics-Becomes-First-U.S.-Nuclear-Reactor-Company-with-a-Contract-for-Commercial-Delivery-of-Enriched-Uranium-Hits-Crucial-Next-Milestone-on-Path-to-2026-Startup); [Aalo secures fuel and turbine for experimental reactor — World Nuclear News](https://www.world-nuclear-news.org/articles/aalo-secures-fuel-and-turbine-for-experimental-reactor)
[^5]: [Aalo Atomics' Test Reactor Reaches Criticality at INL — POWER](https://www.powermag.com/aalo-atomics-test-reactor-reaches-criticality-at-inl-fourth-doe-authorized-advanced-reactor-by-july-4/); [Aalo achieves criticality on July 4 — ANS](https://www.ans.org/news/article-8182/aalo-atomics-achieves-criticality-on-july-4/); [Aalo Closes \$100M Series B — Aalo](https://www.aalo.com/post/aalo-closes-100m-series-b); [Aalo funding rounds — Tracxn](https://tracxn.com/d/companies/aaloatomics/__GYXfHmNWLqjVd-8GhmJC92tGTuAdGdLzJ7cXATZjFwQ/funding-and-investors); [Aalo valuation — PremierAlts](https://www.premieralts.com/companies/aalo-atomics/valuation)
[^6]: [Idaho Falls Power Negotiating PPA — POWER](https://www.powermag.com/idaho-falls-power-negotiating-ppa-for-marvel-inspired-aalo-1-nuclear-fleet/)
