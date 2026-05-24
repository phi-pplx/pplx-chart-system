# Chart spacing audit · snippet bar + frontier line

**Date:** 2026-05-23
**Floor:** `--s-4` (20px) — anything smaller is a violation
**Scale:** `4 · 8 · 14 · 20 · 28 · 40 · 56 · 80 · 112` (`--s-1` through `--s-9`)
**Methodology:** Playwright measurement harness reads computed styles + bounding rects for every padding, margin, gap, and inter-section clearance. Each measurement is classified `on_scale`, `off_scale`, or `BELOW_FLOOR`.

---

## Headline

| Chart | Total measurements | On scale | Off scale | Below floor |
|---|---:|---:|---:|---:|
| Snippet bar (original) | 28 | 10 | 6 | **10** |
| Frontier line (original) | 21 | 9 | 4 | **7** |
| Snippet bar (fixed) | 13 | **13** | 0 | **0** |
| Frontier line (fixed) | 12 | **12** | 0 | **0** |

**17 violations across both charts before the rebuild. Zero after.**

---

## Snippet bar · violations table

| # | Location | Measured | Nearest token | Drift | Fix |
|---|---|---:|---|---:|---|
| 1 | Header · padding-bottom (rule clearance) | 18.0px | `--s-4` (20px) | −2.0 | bump to 20px |
| 2 | Section-label · margin-bottom | 10.0px | `--s-2` (8px) | +2.0 | remove margin · use frame row-gap |
| 3 | Section-label bottom → chart-wrap top | 14.0px | `--s-3` (14px) | 0.0 | replace margin chain with frame row-gap `--s-5` |
| 4 | Chart-wrap · margin-top | 4.0px | `--s-1` (4px) | 0.0 | remove · use frame row-gap |
| 5 | Value label · padding-left/right (inside bar) | 16.0px | `--s-3` (14px) | +2.0 | bump to `--s-4` (20px) |
| 6 | X-axis · margin-top | 8.0px | `--s-2` (8px) | 0.0 | remove · use chart-wrap row-gap |
| 7 | Tick offset (top:10 in CSS) | 10.0px | `--s-2` (8px) | +2.0 | bump to `--s-4` (20px) so labels clear axis line |
| 8 | X-axis bottom → xlabel top | 12.0px | `--s-3` (14px) | −2.0 | use chart-wrap row-gap `--s-4` (20px) |
| 9 | X-label · margin-top | 12.0px | `--s-3` (14px) | −2.0 | remove · use chart-wrap row-gap |
| 10 | Footer · padding-top (rule clearance) | 14.0px | `--s-3` (14px) | 0.0 | bump to `--s-4` (20px) |

**Off-scale (above floor but not on a token):** row height 160px, bar height 64px, bar inset 48px, bar-to-bar 96px, xlabel→footer 232px, footer gap 24px. Row heights are intentional data-track sizing and don't need to live on the spacing scale. Footer gap snapped to `--s-5` in the fix.

## Frontier line · violations table

| # | Location | Measured | Nearest token | Drift | Fix |
|---|---|---:|---|---:|---|
| 1 | Header · padding-bottom (rule clearance) | 18.0px | `--s-4` (20px) | −2.0 | bump to 20px |
| 2 | Title bottom → subtitle top | 8.0px | `--s-2` (8px) | 0.0 | bump to `--s-4` (20px) |
| 3 | Subtitle · margin-top | 8.0px | `--s-2` (8px) | 0.0 | bump to `--s-4` (20px) |
| 4 | X-axis tick interval | 14.0px | `--s-3` (14px) | 0.0 | tick label offset bumped 22 → 28 (`--s-5`) |
| 5 | Legend · row gap | 14.0px | `--s-3` (14px) | 0.0 | bump to `--s-4` (20px) |
| 6 | Legend item · internal gap (glyph→label) | 16.0px | `--s-3` (14px) | +2.0 | bump to `--s-4` (20px) |
| 7 | Footer · padding-top (rule clearance) | 14.0px | `--s-3` (14px) | 0.0 | bump to `--s-4` (20px) |

**Off-scale:** SVG PAD.top 50px → bumped to 56 (`--s-7`), PAD.bottom 100px → 112 (`--s-9`), Header→SVG 68.5px → handled by frame row-gap (28px) so it now reads 28px instead of a mixed margin chain.

---

## Structural fix — CSS Grid gap replaces margin chain

**Before:** every section had its own `margin-top` and `margin-bottom`. To compute the gap between two sections you had to know which margin won (collapsing margins are unreliable across nested elements). Result: 4px margin-top here, 12px margin-bottom there, the actual gap reads as some inconsistent middle ground.

**After:** the `.frame` is a `display: grid; row-gap: var(--s-5)` stack. Every inter-section gap is **one** token, applied **once**. Children have `margin: 0` and inherit their spacing from the parent grid. The chart-wrap is its own nested grid with its own `row-gap: var(--s-4)` that owns chart→xaxis→xlabel.

```css
.frame {
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  row-gap: var(--s-5);  /* 28px between all major blocks */
  padding: var(--s-6);
}

.chart-wrap {
  display: grid;
  grid-template-rows: 1fr auto auto;
  row-gap: var(--s-4);  /* 20px between chart, axis, label */
}
```

This pattern matches what the Schema diagram archetype now uses for its hub-and-spokes 3×3 grid — the grid gap IS the spacing contract, with no margin math to debug.

---

## Files

| File | Purpose |
|---|---|
| `snippet-bar.json` | Full measurement output, per-row classification |
| `frontier-line.json` | Same for frontier chart |
| `snippet-bar.annotated.png` | Red-lined original showing all 10 snippet violations |
| `frontier-line.annotated.png` | Red-lined original showing all 7 frontier violations |
| `01-snippet-bar.fixed.html` | Corrected snippet bar (grid-stack rebuild) |
| `02-frontier-line.fixed.html` | Corrected frontier line (grid-stack rebuild) |
| `01-snippet-bar.fixed.png` | Rendered output of the corrected snippet bar |
| `02-frontier-line.fixed.png` | Rendered output of the corrected frontier line |
| `measure.cjs` | Reusable measurement harness — point at any chart |
| `verify_fixed.cjs` | Re-runs the audit against the fixed files |

---

## Recommendation

1. **Promote the grid-stack pattern to chart-base.css.** Bake `.frame { display: grid; row-gap: var(--s-5) }` and `.chart-wrap { display: grid; row-gap: var(--s-4) }` into the shared base file so every chart in the system inherits the same spacing skeleton. Strip the per-section `margin-top` / `margin-bottom` rules.
2. **Make `--s-4` enforceable.** Any computed gap smaller than 20px should be CI-flagged by running `measure.cjs` against every chart on push.
3. **The SVG `PAD` constants should also be snapped to the spacing scale.** Inner padding of the data area was off-scale (50, 100). Lifting to 56 and 112 fixes it and keeps the chart system internally consistent.
