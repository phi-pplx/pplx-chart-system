# PPLX Announcement-Diagram System v0 — Tufte Audit

*Measured against the 15-principle framework distilled from Tufte, Cleveland, Bertin, Few, Cairo, Vignelli, Neurath, and Lupi.*

**Audited artifacts**
- Pipeline · Editorial · 16:9 (Bumblebee)
- Pipeline · Branded · 16:9 (Bumblebee)
- Pipeline · 1:1 stacked variants
- Timeline · Editorial · 16:9 (Comet security)
- Timeline · Branded · 1:1 (Comet security)

Grades use four levels: **Pass**, **Partial**, **Fail**, **N/A**. Honest. No grading on a curve.

---

## 1. Data-ink purity — *Partial*

> "Every visual element either encodes data/structure or is removed."
> — [Tufte, VDQI 1983](https://www.edwardtufte.com/book/the-visual-display-of-quantitative-information/)

**What's clean**
- No drop shadows, no gradients, no decorative fills
- Wires are 1.25–1.5px strokes (the minimum that survives JPEG compression)
- PPLX mark is structural (brand attribution, top-right anchor)
- Icons are 1.6px stroke single-line, no fills

**What erases**
- The horizontal track line under timeline dots is redundant data-ink (the dots themselves encode position; the line connecting them adds no information beyond proximity, which is already visible)
- The "01 ·", "02 ·", "03 ·" numbering on Pipeline column labels is decorative when the spatial order already encodes sequence
- The "kicker" line above titles ("Open source · Read only · macOS & Linux") is editorial framing, not structural — defensible for an announcement card, indefensible for a research figure

**Verdict:** Solid for a branded announcement context. **Would fail a Tufte VDQI audit** because two distinct elements are doing the same encoding job. Erase the timeline track line *or* the dots, not both.

---

## 2. Lie Factor ≈ 1.0 — *N/A (for now)*

> "Lie Factor = Size of effect shown / Size of effect in data"
> — [Tufte, VDQI 1983](https://infovis-wiki.net/wiki/Lie_Factor)

The system doesn't render quantitative data yet — Pipeline and Timeline are categorical/relational, not magnitude-based. When **Stat Hero** and **Comparison** are built, this principle becomes load-bearing. Flag for later: when a hero stat says "73.9% — 12pts above baseline", the visual representation of "12pts above baseline" must be proportional.

---

## 3. Color semantics — *Pass*

> "Color is used for exactly one of four purposes (label, measure, represent, enliven). Decorative color is eliminated."
> — [Tufte, Envisioning Information 1990](https://www.edwardtufte.com/book/envisioning-information/)

| Color | Purpose | Usage |
|---|---|---|
| Teal 300 (`#0fb5b3`) | Label | "punchline" — the one significant element per card |
| Magenta 400 (`#cd2d7d`) | Label | "warm extreme" — failures, warnings, terminal states |
| Indigo 400 (`#5b6cff`) | Label | "secondary cool" — multi-series only (not used in current renders) |
| Warm grey (`#9a8074`) | Label | neutral baseline series |
| Ink / cream | Represent | foreground / background |

Every color has a documented job. None is purely decorative. **Pass.**

---

## 4. Encoding hierarchy — *Pass with caveat*

> "Position on common scale → length → angle → area → volume → color hue"
> — [Cleveland, Elements of Graphing Data 1985](http://vis.stanford.edu/papers/banking)

- Timeline uses **position on common scale** for time (the most accurate encoding) — pass
- Pipeline uses **position** for sequence (inputs → core → outputs) — pass
- Findings card uses **color** (teal border) to encode importance — Cleveland's lowest accuracy rank

**Caveat:** Color is also doing semantic labeling work (not quantitative), so this is Bertinian-correct. But if "importance" gets confused with "magnitude" in a future archetype, the encoding breaks. Stat Hero is where this risk is highest.

---

## 5. Visual variable consistency (Bertin parallelism) — *Pass*

> "Each visual variable carries exactly one semantic meaning, applied universally."
> — [Bertin, Semiology of Graphics 1967](https://www.axismaps.com/guide/visual-variables)

Audit pass:
- Card with strong border = the system nucleus (Pipeline core, accented Timeline milestone)
- Card with soft border = neutral peer
- Mono type = utility chrome (kickers, labels, footers)
- Sans type = content (titles, body, sub-labels)
- Teal = punchline, applied identically across all archetypes

**Pass.** Visual parallelism holds across both archetypes. The grammar is internally consistent.

---

## 6. Smallest effective difference — *Partial*

> "Make all visual distinctions as subtle as possible, but still clear and effective."
> — [Tufte, Visual Explanations 1997](https://www.mediamatic.net/en/page/12619/visual-explanations)

**Where it holds**
- Card border weights: 1px neutral, 1.5px ink for accent, 1.5px teal for punchline. Calibrated to be the *minimum* that separates them.
- Color saturation differences are restrained — teal is muted (#0fb5b3 is a darker mid-teal, not a high-saturation neon)

**Where I overshot**
- The branded mode dark `#0A0A0A` vs editorial `#FBFAF4` is a maximal contrast jump for what should be the same content
- The Match warning red (`#991B1B`-ish derivative) is very saturated next to muted teal — the *visual* importance gap is larger than the *semantic* importance gap between "punchline" and "warning"

**Verdict:** Calibration needed. The warning color should be a derivative of magenta-400 at lower saturation when adjacent to the punchline teal. Currently they're competing.

---

## 7. Spatial juxtaposition — *Pass*

> "Comparable elements coexist on one surface; no comparison requires page-turning."
> — [Tufte, Beautiful Evidence 2006](https://yuriweb.com/tufte/)

The whole system is built on this. Pipeline shows inputs → core → outputs in one frame. Timeline shows all milestones in one frame. The user never needs to flip to compare. **Pass.**

The Bumblebee pipeline specifically passes Tufte's "Show comparisons, contrasts, differences" principle from Analytical Design — you can see the input feeds vs the output records on a single surface, with the scanner core mediating.

---

## 8. Typographic hierarchy — *Pass*

> "Type weight, size, and style carry semantic information, not aesthetic variety."
> — [Vignelli Canon](https://www.rit.edu/vignellicenter/sites/rit.edu.vignellicenter/files/documents/The%20Vignelli%20Canon.pdf)

Two families, six roles, mapped 1:1:

| Role | Family | Weight | Size (cqi) |
|---|---|---|---|
| Hero / display | PPLX Sans | 700 | 5.0 |
| Title | PPLX Sans | 700 | 2.4 |
| Deck / body | PPLX Sans | 400 | 1.30–1.55 |
| Label | PPLX Sans | 500 | 1.20 |
| Utility / kicker / footer | PPLX Mono | 500 | 1.05 |
| Micro / annotation | PPLX Mono | 400 | 0.92 |

No serif. Mono is utility-only. Sans is content-only. **Pass with conviction.** This is the strongest dimension of the audit.

---

## 9. Icon quantitative consistency (Neurath / Isotype) — *Pass*

> "Each symbol represents a definite quantity. Instead of one symbol of varying size, always use a number of equal-size symbols."
> — [Neurath / Isotype](https://plato.stanford.edu/entries/neurath/visual-education.html)

All icons are 18×18px or 22×22px. Single stroke weight. No size variation encodes information that isn't documented (currently no size variation at all). **Pass.**

A future risk: if Stat Hero uses icon-multipliers (5 worker icons = 5 categories), I must enforce equal size per Neurath's rule.

---

## 10. Causal directionality — *Pass*

> "Arrows and flows carry consistent directional meaning; spatial proximity implies relationship."
> — [Tufte, Visual Explanations 1997](https://www.asktog.com/books/challengerExerpt.html)

Wire styles are semantically distinct:
- **Neutral grey** = flow / data movement (most common)
- **Ink black** = privileged transmission (Computer → Bumblebee, the catalog handoff)
- **Teal** = the *punchline* path (Bumblebee → Findings)

Each style has a documented meaning that holds across the system. Arrowheads always point in the direction of flow. **Pass.**

---

## 11. Micro/macro legibility — *Partial*

> "Macro structure and micro detail coexist without one obscuring the other."
> — [Tufte, Envisioning Information 1990](https://eclass.uth.gr/modules/document/file.php/PRE_P_122/Edward%20R.%20Tufte%20Envisioning%20Information%201990.pdf)

**Macro test (full size at 1920×1080):** ✓ — Three-column rhythm reads instantly. Punchline visible without inspection.

**Micro test (zoom to 200%):** Some failures.
- The scan tile icons at 22px are legible but the labels below them ("ENDPOINT", "LOCKFILES") get close to the floor of Mono readability at 9px when the canvas is smaller (1080×1080)
- Sub-labels under nodes ("Advisories · disclosures") use the same Mono 9.5px and read fine at large sizes but stress at small canvas sizes

**The real failure:** The system uses container queries to size everything in `cqi`, which means at 540px preview (sheet) sizes, type drops below readable. This is by design — *the diagrams aren't meant to be read at 540px* — but the validator flagged this and it's a real risk if the diagrams ever get embedded at thumbnail size.

**Fix:** Set `min-font-size` floors using `clamp()`. Don't let type drop below ~10px regardless of container.

---

## 12. Grid and border weight — *Pass*

> "Gridlines and borders are lighter in value than the content they scaffold."
> — [Tufte VDQI; Few](https://analyticsdemystified.com/2008/06/19/stephen-fews-derivation-of-tufte-the-data-pixel-ratio/)

- Neutral borders: `#E5E0D2` in editorial (warm rule on cream) — significantly lighter than `#091717` ink content
- Branded borders: `#2A2A2A` — significantly lighter than `#F4F1E4` warm cream content
- Hairline rules: 1px throughout, never 2px+

**Pass.** Borders are subordinate to content in every render.

---

## 13. Full documentation — *Partial*

> "Title, data source, date, measurement scale, and authorship present and legible."
> — [Tufte, Beautiful Evidence 2006, Analytical Design Principle 5](https://www.openobjects.org.uk/2010/05/edward-tufte-on-beautiful-evidence/)

| Requirement | Status |
|---|---|
| Title | ✓ Present, large, clear |
| Kicker (context) | ✓ Present |
| Data source / URL | ✓ Footer-left (github.com/perplexityai/bumblebee) |
| Date | ✗ **Missing on Pipeline** (Timeline has dates as content, but no "published" or "as of" date on the diagram itself) |
| Measurement scale | N/A (no scales yet) |
| Authorship | ✗ **Missing** — no "by Perplexity" or version stamp |

**Fix:** Add a fine-print authorship + version line to the foot, maybe below the existing two slots. Could read: `PPLX · diagram-system v0 · 2026.05`.

---

## 14. Chart-type fitness — *Pass*

> "Diagram type matches the relationship being shown."
> — [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md)

Both archetypes match real relationships:
- **Pipeline** = "flow" in FT taxonomy. Bumblebee is a flow story (catalog → scanner → findings). Correct.
- **Timeline** = "time-series" / "chronology." Comet security is a chronological narrative. Correct.

The system anticipates the seven other FT categories: Stat Hero covers "magnitude," Comparison covers "deviation" and "ranking," Stack covers "part-to-whole," Grid covers "distribution," Decision covers conditional flow.

**Gap from the FT vocabulary:** No archetype covers "correlation" (scatter relationships) or "spatial" (maps). These are rare in Perplexity announcements but real. Flag for v0.1.

---

## 15. Multivariate completeness — *Fail*

> "Diagram encodes all variables relevant to the claim being made."
> — [Tufte, Graphical Excellence VDQI](https://g30seminar.wordpress.com/wp-content/uploads/2013/07/graphical-excellenceedward-tufte.pdf)

The brutal one.

**Bumblebee pipeline shows:** sources → assembler → scanner → outputs. Four variables: kind of input, kind of artifact, kind of scan, kind of output.

**Bumblebee's actual system has:** scan cadence (15-minute / on-demand / triggered), scan scope (baseline / project / deep), endpoint state (pending / scanning / clean / flagged), match severity (low / medium / critical), package source (npm / PyPI / cargo / etc.), MCP server registry version, and more.

I encoded ~4 variables in a system that has ~10. By Tufte's standard this is incomplete, not simplified. Compare Minard's Napoleon march: six variables in one image. My Bumblebee uses one image to show **two**: flow direction and node category.

**This is the real lesson from the audit.** Pipeline as I built it is sparse. Tufte would say "Low-information designs are suspect: what is left out, what is hidden, why are we shown so little?"

The fix isn't to make it busier — it's to layer additional dimensions onto the existing structure:
- Wire thickness could encode volume (how many records flow through this path)
- Node fill density could encode "how active" — the more activity, the warmer the fill
- The scan-tile row could become a small-multiples mini-chart showing scan frequency over time per category
- Dot pattern under outputs could encode match rate (more dots = more matches per scan)

Currently the diagram tells *one* story (the flow). Tufte demands it tell *all* the stories the data supports.

---

## Summary table

| # | Principle | Verdict |
|---|---|---|
| 1 | Data-ink purity | Partial — track line + dots is redundant encoding |
| 2 | Lie Factor | N/A — no quantitative encoding yet |
| 3 | Color semantics | **Pass** |
| 4 | Encoding hierarchy | Pass with caveat |
| 5 | Visual variable consistency | **Pass** |
| 6 | Smallest effective difference | Partial — warn red competes with punchline teal |
| 7 | Spatial juxtaposition | **Pass** |
| 8 | Typographic hierarchy | **Pass with conviction** |
| 9 | Icon quantitative consistency | **Pass** |
| 10 | Causal directionality | **Pass** |
| 11 | Micro/macro legibility | Partial — small-canvas floor missing |
| 12 | Grid and border weight | **Pass** |
| 13 | Full documentation | Partial — no date, no authorship |
| 14 | Chart-type fitness | **Pass** |
| 15 | Multivariate completeness | **Fail** — encoding 4 of 10 dimensions |

**Score:** 8 pass · 5 partial · 1 fail · 1 N/A.

---

## What this means for the build plan

The audit changes the priority order.

**Before tomorrow:**

1. **Fix #15 multivariate completeness.** This is the most consequential miss. Add layered encoding to Pipeline — wire weight = volume, node fill = activity, scan-tile sub-row = small multiples of frequency. The diagram should carry 6+ variables, not 4.

2. **Fix #6 smallest effective difference.** Recalibrate the warn color so it sits at the same visual weight as the punchline teal. Currently magenta is louder than teal, which inverts the intended hierarchy ("punchline" should pull harder than "edge case").

3. **Fix #1 data-ink purity.** Choose: timeline shows dates as dots *or* as a rail line, not both. The dots already encode position on a common scale (Cleveland's most accurate encoding). The rail line is redundant.

4. **Fix #13 documentation.** Add authorship/version stamp to the foot.

5. **Fix #11 micro/macro.** Add `clamp()` floors so type doesn't drop below ~10px regardless of container.

**Then resume archetype build:** Stat Hero next (per earlier vote), now informed by the audit. Specifically:
- Stat Hero must hit the Lie Factor principle hard — visual size proportional to claimed magnitude
- Use position on common scale, never area, for the supporting comparison stats
- Cap colors at the punchline rule (one hero stat in teal, never two)

---

## The bigger learning

The audit revealed something I hadn't noticed: **the system is well-disciplined on surface but underweight on substance**. It passes 8 of 15 Tufte principles, including the hardest ones (parallelism, typographic hierarchy, color semantics). But it fails on the most important Tufte principle — multivariate completeness — because I built layouts that hold space without carrying enough information density.

This is exactly Tufte's critique of corporate slide-deck diagrams. He'd call my v0 "well-designed but sparse." The system has the *grammar* right; it doesn't yet have enough *vocabulary*.

The fix is not more decoration. It's more data per square inch.

> "Low-information designs are suspect: what is left out, what is hidden, why are we shown so little?"
> — [Tufte, VDQI](https://faculty.cc.gatech.edu/~stasko/7450/16/Notes/tufte.pdf)
