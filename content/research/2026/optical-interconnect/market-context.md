---
title: "Market Context — The Bandwidth Wall & the CPO Race"
weight: 1
---

## The problem: compute scaled, wires didn't

Every AI accelerator generation roughly doubles compute, but the electrical I/O at the package edge ("shoreline") scales far slower. Copper SerDes at 224 Gbps per lane is approaching physical limits: reach shrinks to ~1 meter, power per bit rises, and the share of total system power spent just *moving data* grows toward parity with the power spent computing on it. The industry's answer is to convert to optics as close to the die as possible — **co-packaged optics (CPO)**: putting the optical engine inside the accelerator or switch package instead of in a pluggable module at the faceplate.

Two distinct markets hide under the CPO label:

- **Scale-out CPO** — optical engines inside *network switches* (Ethernet/InfiniBand). Standardized earlier, shipping first. NVIDIA's Quantum-X InfiniBand and Spectrum-X Ethernet photonic switches and Broadcom's third-generation Tomahawk 6 "Davisson" (claiming ~3.5× better power efficiency than pluggables) began hyperscaler deployment in 2025–26.[^1]
- **Scale-up CPO** — optical I/O inside the *GPU/XPU package itself*, replacing copper NVLink-class links between accelerators. This is the segment Ayar Labs and Lightmatter actually target. It is later, larger, and harder: reliability inside a multi-kilowatt package is brutal, and the customer set is a handful of chipmakers and hyperscalers.

## Market size

LightCounting estimates optics for AI clusters (transceivers + LPO + CPO, scale-out and scale-up) reached **~\$16.5B in 2025 and will hit ~\$26B in 2026** (~60% annual growth), moderating in 2026–27 before LPO/CPO adoption in scale-up networks returns the market to double-digit growth in 2028–2030. CPO specifically is forecast around **\$10B by 2030** (Coherent's internal forecast runs to \$15B). Narrower analyst cuts of the "CPO market" (e.g., Mordor's \$165M in 2026 → \$764M by 2031) count only the optical-engine component layer — the delta between these numbers is mostly *who captures the value*, which is precisely the investment question.[^2]

## The clock: NVIDIA's roadmap sets the tempo

NVIDIA's public roadmap is the de facto adoption schedule for scale-up optics:

- **Rubin / Rubin Ultra (2026–27)** — copper NVLink *in-rack*, CPO out-of-rack for networking. Jensen Huang at GTC 2026: both copper and optical scale-up options will exist for Rubin and Feynman. The Kyber rack (NVL576) has reportedly slipped to 2028 on PCB midplane issues — evidence that copper is straining.[^3]
- **Feynman (2028)** — the optical inflection: NVLink switches with co-packaged optics, native optical NVLink domains up to NVL1152. NVIDIA networking leadership concedes that at 1,152 GPUs "it's beyond copperage."[^3]

Translation for a venture underwriter: **meaningful scale-up CPO revenue starts in 2028, ramps into 2030**. Any \$4B valuation today is a claim about 2028–2030 market share.

## NVLink Fusion: the door NVIDIA opened

In May 2025 NVIDIA opened NVLink to third parties ("NVLink Fusion") so custom XPUs and CPUs can sit in NVIDIA racks. In the first week of June 2026, **both Ayar Labs (June 2) and Lightmatter (June 3) joined the ecosystem**, making their optical engines compatible with NVIDIA SerDes and switch silicon. Lightmatter claims its bidirectional link architecture adapted for NVIDIA technology cuts fiber and connector count by ~50%.[^4]

This is double-edged. It gives the startups a sanctioned lane into the dominant rack architecture — semi-custom XPUs (Alchip, GUC, MediaTek, hyperscaler ASICs) connecting optically to NVIDIA switches. It also confirms NVIDIA controls the interface, keeps its own first-party CPO for its own silicon (built with TSMC and the optical supply chain — Lumentum, Coherent, et al.), and can commoditize the merchant layer whenever it chooses.

## Consolidation: the Celestial AI comp

The category's third horse is already sold. On December 2, 2025, **Marvell agreed to acquire Celestial AI** — whose Photonic Fabric took a memory-disaggregation angle on optical scale-up — for **\$3.25B upfront** (\$1.0B cash + 27.2M shares ≈ \$2.25B), with earnouts up to **\$5.5B total** contingent on \$500M (partial) to \$2B+ (full) *cumulative revenue by fiscal 2029*. The deal closed Q1 2026. Celestial had raised ~\$594M; its last private mark was \$2.5B (March 2025, Fidelity-led).[^5]

Three readings matter for the \$4B question:

1. **Validation** — a tier-1 semiconductor acquirer paid a real premium (1.3× the last private round, upfront) for optical scale-up IP before material revenue.
2. **A ceiling on M&A outcomes** — the observed clearing price for a credible optical-I/O startup was \$3.25B guaranteed. An investor entering Ayar or Lightmatter at \$4B is *above* that number on day one; acquisition is downside protection at roughly 0.8–1.4×, not a return scenario.
3. **A revenue yardstick** — Marvell's own earnout defines success: \$2B cumulative revenue by early 2029 is what "winning" looks like to the people with the best information.

## The incumbent squeeze

Every large player is integrating vertically rather than waiting for merchants:

