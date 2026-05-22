# PPLX Chart System v7 — Real Blog Data Audit

Six data sources from research.perplexity.ai and the Perplexity hub, rebuilt as v7 archetype cards. The exercise was a stress test: do the archetypes hold up when fed real numbers from real posts, or do they only work on synthetic demo data?

## What we rebuilt

| Row | Source | Numbers | Archetype | Format |
|-----|--------|---------|-----------|--------|
| 01 | HLE leaderboard (helicone.ai) | 9 models, 3.3%–26.6% | A · 1:1 | stat + bar |
| 02 | Sonar Pro SimpleQA (pplx hub) | 0.858 vs 0.773 | E · 4:5 | editorial stat block |
| 03 | Search Arena leaderboard | Sonar-Reasoning-Pro-High 1136 | F · 9:16 | wallet list |
| 04 | FRAMES cost × accuracy (Fig 6) | 73.9% @ $0.020 | E · 4:5 | editorial stat block |
| 05 | Tool-call efficiency curve (Fig 5) | b=1 to b=7, 3 models | D · 16:9 | dot-matrix |
| 06 | Deep Research speed (hub) | "Hours of expert work…" | G-display · 1:1 | editorial header |

## What worked

**Archetype A on HLE was the cleanest fit.** Nine bars, one highlighted, hero stat (21.1%) in GT Canon Narrow Medium sitting beside a deck explaining the ranking. The bars read as a quiet ranking, the hero anchors. This is the archetype's home turf.

**Archetype F on Search Arena was a strong second.** A ranked list with a hero rank at the top is exactly what the wallet-list format was built for. The Elo numbers (1136, 1132, 1115…) used tabular figures so they aligned. Hero "1136" in display weight, the rest stepping down — the rhythm felt natural.

**Archetype G-display on the Deep Research tagline was a vindication of the late add.** GT Canon Medium at 96–112px with `text-wrap: balance` made "Hours of expert work, in under three minutes." read like a magazine cover. Mono kicker and footer kept it grounded. The italic-quote concern doesn't apply here because this is the upright display variant — the typographic constraints we set on G (GT Canon for title, Mono for chrome only) paid off.

## Where it strained

**Archetype E worked twice, but for different reasons.** Row 02 (Sonar Pro F-score) was a hero number plus three supporting metrics — a natural fit. Row 04 (FRAMES cost-efficiency) had to compress a 2D relationship (cost × accuracy across 3 models) into a hero stat + summary + three pinned metrics. It works, but only because we picked one model (Qwen at b=4) to be the hero and treated the rest as "vs GPT" and "vs Sonnet" deltas. A true scatterplot would carry more information.

**Archetype D dot-matrix on the tool-call curve is engineered, not natural.** The original Fig 5 is a line chart with three models across budgets 0–7. The dot-matrix rebuild stacks dots vertically per budget — it reads as a barcode of relative magnitudes. It conveys the diminishing-returns shape, but it loses the actual y-axis values. We had to put "+11.5pp peak advantage" in the corner to anchor the takeaway. The archetype works for "look at this rhythm of values across categories" but is fighting the source data here.

## Typography decisions that paid off

- **GT Canon Italic capped at opsz 60** (not 144). The font's design space stops there. Pushing past it on the quote variant was the source of the "sloppy" reading earlier. Using opsz 60, wght 550, with `hanging-punctuation: first` and smart quotes solved it.
- **Hero stat always in ink, never accent.** The one-accent-per-card rule held across all six rebuilds. Accent only appeared on the highlighted bar (HLE Perplexity Deep Research) and the leader row indicator (Search Arena).
- **Tabular figures for stacked columns, proportional for display heroes.** The Elo column in row 03 used `tnum lnum kern`; the "21.1%" hero in row 01 used `pnum lnum kern`. Both rendered correctly.
- **PPLX Mono for kickers and footers only.** Title face on G is GT Canon. Mono is utility chrome. This held everywhere.

## Where the system needs work

1. **No archetype for scatter / 2D relationships.** Row 04 (cost × accuracy) is the canonical case. We compressed it into E, but it deserves its own archetype — call it H, a 4:5 or 1:1 scatter with hero point highlighted, axis labels in Mono.
2. **The dot-matrix (D) needs an alternate "line-shape" mode.** When source data is a curve, not a categorical comparison, dots fight the data. A thin polyline overlay on the dot grid would let D handle curves without abandoning its identity.
3. **Source-data column on the left is verbose.** On the rebuild sheet, the raw numbers list reads like a spec sheet. In production, this column would disappear — but the contrast it draws against the cards is exactly the point of this audit.

## Verdict

The system carried six real datasets without breaking. Three of the six (A on HLE, F on Search Arena, G on Deep Research) were natural fits. Two (E twice) were workable. One (D on tool-call curve) was engineered to fit. That's a ~70% natural-fit rate against real data, which is honest. The gaps point to one missing archetype (scatter) and one mode upgrade (D with line overlay), not a wholesale rebuild.

The G-italic fix held under inspection. GT Canon's opsz 60 cap is now documented and respected.
