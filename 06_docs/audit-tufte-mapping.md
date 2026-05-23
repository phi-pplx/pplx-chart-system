# Tufte Research → System Decisions

Where every Tufte principle from the canon research landed in the diagram + chart systems.

The research brief is in [`tufte-visual-design-audit-framework.pplx.md`](../tufte-visual-design-audit-framework.pplx.md). It distilled 15 principles from Tufte's four books plus the surrounding canon (Cleveland, Bertin, Few, Cairo, Vignelli, Neurath, Lupi, FT Visual Vocabulary). This doc traces which decisions in the actual code came from which principle.

---

## Direct citations in the work

### Tufte VDQI 1983

**"Above all else, show the data."**
- Drove the multivariate-completeness fix to Pipeline v0.1. v0 encoded 4 dimensions in Bumblebee; the audit grade was *fail* because Tufte's first principle is information density. Fix added wire weight (throughput), activity sparklines on nodes (7-day stats), and tile counts (8,412 / 2,107 / 914 / 3,260 / 14 — real numbers per category). Now encoding 6+ dimensions.
- Triggered the snippet bar critique I flagged at the end: 5-step color ramp encoding magnitude is double-coding when bar length already encodes magnitude. A stricter version would collapse to neutral bars + one accent.

**"Erase redundant data-ink, within reason."**
- Drove the Timeline horizontal-track removal. v0 had both dots *and* a connecting line under the dots — same encoding twice. Cleveland #1 (position on common scale) was already carrying time; the rail was redundant. v0.1: kept dots, killed the rail line.

**Lie Factor**
> Lie Factor = Size of effect shown / Size of effect in data. Tolerable range 0.95–1.05.

- Hard constraint on Comparison archetype. Bar widths are `(value − scaleMin) / (scaleMax − scaleMin)`, so the ratio in the data equals the ratio in the visual. Sonar 53.4 → 71.2% of bar; o3 12.6 → 16.8%. Ratio in data = 4.24, ratio in visual = 4.24. Lie Factor = 1.0.
- Same rule applied to Stat Hero support bars. Bar lengths are exactly `value / max`. 11/3 = 3.67 in the data; bar widths in the visual carry the same ratio.

**Chartjunk taxonomy**
- "Moiré vibration" → never used hatching or cross-hatching in the system.
- "The grid" → grid lines are 1px `--rule` at the *lowest* visual weight, lighter than content. Never compete with data.
- "The duck" → no decorative containers. Every card frame earns its border by separating content from background; nothing exists for its own visual sake.

**Data density**
> "Low-information designs are suspect."

- This was the most painful sentence in the audit. v0 of the Pipeline was sparse — it looked clean because it was empty. Drove the v0.1 push to add real data (counts, sparklines, weighted wires) instead of just structural shapes.

**Small multiples**
- The scan-tile row in Pipeline is the small-multiples treatment: same icon-size + label + count format applied to 5 categories (Endpoint / Lockfiles / MCP configs / Extensions / Match). Per Tufte: "the design remains fixed while only the data varies."
- Tiles use Neurath's rule too — equal-size symbols, varying counts. Not one tile sized 4× to mean 4× the count.

---

### Tufte Envisioning Information 1990

**Color: the four uses**
> Label · measure · represent · enliven (never decorate).

- Drove the entire color audit. Each color in the Comet palette got *one* documented job:
  - Teal 300 = punchline (label)
  - Magenta 400 = warm extreme / warning (label)
  - Indigo 400 = secondary cool series (label)
  - Warm grey = neutral baseline (represent)
- No color is "decorative." When you see teal in the system, it's always pointing at the *one* most important element on the surface.

**Smallest effective difference**
- Drove the Magenta calibration fix. v0 used Magenta 400 (fully saturated) next to Teal 300. Magenta out-pulled teal because at equal area, saturated magenta has more perceptual weight than mid-saturation teal. The "warning" was visually louder than the "punchline" — wrong hierarchy.
- Fix: introduced Magenta 200 (`#c97a9e`) for warn-borders at perceptual parity with teal-300. The bright Magenta 400 stays available for fills where it isn't directly adjacent to teal.