- **NVIDIA** — first-party CPO switches shipping; in-house silicon photonics investment estimated in the billions; controls NVLink.
- **Broadcom** — three CPO generations shipped; owns the Ethernet switch franchise; adopted TSMC COUPE.
- **Marvell** — now owns Celestial AI; positions Photonic Fabric's thermal stability for 3D co-packaging with multi-kilowatt XPUs.
- **AMD** — acquired photonics startup Enosemi (March 2025); running **TSMC COUPE** risk production targeting 6.4 Tbps per package in high-volume runs 2H 2026 — foundry-native CPO available to every TSMC customer.[^6]
- **TSMC COUPE** — arguably the biggest structural threat to both startups: when the world's default foundry offers co-packaged optics as a standard flow, the merchant differentiation window narrows to performance, reliability, and time-to-market.

Both startups build on **GlobalFoundries Fotonix** — which makes them the flagship photonics customers of the *second* foundry, strategically useful to everyone who fears TSMC lock-in (a subtle reason Intel-, AMD-, and hyperscaler-aligned buyers keep them alive).

## What a \$4B entry must believe

1. Scale-up optics attach begins on schedule (Feynman-class systems, 2028) and merchants get a durable share of non-NVIDIA sockets.
2. At least one of the two converts NVLink Fusion membership + ASIC-partner design wins into a **named, volume anchor customer** by ~2027.
3. The winner does Celestial-earnout-class revenue (\$0.5–2B cumulative by 2029) — supporting a \$10–20B+ exit via IPO.
4. TSMC COUPE and first-party incumbent CPO leave room for a merchant layer at all.

[^1]: [Co-Packaged Optics Race: Strategic Approaches from NVIDIA and Broadcom — IDTechEx](https://www.idtechex.com/en/research-article/co-packaged-optics-race-strategic-approaches-from-nvidia-and-broadcom/34467)
[^2]: [LightCounting — Optics for AI Clusters (Jan 2026)](https://www.lightcounting.com/newsletter/en/january-2026-optics-for-ai-clusters-366); [LightCounting — \$100 Billion Market for AI Cluster Optics by 2030? (Mar 2026)](https://www.lightcounting.com/newsletter/en/march-2026-ethernet-optics-382); [LightCounting — Scale-up networks in AI Clusters (Jul 2025)](https://www.lightcounting.com/newsletter/en/july-2025-cloud-data-center-optics-330); [Co-Packaged Optics Market — Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/co-packaged-optics-market)
[^3]: [Nvidia updates data center roadmap with Rosa CPU and stacked Feynman GPUs — optical NVLink — Tom's Hardware](https://www.tomshardware.com/pc-components/gpus/nvidia-updates-data-center-roadmap-with-rosa-cpu-and-stacked-feynman-gpus-optical-nvlink-groq-lpus-with-nvfp4-and-nvlink-also-on-deck); [Nvidia embraces optical scale-up as copper reaches limits — The Register](https://www.theregister.com/on-prem/2026/04/05/nvidia-embraces-optical-scale-up-as-copper-reaches-limits/5225238); [Nvidia's Kyber rack for Rubin Ultra reportedly delayed to 2028 — Tom's Hardware](https://www.tomshardware.com/pc-components/gpus/nvidias-kyber-rack-for-rubin-ultra-slips-to-2028); [Nvidia backs copper in next-gen interconnects amid CPO push — SDxCentral](https://www.sdxcentral.com/news/nvidia-backs-copper-in-next-gen-interconnects-amid-push-into-co-packaged-optics/)
[^4]: [Ayar Labs Joins NVIDIA NVLink Fusion Ecosystem — Ayar Labs](https://ayarlabs.com/news/ayar-labs-joins-nvidia-nvlink-fusion-ecosystem-to-bring-co-packaged-optics-to-rack-scale-ai-infrastructure/); [Lightmatter Joins NVIDIA NVLink Fusion — Business Wire](https://www.businesswire.com/news/home/20260602479000/en/Lightmatter-Joins-NVIDIA-NVLink-Fusion-and-Powers-Next-Generation-AI-Infrastructure-with-Photonic-Interconnects)
[^5]: [Marvell to acquire Celestial AI for as much as \$5.5 billion — CNBC](https://www.cnbc.com/2025/12/02/mrvl-earnings-q3-2026-acquires-celestial-ai.html); [Marvell To Acquire Celestial AI In \$3.25 Billion Deal — Pulse2](https://pulse2.com/marvell-to-acquire-celestial-ai-in-3-25-billion-deal-to-accelerate-optical-scale-up-connectivity/); [Marvell looks to scale up optical links with \$5BN-plus Celestial AI deal — optics.org](https://optics.org/news/16/11/47); [Celestial AI Secures \$250 Million Funding — Business Wire](https://www.businesswire.com/news/home/20250310333743/en/Celestial-AI-Secures-$250-Million-Funding-to-Revolutionize-AI-Infrastructure-with-Its-Photonic-Fabric)
[^6]: [The Global Co-Packaged Optics Market 2026–2036 — Future Markets Inc.](https://www.futuremarketsinc.com/the-global-co-packaged-optics-market-2026-2036/); [Co-Packaged Optics (CPO) 2026-2036: Technologies, Market, and Forecasts — IDTechEx](https://www.idtechex.com/en/research-report/co-packaged-optics-cpo/1138)
