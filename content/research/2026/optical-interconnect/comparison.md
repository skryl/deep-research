---
title: "Head-to-Head — Valuation Math & Verdict"
weight: 4
---

## Pricing basis

Both companies at **\$4B**, per the prompt. The asymmetry must be stated up front because it colors everything: **Ayar's \$4B is a ~7% premium to an observed, market-clearing price** (\$3.75B Series E, March 2026 — four months old, priced by crossover investors with data-room access). **Lightmatter's \$4B is a ~9% discount to a 20-month-old mark** (\$4.4B, October 2024) that has not been re-tested. One number is approximately *the* price; the other is a guess about what a re-pricing would produce today.

## Dimension-by-dimension

### 1. Technology & product risk

| | Ayar Labs | Lightmatter |
|---|---|---|
| Product scope | 8 Tbps UCIe optical chiplet + external laser | 114 Tbps active photonic interposer + 32/64 Tbps CPO chiplets + laser engine |
| Silicon maturity | 3rd-generation TeraPHY; ~15,000 units shipped through 2024 | M1000 available since mid-2025; L200 arriving 2026; single-digit generations |
| Integration ask on customer | Drop a UCIe chiplet at the die edge | Re-architect the package onto Lightmatter's interposer (M1000) or socket L200 |
| Hardest open problem | Volume reliability/test economics of chiplets | Thermals + yield of >4,000 mm² multi-reticle active interposer under kW-class compute |
| Laser philosophy | External SuperNova (field-replaceable) | Guide engine (higher integration) |

**Ranking: Ayar (lower risk) vs. Lightmatter (higher ceiling).** Ayar's part is simpler, older, and closer to how customers already buy chiplets. Lightmatter's M1000 is the more defensible artifact *if it yields and if customers redesign around it* — two large ifs. Note the tell: Lightmatter launched L200 to compete in Ayar's category; Ayar did not need to launch an interposer.

### 2. Go-to-market & customer path

- **Ayar**: standards route (UCIe) + ASIC-channel route (Alchip, GUC, MediaTek design wins for hyperscaler custom XPUs) + NVLink Fusion. Three independent paths, each with named partners. Strategic investors are the prospective customers.
- **Lightmatter**: direct system-level sales to hyperscalers/chipmakers + NVLink Fusion CPO/NPO. Bigger deals, fewer possible buyers, every deal bespoke.

Neither has a **named volume end customer** — the category's shared embarrassment. But Ayar's funnel has more shots on goal and shorter qualification cycles per shot. **Ranking: Ayar > Lightmatter.**

### 3. Ecosystem & cap-table gravity

- **Ayar**: NVIDIA + AMD + Intel + HPE + Lockheed + GlobalFoundries + Alchip + MediaTek across rounds — the entire buy side owns upside in Ayar's success.
- **Lightmatter**: GV/Google (strategic), T. Rowe, Fidelity (financial). Google is a genuine hyperscaler anchor-in-waiting; the absence of any chipmaker is conspicuous after nine years.

**Ranking: Ayar ≫ Lightmatter.** In semis, strategic capital is deal flow with information rights.

### 4. Timing fit to the NVIDIA clock

Scale-up optics volume begins with **Feynman-class systems in 2028** (copper carries Rubin through 2027). Design-in decisions for 2028 silicon are being made **now through 2027**. Both companies joined NVLink Fusion in the same June 2026 week — neither has an edge in sanctioned access. Ayar's UCIe part matches how 2027 tape-outs will integrate optics incrementally; Lightmatter's M1000 better matches the *following* architecture generation (2029+), with L200 as its bridge. **Ranking: Ayar for this cycle; Lightmatter for the next.**

### 5. Capital position & structure

- Both have raised ~\$850–870M total. Ayar closed \$500M in March 2026 — **fully funded through the 2028 ramp**; preference stack refreshed at \$3.75B.
- Lightmatter's \$400M is 20 months old; assuming systems-company burn (~\$150–200M/yr for 220+ heads plus multi-reticle silicon programs), it likely needs a priced event within ~12–18 months — new round, revenue, or IPO. The "last private round" framing narrows its options.

**Ranking: Ayar > Lightmatter.**

### 6. Exit paths

The **Celestial AI comp** disciplines both: Marvell paid \$3.25B upfront (up to \$5.5B on \$2B cumulative revenue by FY2029) for the #3 player, closing Q1 2026. Remaining natural acquirers: Broadcom (has its own CPO), Cisco, AMD (bought Enosemi), Intel (distressed), NVIDIA (builds in-house), Marvell (now spoken for). The acquirer list *shrank* by exactly the most eager buyer.

