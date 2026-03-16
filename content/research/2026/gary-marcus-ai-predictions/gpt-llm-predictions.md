---
title: "GPT and LLM Predictions"
weight: 1
---

## Core Theoretical Claims

Marcus has consistently argued since at least 2019 that current deep learning / LLM approaches have fundamental limitations that scaling alone cannot overcome.

### "Deep Learning Is Hitting a Wall" (March 2022, Nautilus)

**Source**: [Nautilus](https://nautil.us/deep-learning-is-hitting-a-wall-238440/)

Key predictions:
1. **Scaling won't solve fundamental problems** -- Scaling measures like next-word prediction is not tantamount to deep comprehension. "Scaling laws" are observations, not universal laws like gravity.
2. **Diminishing returns on larger models** -- Cited DeepMind research showing models larger than GPT-3 start to falter on toxicity, truthfulness, reasoning, and common sense.
3. **Neurosymbolic AI will be needed** -- Combining neural networks with classical symbolic techniques (rules, knowledge representations) will be required for genuine progress.

**Assessment (March 2026)**: PARTIALLY CORRECT. Multiple reports from OpenAI, Google, and others confirmed diminishing returns on pure scaling by late 2024. Sam Altman himself had stated "there is no wall" in November 2024, but subsequent reporting from The Information and others indicated Orion/GPT-5 improvements were slowing. However, techniques like chain-of-thought reasoning, tool use, and test-time compute have produced continued capability gains, suggesting the "wall" is more nuanced than a hard stop. Neurosymbolic approaches have gained interest (DeepSeek R1 uses rule-based reward systems) but pure LLM approaches remain dominant commercially.

---

## "What to Expect When You're Expecting... GPT-4" (December 25, 2022)

**Source**: [Marcus on AI Substack](https://garymarcus.substack.com/p/what-to-expect-when-youre-expecting)

At the height of ChatGPT mania, Marcus made seven "dark predictions" about GPT-4:

### The Seven Predictions

| # | Prediction | Outcome |
|---|-----------|---------|
| 1 | GPT-4 will be "a bull in a china shop, reckless and hard to control" | **CORRECT** -- GPT-4 required extensive guardrails and still produced harmful outputs |
| 2 | It will make "shake-your-head stupid errors" in unpredictable ways | **CORRECT** -- GPT-4 made numerous well-documented reasoning failures |
| 3 | It will "often do what you want, sometimes not" with no reliable way to predict which | **CORRECT** -- Inconsistency remained a defining characteristic |
| 4 | Reasoning about physical, psychological, and mathematical worlds will remain unreliable | **CORRECT** -- GPT-4 improved on benchmarks but still failed on novel reasoning tasks |
| 5 | Natural language output won't reliably integrate with downstream programs | **PARTIALLY CORRECT** -- Function calling and structured outputs improved this significantly, but reliability issues persist |
| 6 | GPT-4 won't be AGI -- can't beat Cicero at Diplomacy, drive a car, or guide Optimus | **CORRECT** -- GPT-4 was not AGI by any reasonable definition |
| 7 | It will remain a "turbocharged pastiche generator" with unsolved alignment | **DEBATABLE** -- Alignment improved with RLHF/RLAIF but remains fundamentally unsolved |

Marcus later claimed essentially all seven proved correct and "held true for every other LLM that has come since." He reused nearly every word for a subsequent essay about GPT-5, simply search-and-replacing "GPT-4" with "GPT-5."

---

## Five Predictions About OpenAI 2024-2025 (May 2024)

**Source**: [Twitter/X](https://x.com/GaryMarcus/status/1788269696690642990)

| Prediction | Outcome |
|-----------|---------|
| GPT-4 will continue to be unreliable and hallucinate | **CORRECT** -- Hallucination rates decreased but were never eliminated |
| GPT-4 will not have the imagined gigantic economic impact | **MOSTLY CORRECT** -- AI revenue grew but fell far short of the trillion-dollar projections; most companies struggled to monetize AI |
| Pure LLMs will reach a point of diminishing returns | **CORRECT** -- Confirmed by reporting from The Information about OpenAI's Orion model showing slowing improvements |
| Nothing in 2024 will be worthy of the name GPT-5 | **CORRECT** -- GPT-5 was not released in 2024; only 4.X versions (GPT-4o, GPT-4o mini) were released |
| Sora will be costly to run and too unreliable for many purposes | **CORRECT** -- Sora launched in December 2024 to underwhelming reception; quality and cost issues were widely reported |

---

## LLMs and Reasoning

Marcus has consistently argued that LLMs do not truly reason but instead perform sophisticated pattern matching. Key claims:

### Specific Failure Patterns Identified

- **Tower of Hanoi**: Apple's "GSM-Symbolic" and "Illusion of Thinking" papers confirmed that even reasoning models fail to generalize on classic logic problems beyond training distribution
- **Chess**: LLMs occasionally make illegal moves because they don't understand rules -- they mimic patterns
- **River crossing puzzles**: Any small change to setup produces nonsensical answers, as the model lacks logical deduction ability
- **Factual accuracy**: GPT-5 produced startling omissions when asked for British PMs whose names contain "R"

### The Moving Goalpost Criticism

Critics on LessWrong and elsewhere note a recurring pattern: Marcus demonstrates problems a current model can't solve, then the next model solves most of them, whereupon he finds new problems. In January 2020, he showed problems GPT-2 couldn't solve -- GPT-3 solved most. He then listed 15 problems GPT-3 couldn't solve -- GPT-4 solved most. A [Manifold prediction market](https://manifold.markets/ScottAlexander/in-2028-will-gary-marcus-still-be-a) asks whether in 2028 Marcus will still be able to find "three extremely obvious questions that an average human teenager could answer" which a leading chatbot fails.

**Assessment**: Marcus's core theoretical claim -- that LLMs are fundamentally limited in out-of-distribution generalization -- remains defensible. However, critics fairly note that the practical impact of these limitations keeps shrinking as models improve, and that tool-augmented LLM systems (agents with code interpreters, search, etc.) can solve many of the problems he highlights.

---

## "LLMs Are Not Like You and Me -- and Never Will Be"

**Source**: [Marcus on AI Substack](https://garymarcus.substack.com/p/llms-are-not-like-you-and-meand-never)

Marcus argues that LLMs traffic only in statistics of language without explicit representation of facts and explicit tools to reason over those facts. He claims there is "no principled solution to hallucinations" in such systems.

**Assessment (March 2026)**: The strong version ("never will be") remains unfalsifiable on current timelines. The weaker version -- that current LLMs lack genuine understanding -- aligns with findings from Apple's "GSM-Symbolic" paper and ongoing reliability issues. However, the boundary between "genuine understanding" and "sufficiently good pattern matching" remains philosophically contested.
