# PPLX Chart System v7 — Two-Track Spec

Same data, two surfaces, different jobs. The v7 system now publishes in two distinct treatments from one shared token set.

## The split

|  | Research blog | Social |
|---|---|---|
| **Job** | Document the result. Every value defensible. | Carry the takeaway. One number leads. |
| **Surface** | Dark panel, inline at 740px wide | Dark card, full-bleed at 1080–1920px |
| **Anchor** | Axes, gridlines, ticks | Hero stat in GT Canon Narrow |
| **Hierarchy** | Title → subplot title → axes → series | Kicker → title → hero → deck → support |
| **Color** | Single accent on data (teal), or 2–3 differentiated series for line charts | Single accent, hero in ink |
| **Typography** | PPLX Mono for titles and axis micro-labels, PPLX Sans for tick numbers | GT Canon Narrow for hero, PPLX Mono for chrome, PPLX Sans for deck |
| **Density** | High. Subplots can stack 2x2. | Low. One idea per card. |
| **Reading distance** | Inline body copy, ~14" laptop | Thumb-scale, mobile feed |
| **Order** | Canonical (rank, time, value) | Narrative (hero first, then context) |

## Shared tokens

Both variants pull from the same v7 token set. The split is in treatment, not in color or type:

- **Paper**: `--paper-dark: #0a0b0c` for both. (Light variants for both exist too.)
- **Accent**: `--teal: #0fb5b3`. One accent per chart, applied to the row/point of interest.
- **Hairlines**: `--hairline-dark: rgba(255,255,255,0.10)`.
- **Gridlines**: `--grid-dark: rgba(255,255,255,0.06)`. Lighter than hairlines.
- **Type**: GT Canon (display + italic), PPLX Sans, PPLX Mono.
- **Spacing**: 4, 8, 14, 20, 28, 40, 56, 80, 112.
- **PPLX 2026 mark**: 18×18 on research, 36×36 on social. Always top-right.

## Decision tree — which variant when

```
Is this for a research.perplexity.ai post, a paper, or a technical doc?
├─ YES → use the research variant
│        - put it inline at 740–1244px wide
│        - use the full axis-led readout
│        - subplots can stack 2x2 if you have multiple metrics
│
└─ NO → is it for social, the hub, or a marketing surface?
         ├─ YES → use the social variant
         │        - pick the format from the existing archetypes (A/B/C/D/E/F/G)
         │        - one hero stat, supporting motif, footer triad
         │        - 1:1, 4:5, 9:16, or 16:9 depending on platform
         │
         └─ MIXED (e.g. hub post that's data-heavy) →
                   - lead the post with one social card as the hero
                   - inline research-variant charts in the body
                   - never mix the two styles within the same chart
```

## Per-row mapping (the comparison sheet)

| # | Data | Research treatment | Social treatment |
|---|---|---|---|
| 01 | HLE 9-model leaderboard | Vertical bars, y-axis 0–30%, all 9 labels | Archetype A 1:1 — hero "21.1%", 9-bar motif below |
| 02 | Search Arena Elo top 5 | Ranked lollipop, hairline bar fills | Archetype F 9:16 wallet list — Sonar promoted to top |
| 03 | Cost × accuracy at b=4 | True 2D scatter, log-x, three labeled points | Archetype E 4:5 — hero "73.9%", footer triad (cost / vs GPT / vs Sonnet) |
| 04 | Tool-call efficiency curves | Multi-line plot, 3 series, endpoint labels right | Archetype D 16:9 — hero "+11.5pp", 7-cell budget strip |

## What this resolves

The earlier audit said the chart system was missing a scatter archetype and that the dot-matrix was strained when fed curve data. **Both gaps disappear once we split into two tracks.** The research variant carries 2D scatter and true line charts natively — those are blog-native shapes. The social variant gets to stay editorial: hero-led, archetype-driven, never trying to encode all the information at once.

The strain came from asking one chart type to do two jobs. It doesn't have to.

## Files

- **`pplx-chart-system/05_social/v7-two-track.html`** — comparison sheet source
- **`v7-two-track-01.jpg` / `v7-two-track-02.jpg`** — rendered comparison
- **`pplx-chart-system/research-blog-refs/`** — downloaded reference figures from research.perplexity.ai for the style match

## Next moves

1. Extract the research-variant CSS into its own token bundle and document the SVG construction pattern.
2. Build a research-variant template that takes data + title + caption and emits the SVG card.
3. Decide if landing page should host both tracks as separate sections, or split into two landing pages.
