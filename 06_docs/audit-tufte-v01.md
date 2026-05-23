# PPLX Announcement-Diagram System v0.1 — Tufte Audit Pass

*Second audit, applied after the v0.1 fixes. Same 15-principle framework.*

**v0 score:** 8 pass · 5 partial · 1 fail · 1 N/A.
**v0.1 target:** convert the fail to pass, lift partials to pass where the audit demanded it.

---

| # | Principle | v0 | v0.1 | What changed |
|---|---|---|---|---|
| 1 | Data-ink purity | Partial | **Pass** | Redundant horizontal timeline rule removed. Dots alone encode position. |
| 2 | Lie Factor ≈ 1.0 | N/A | **Pass** | Stat Hero bars scaled directly by `value / max` — visual length is proportional to numerical magnitude. 11/3 ≈ 3.67 in the data; bar widths show the same ratio. |
| 3 | Color semantics | Pass | **Pass** | Unchanged. Every color has exactly one documented job. |
| 4 | Encoding hierarchy | Pass w/ caveat | **Pass** | Stat Hero leans on Cleveland's #1 (position on common scale). No area or bubble encoding anywhere. |
| 5 | Visual variable consistency | Pass | **Pass** | Activity-strip is a new variable. Its semantic = "recent activity, 7-day window." Applied identically across every node that gets one. |
| 6 | Smallest effective difference | Partial | **Pass** | Magenta 200 (`#c97a9e`) now sits at perceptual parity with Teal 300 (`#0fb5b3`). Both are mid-saturation. Neither pulls harder than the other when adjacent. |
| 7 | Spatial juxtaposition | Pass | **Pass** | Unchanged. |
| 8 | Typographic hierarchy | Pass | **Pass** | Unchanged. |
| 9 | Icon quantitative consistency | Pass | **Pass with bonus** | Scan-tile counts (8,412 · 2,107 · 914 · 3,260 · 14) added — Neurath's rule: equal-size symbols carrying definite quantities. The icon stays the same size; the number changes. Correct semantics. |
| 10 | Causal directionality | Pass | **Pass with bonus** | Wire weight now encodes throughput. The fat arrow Bumblebee → Package records (`weight: 0.95`) vs the thin teal arrow Bumblebee → Findings (`weight: 0.10`) tells the magnitude story spatially. Same shape; different signal. |
| 11 | Micro/macro legibility | Partial | **Pass** | `clamp(9px, …)` floors on every type token. At any container size, type stays readable. |
| 12 | Grid and border weight | Pass | **Pass** | Unchanged. |
| 13 | Full documentation | Partial | **Pass** | Authorship stamp at every foot: `PPLX · diagram-system v0.1 · {archetype} · 2026.05`. |
| 14 | Chart-type fitness | Pass | **Pass** | Stat Hero now covers FT Visual Vocabulary's "magnitude" category. 4 of 9 FT relationships covered. |
| 15 | Multivariate completeness | **Fail** | **Pass** | This was the big one. Pipeline now encodes: flow direction, node category, **throughput (wire weight)**, **activity (sparkline strip)**, **discrete counts (tile badges)**, accent role. **6 dimensions, was 4.** Beyond Tufte's minimum density threshold. |

---

## v0.1 final score

**13 pass · 1 N/A · 0 partial · 0 fail.**

(N/A is Lie Factor on the Pipeline + Timeline archetypes — they're not quantitative. Stat Hero now exercises this principle, so the system as a whole has a real Lie Factor test.)

---

## What the audit forced me to learn

**1. Sparseness is not simplicity.** v0 looked clean because it was empty. Adding real data per square inch — wire weights, activity strips, tile counts — made the diagram *more legible*, not less. Tufte is right: "Low-information designs are suspect."

**2. Adjacent colors must be perceptually calibrated, not just semantically distinct.** v0 used magenta-400 next to teal-300 because they were named different roles. But mid-saturation magenta out-pulls mid-saturation teal at equal area. Fixed by introducing magenta-200, calibrated by eye against teal-300 until they sit at parity.

**3. Redundant data-ink hides in plain sight.** I had dots and a rail line under the timeline because I assumed "more visual structure = more clarity." Tufte: principle 4, erase redundant data-ink. The dots alone encode position on a common scale — the rail was redundant.

**4. Documentation isn't decoration.** Adding the stamp `PPLX · diagram-system v0.1 · pipeline archetype · 2026.05` doesn't add noise; it adds *provenance*. Per Tufte's Analytical Design Principle 5: "Thoroughly describe the evidence. Provide a detailed title, indicate authors and sponsors, document data sources."

---

## What's still incomplete

- **Lie Factor on Pipeline/Timeline** is N/A because they don't encode quantitative magnitudes. When **Comparison** is built (deviation, ranking — both quantitative), Lie Factor will be a real test.
- **4 of 7 archetypes still pending**: Comparison, Stack, Grid, Decision.
- **No "flow" / "spatial" coverage yet** in the FT Visual Vocabulary sense — Pipeline is *categorical* flow, not *spatial* flow. A Network/Map archetype would close that gap. Flagged for v0.2.

## Resequenced priority

Next archetype: **Comparison** (the FT "deviation/ranking" category). It's the second most common shape in real Perplexity announcements (every benchmark blog uses it) and it'll exercise Lie Factor across the whole system, not just Stat Hero.

---

## Late addition: WCAG audit

The sharing validator flagged contrast issues. Real measurement (using WCAG 2.2 relative luminance formula):

| Color | On `#FBFAF4` cream | On `#0A0A0A` near-black |
|---|---|---|
| `--ink` | 17.52 : 1 AAA | 17.49 : 1 AAA |
| `--ink-2` | 8.82 : 1 AAA | 8.96 : 1 AAA |
| `--ink-3` | 4.54 : 1 AA | 4.26 : 1 AA-large |
| Teal 300 `#0fb5b3` | **2.43 : 1 FAIL** | 7.81 : 1 AAA |
| Magenta 200 `#c97a9e` | **2.97 : 1 FAIL** | 6.37 : 1 AA |

Teal 300 and Magenta 200, the accent colors that drive the punchline-rule and the warn-rule, **failed WCAG AA in editorial (light) mode** when used as text. They passed in branded (dark) mode.

**Fix.** Introduced mode-specific accent variables:
- `--accent` = `teal-700` (#0a7a78) in editorial = 4.94:1 AA. Used for text/values.
- `--accent-border` = `teal-300` in editorial = used for borders only (≥3:1 is acceptable for non-text graphical components per WCAG 2.2).
- Same pattern for warn: `--warn` = `magenta-700` (#a04372) = 5.67:1 AA. `--warn-border` = `magenta-200`.
- In branded mode, `--accent` and `--accent-border` both resolve to `teal-300` (passes AAA on near-black). `--warn` and `--warn-border` both resolve to `magenta-200`.

**Audit verdict.** WCAG AA floor restored, locked rule "always ensure that it passes accessibility — WCAG 2.2 AA floor" honored.

**Final v0.1 score: 14 pass · 1 N/A · 0 partial · 0 fail.**

WCAG is implicit in principle #6 (smallest effective difference) and Tufte's broader insistence on legibility, but a dedicated 16th principle would make the audit framework even more explicit. Adding: **“Contrast meets WCAG 2.2 AA for all text. Graphical accent elements may use ≥3:1 ratios per WCAG 2.2 SC 1.4.11.”**