- At \$4B entry, an acquisition at Celestial-upfront terms returns **~0.8×**; at full-earnout terms **~1.4×**. M&A is downside protection, not a return.
- The return scenario for both is **IPO at \$12–20B+**, which requires standing on real revenue in the 2028–2030 window.

**Ranking: even — and jointly capped on the downside-exit side.**

## Valuation math at \$4B

Use Marvell's earnout as the revealed definition of success: **\$2B cumulative revenue by early 2029** is what a strategic acquirer with the best information believes a winner produces. LightCounting puts CPO at ~\$10B by 2030.

**The generic underwrite (either company):** \$4B entry → \$16B five-year target (4× gross, ~2.5–3× net of dilution and late-stage preferences) → requires ~\$1.6–2B forward revenue at a 8–10× public multiple by 2030–31 → requires ~**15–20% share of the entire CPO market** at that date, with startup gross margins, against NVIDIA, Broadcom, Marvell/Celestial, and TSMC COUPE.

That is not impossible — it is what "the merchant leader in scale-up optical attach" earns — but it prices *category leadership as the base case*. The differentiated question is which company more plausibly becomes that leader:

- **Ayar** needs its chiplet in **2–3 high-volume XPU programs** (one NVIDIA-ecosystem, one hyperscaler ASIC via Alchip/GUC/MediaTek would do it). Chiplet ASPs mean tens of millions of units — but the Series E was explicitly raised to tool for exactly that, and every prospective socket owner is on the cap table.
- **Lightmatter** needs **one to two anchor whales** to commit their package architecture to Passage (Google being the obvious candidate). Higher ASP means fewer wins needed — but each win is a bet-the-roadmap decision by the customer, and none has been announced in nine years.

### Sanity check: price per unit of observable progress

Deliberately crude: Ayar at \$4B = ~4.6× total capital raised, with 3 product generations, 15K units shipped, 8 strategic investors, and a fresh \$500M. Lightmatter at \$4B = ~4.7× capital raised, with 1.5 product generations shipped-or-sampling, 0 disclosed units, 1 strategic investor, and a 20-month-old treasury. On progress-per-dollar-of-mark, Ayar is simply cheaper.

## Scenarios (5-year, per-company)

| Scenario | Probability (Ayar / LM) | Outcome | Ayar multiple | LM multiple |
|---|---|---|---|---|
| Category leader, IPO 2028–29 | 25% / 15% | \$15–20B listing | ~3–4× net | ~3–4× net |
| Solid #2, strategic M&A | 30% / 25% | \$4–6B sale | ~1–1.3× | ~1–1.3× |
| Squeezed by COUPE/incumbents, distressed sale | 30% / 35% | \$1–2B | ~0.3–0.5× | ~0.3–0.5× |
| Technology/timing failure | 15% / 25% | <\$500M | ~0.1× | ~0.1× |

Expected value: **Ayar ~1.4–1.6×, Lightmatter ~1.1–1.3×** — both below a venture hurdle *unless* you have differentiated conviction on the leadership scenario. The probabilities differ because Ayar's failure modes are mostly *market* risks (shared), while Lightmatter stacks market risk on top of execution risk (M1000 yield/thermals) and financing risk (stale treasury).

## Verdict

**At \$4B for one check: Ayar Labs.** You pay approximately the market-clearing price for the company with the freshest balance sheet, the lowest-friction product for the 2027–28 design-in window, and a cap table in which every plausible customer is already financially aligned. Its risks are the category's risks.

**Lightmatter at \$4B is only attractive with a specific edge**: evidence that M1000 yields, that a whale (most plausibly Google) is committing, or access materially below \$4B on secondaries. Absent that, you are paying near a stale mark for higher variance. The honest framing: Lightmatter is the better *company to have built* if optical interposers become the architecture; Ayar is the better *risk-adjusted entry at this price on this date*.

**Portfolio note.** These are correlated bets — same market timing, same NVIDIA dependency, same COUPE threat. Owning both is 1.7 positions, not 2. If sizing one: Ayar. If barbelling the category: Ayar at \$4B plus a smaller Lightmatter position only at a discount to the last round — which, notably, is what \$4B already is. And the cleanest observation of all: the third company in this category already showed you the exit price, and it was below your entry.
