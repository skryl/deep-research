---
title: "Market Context — AI Power Demand & the Regulatory Revolution"
weight: 1
---

## The demand shock

The investment case for all three companies rests on one macro fact: AI datacenters need firm power faster than the US grid can supply it.

- US datacenter power demand was roughly **50 GW in 2024** and is projected to reach **~76 GW in 2026**; global datacenter electricity demand is projected to roughly double by 2027, with AI workloads driving over 60% of the growth.[^1]
- Hyperscaler capex is forecast to exceed **\$600B in 2026** (up ~36% YoY), roughly 75% of it tied to AI infrastructure. US utilities are planning on the order of **\$1.4T** of investment to serve datacenter load.[^1]
- Grid interconnection queues stretch to ~8 years in key markets, and wholesale prices near hyperscale clusters have spiked severely. This is what pushes buyers toward **behind-the-meter, on-site generation** — the specific niche all three companies target.[^2]

## Hyperscalers have already gone nuclear

The offtake precedents that anchor every nuclear-startup pitch deck:

| Buyer | Deal | Scale |
|---|---|---|
| Microsoft | Constellation — Three Mile Island Unit 1 restart, 20-yr PPA, target 2027 | 835 MW |
| Meta | Vistra + **Oklo (1.2 GW, Ohio)** + TerraPower (8 × 345 MW Natrium) | up to ~6.6 GW |
| Google | Kairos Power fleet agreement; first unit ~2030 | ~500 MW |
| Amazon | X-energy Xe-100 program (Washington state, Cascade) | multi-GW by late 2030s |

The first *direct* big-tech ↔ reactor-operator PPAs began closing in early 2026, which is the strongest external validation the sector has ever had.[^3] The sober counterpoint: a June 2026 Carnegie Endowment analysis argues hyperscaler nuclear commitments substantially exceed what US supply chains, fuel availability, and construction capacity can deliver on the advertised timelines — i.e., the demand is real but the delivery schedules are aspirational.[^4]

## The 2025–26 regulatory revolution

The single biggest change in the sector's investability happened on the policy side:

- **ADVANCE Act (2024)** directed the NRC to modernize advanced-reactor licensing and reduce fees.
- **Four executive orders (May 23, 2025)**, including **EO 14301 ("Reforming Nuclear Reactor Testing at the Department of Energy")**, created a parallel track: test reactors built and operated under **DOE authorization** rather than NRC licensing, with a stated goal of **three reactors critical by July 4, 2026**.[^5]
- **DOE Reactor Pilot Program (Aug 2025)**: 11 initial company selections, including Valar, Aalo, Oklo, Antares, and Deployable Energy. The DOE also quietly relaxed several safety and environmental review requirements for these microreactor pilots — a point of criticism from parts of the nuclear establishment.[^6]

### Scoreboard as of July 4, 2026

The EO goal was met and exceeded — **four** startup-built reactors achieved criticality under DOE authorization:[^7]

| # | Company | Reactor | Criticality | Where |
|---|---|---|---|---|
| 1 | Antares Nuclear | Mark-0 | June 4, 2026 | — |
| 2 | **Valar Atomics** | Ward 250 (100 kWt HTGR) | mid/late June 2026 | San Rafael Energy Lab, Utah |
| 3 | Deployable Energy | Unity | early July 2026 | INL |
| 4 | **Aalo Atomics** | Aalo-X | July 4, 2026, 12:20 a.m. MT | INL |

### What DOE authorization does *not* give you

This is the crux for underwriting Valar and Aalo. DOE authorization covers **test and demonstration reactors**; it is not a commercial operating license. Selling commercial power at scale still requires the NRC. Two bridges are forming:

1. An **NRC proposed rule (April 2026)** to create an expedited licensing pathway for reactor designs already built and operated under DOE or DOD authorization — effectively letting the DOE pilot serve as licensing evidence.[^8]
2. Oklo's **accelerated NRC reviews** (its Principal Design Criteria topical report was approved in roughly half the traditional review time) as an existence proof that the NRC itself is speeding up.[^9]

If that proposed rule lands as drafted, the DOE-pilot companies convert their test-reactor head start into a commercial licensing head start — the key upside catalyst for both Valar and Aalo. If it stalls, they are back in the multi-year NRC queue behind Oklo.

One more policy wrinkle cuts the other way: in June 2026 the DOE announced a **\$17.5B loan program for large conventional reactors**, which triggered a rotation out of SMR names (Oklo fell ~22% that month) on the logic that gigawatt-scale AP1000s may capture more of the hyperscaler demand than the SMR crowd assumed.[^10]