**Micro/macro readings**
- Drove the `clamp()` floor decision in v0.1. Diagrams must read both at full size (1920×1080 wall display) *and* at thumbnail size (540px embedded). Type tokens now use `clamp(min, cqi, max)` so they scale with container but never collapse below 9px.

---

### Tufte Visual Explanations 1997

**Parallelism**
- The whole v0.1 cross-archetype audit was built on this. Same visual encoding must carry same meaning across archetypes.
- Teal = punchline in Pipeline (Findings), Timeline (Dec 2025 BrowseSafe), Stat Hero (Defense layers · 4), Comparison (Sonar Reasoning Pro). Same color, same role, every time.

---

### Tufte Beautiful Evidence 2006

**Six principles of analytical design** (from the book's closing chapter):
1. Show comparisons
2. Show causality, mechanism, structure
3. Show multivariate data
4. Integrate text, numbers, graphics
5. Document the evidence
6. Quality, relevance, integrity of content

These mapped 1-to-1:

- **#1 Comparisons** → built the Comparison archetype specifically to honor this. Spatial juxtaposition of all 6 models on one surface, sorted, CI-bounded.
- **#2 Causality** → Pipeline wire styles (neutral / ink / teal) encode flow direction and significance. The "PR" pill on Computer + the dark ink wire into Bumblebee carries the causal chain explicitly.
- **#3 Multivariate** → tiles, sparklines, wire weights, deltas, CIs — every archetype now layers 5+ dimensions.
- **#4 Integrate** → Stat Hero specifically: hero number is words+numbers+graphics in one unified surface. Comparison: bars + values + deltas + categories integrated per row.
- **#5 Document** → the v0.1 authorship stamp: `PPLX · diagram-system v0.1 · {archetype} · 2026.05` at every foot. Every diagram signs itself, identifies source URL, dates itself.
- **#6 Integrity** → Lie Factor = 1.0 across all quantitative archetypes. Real benchmark numbers, real BrowseComp data, real Bumblebee scan counts. Nothing invented for visual effect.

**Sparklines**
> "Data-intense, design-simple, word-sized graphics."

- The 7-day activity strips under Pipeline nodes are literal sparklines, sized to fit at the bottom edge of each card. 7 bars showing recent activity, one optionally tagged as "peak."

---

## Surrounding canon

### Cleveland 1985 — perceptual hierarchy

> Position on common scale → length → angle → area → volume → color hue.

- **Drove the Comparison archetype's entire design.** Bars use position on common scale (most accurate). Never used pies, bubbles, area-encoded anything.
- **Drove Stat Hero's supporting bars** — also position on common scale. Never used radial / circular encoding for the magnitudes.
- The Pipeline wire weights are an honest application of "length perpendicular." Cleveland's hierarchy rates this lower than length, but acceptable when the magnitude is secondary to the categorical encoding (which it is — flow direction is the primary signal; throughput is the secondary layer).

### Bertin 1967 — visual variables

> Each visual variable carries exactly one semantic meaning, applied universally.

- Drove the "visual variable consistency" principle that came up at every audit pass. In the system:
  - Card border weight 1.5px = "system nucleus" (Pipeline core, accented Timeline milestone)
  - Bar fill color = series category
  - Position = score / time
  - Mono = utility chrome only; Sans = body; Canon = headline
- Each variable carries one job. No double-duty.

### Stephen Few — Show Me the Numbers

- Bullet graphs informed the Comparison archetype's CI rendering. Each bar has thin range markers (the 95% CI bracket), riding on the same scale as the value bar.
- Few's "data-pixel ratio" critique informed the decision to keep neutral/warm-grey baseline bars (warm grey #d4cdc1) muted enough that they don't compete with the accent — exactly Few's "dim the unimportant" rule.

### Alberto Cairo — five qualities

> Truthful, functional, beautiful, insightful, enlightening.

- Drove the "honest" critique I added at the end of every audit — flagging the snippet bar's double-encoding even though the user didn't ask. Cairo's "truthful" is the meta-principle: design decisions must be defensible against their own internal logic.

### Vignelli Canon

- Drove the typographic discipline. Two families (Sans + Mono) doing structural work. No serif in utility/tool UIs (except editorial, and only via GT Canon for headlines). Type weight encodes role, never aesthetics.

### Otto Neurath / Isotype

> Equal-size symbols carrying definite quantities.

- Drove the scan-tile count badges in Pipeline. Icon size is constant; the number changes. Not "make the bigger category have a bigger icon."

### FT Visual Vocabulary

> Match diagram type to relationship being shown.

- Drove the seven-archetype scope (Pipeline / Timeline / Stat Hero / Comparison / Stack / Grid / Decision). Each archetype maps to one FT category:
  - P → Flow
  - T → Chronology
  - H → Magnitude
  - C → Deviation / Ranking
  - S → Part-to-whole
  - G → Distribution
  - D → Conditional flow

### Minard / Nightingale / Snow

- The "Minard six variables in one image" benchmark is what made me grade Pipeline v0 as a *fail* on multivariate completeness. Minard's Napoleon march carries direction, troop size, location (2D), temperature, and time — six dimensions. v0 of Pipeline carried 4. The bar to clear isn't "more than other corporate diagrams"; it's Minard.

### Lupi / Posavec — counterargument

The research brief flagged Tufte vs Lupi as a real controversy: Tufte's austerity vs. data humanism's warmth and personality. The system has explicitly chosen Tufte's side. The "branded" mode adds *visual presence* (dark canvas, larger hero), not *decorative warmth*. The system doesn't pretend Lupi's argument doesn't exist — it just makes a defensible choice for an *announcement-diagram* context (technical, audience-facing) where Lupi's tradeoffs aren't right.

---

## What the research told me NOT to do

These came from the research and influenced *exclusions* rather than inclusions:

- **No quadrant / 2×2 archetype.** Tufte's evidence is that this format almost always lies — the implicit assumption of equal axes is rarely earned. Plus the FT vocabulary research confirmed it's rare in Perplexity announcements.
- **No sequence/UML diagrams.** They're syntax-heavy and don't fit the Perplexity voice. Pipeline does the same job cleaner.
- **No 3D / isometric anything.** Tufte spends pages of VDQI on 3D bar charts as Lie-Factor generators. Hard out.
- **No glassmorphism / decorative shadows / gradients-for-fun.** Chartjunk by Tufte's definition. The locked user rule already aligned here.

---

## The 14-criterion audit framework

The research distilled to a 14-criterion checklist that every archetype is graded against. I added a 15th (Multivariate completeness — the Minard test) and a 16th (WCAG AA contrast — implicit in Tufte's legibility insistence but worth making explicit). Full version is in [`audit-tufte-v0_1.md`](audit-tufte-v0_1.md).

Current scores:

| Archetype | Score |
|---|---|
| Pipeline | 14 pass · 1 N/A · 0 partial · 0 fail |
| Timeline | 14 pass · 1 N/A · 0 partial · 0 fail |
| Stat Hero | 14 pass · 1 N/A · 0 partial · 0 fail |
| Comparison | 14 pass · 2 N/A · 0 partial · 0 fail |

(N/As are principles that don't apply to a given archetype — e.g. Lie Factor is N/A for Pipeline because it's not encoding magnitudes; Causal Directionality is N/A for Comparison because there are no wires.)

---

## Bottom line

The research wasn't an exercise. It became the spine of every decision since. The audit document is the rubric, and the system passes it now because we did the audit and the rebuild instead of just trusting the first design.