## Why small reactors for datacenters at all?

The bull argument shared by all three companies:

- **Time-to-power**: a 10–75 MWe factory-built unit sited behind the meter can, in principle, beat a 5+ year interconnection queue.
- **Modularity matches datacenter phasing**: capacity can be added pod-by-pod as halls energize, instead of one lumpy gigawatt.
- **Siting freedom**: microreactors with passive safety and tiny source terms can sit adjacent to load — and (in Valar's helium-cooled case) run nearly waterless, which matters in arid datacenter geographies like Utah, Arizona, and Texas.
- **Learning curves**: nuclear's cost problem is bespoke construction; all three bet that reactors built like products (factory lines, fleet operations) invert the cost curve. This is unproven for all of them — it is *the* central technical-economic bet of the sector.

The bear argument: SMR/microreactor electricity starts expensive (FOAK units are far above grid power costs), fuel supply chains (HALEU, TRISO) are immature, and hyperscalers may satisfy most of their need with gas turbines, grid PPAs, and large-reactor restarts before microreactor fleets arrive at scale.

[^1]: [The Data Center Power Boom — Energy IB](https://ibinterviewquestions.com/guides/energy-investment-banking/data-center-power-boom-ai-demand-hyperscaler); [US Utilities Plan \$1.4T for AI Data Centers — Tech Insider](https://tech-insider.org/us-utility-1-4-trillion-ai-data-center-energy-2026/); [Data Center Investment in 2026 — Ropes & Gray](https://www.ropesgray.com/en/insights/viewpoints/102mvfl/data-center-investment-in-2026-ai-demand-power-constraints-and-private-equity)
[^2]: [AI Data Centers Hit Grid Wall: Big Tech Pivots to Nuclear in 2026](https://informedclearly.com/en/ai/53909/ai-data-centers-nuclear-power-2026)
[^3]: [Meta Locks In Up to 6.6 GW of Nuclear Power Through Deals with Vistra, Oklo, and TerraPower — POWER](https://www.powermag.com/meta-locks-in-up-to-6-6-gw-of-nuclear-power-through-deals-with-vistra-oklo-and-terrapower/); [TerraPower in Mega Deal with Meta — Neutron Bytes](https://neutronbytes.com/2026/01/09/terrapower-in-mega-deal-with-meta-for-eight-natrium-345-mw-advanced-nuclear-plants/)
[^4]: [Beyond the Hype: Assessing Hyperscaler Nuclear Commitments Against U.S. Energy Realities — Carnegie Endowment (June 2026)](https://carnegieendowment.org/research/2026/06/beyond-the-hype-assessing-hyperscaler-nuclear-commitments-against-us-energy-realities)
[^5]: [U.S. Department of Energy Reactor Pilot Program — DOE](https://www.energy.gov/ne/us-department-energy-reactor-pilot-program); [DOE Announces Initial Selections for New Reactor Pilot Program](https://www.energy.gov/articles/department-energy-announces-initial-selections-new-reactor-pilot-program)
[^6]: [Questions Abound About Valar Atomics — Neutron Bytes (Feb 2026)](https://neutronbytes.com/2026/02/28/questions-abound-about-valar-atomics/) (documents the DOE Idaho Operations Office requirement changes)
[^7]: [The deadline arrives: Checking in on the Reactor Pilot Program — ANS](https://www.ans.org/news/article-8178/the-deadline-arrives-checking-in-on-the-reactor-pilot-program/); [DOE Delivers Third Advanced Reactor Criticality](https://www.energy.gov/articles/us-department-energy-meets-president-trumps-goal-delivers-third-advanced-reactor); [Aalo Atomics' Test Reactor Reaches Criticality at INL — POWER](https://www.powermag.com/aalo-atomics-test-reactor-reaches-criticality-at-inl-fourth-doe-authorized-advanced-reactor-by-july-4/)
[^8]: [NRC proposed rule for licensing reactors authorized by DOE, DOD — ANS](https://www.ans.org/news/2026-04-06/article-7912/nrc-proposed-rule-for-licensing-reactors-authorized-by-doe-dod/)
[^9]: [Oklo's NRC Principal Design Criteria Topical Report Approved — Oklo](https://oklo.com/newsroom/news-details/2026/Oklos-NRC-Principal-Design-Criteria-Topical-Report-Approved-for-Aurora-Powerhouse-in-Idaho/default.aspx)
[^10]: [Why Oklo Stock Slumped 22% in June Despite a Month of Big Wins — The Motley Fool](https://www.fool.com/investing/2026/07/05/why-oklo-stock-slumped-22-in-june-despite-a-month/)
