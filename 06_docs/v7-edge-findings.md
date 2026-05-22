# Layout balancer · edge case findings

**Tested:** v7 balancer, three knobs (`--fit-hero-scale`, `--fit-row-pad`, `--fit-section-gap`), CCR-based 5-regime classifier.
**Proof sheet:** `v7-edge-cases.html` / `v7-edge-cases.jpg`.

## TL;DR

The three-knob contract holds for the F-card it was designed against. It **fails silently** on three classes of input where the contract's assumptions are violated:

1. **Horizontal failures are invisible.** CCR only measures vertical content density. Long category labels, wide titles, oversize unit glyphs — none of these change CCR. The balancer reports `anchor` (fits comfortably) while the card has horizontal collisions, clipping, or unreadable overlap.
2. **DOM height ≠ visual density.** Two B-cards with identical markup but different pin heights have identical CCR and identical strategy, yet vastly different visual emptiness. The balancer can't see what's effectively whitespace inside an SVG.
3. **The three knobs assume a fixed archetype skeleton.** They scale a hero, list rows, and section gaps. On archetypes without those structures (header-only, chart-dominant, foot-dominant), the knobs are no-ops or apply to the wrong elements.

These aren't bugs in `fit.js`. They are limits of the diagnostic. The CCR metric is **one-dimensional** and the knobs are **archetype-coupled**. A complete solution would add a second dimension (horizontal pressure / visual density) and unbind the knobs from archetype assumptions.

---

## Edge 01 · A-card · long category labels

**Setup:** Same A-card (1080×1080, stat + bar chart, 7 categories). Vary only the category label string.

| Variant | Label sample | CCR | Strategy | Visual result |
|---|---|---|---|---|
| short | `1.5K` | 0.89 | `anchor` | Clean. As designed. |
| medium | `1.5K-tok` | 0.89 | `anchor` | Mild overlap at edges. Still readable. |
| long | `1.5K-tok budget` | 0.89 | `anchor` | Labels collide between adjacent bars. |
| extreme | `Compressed reasoning at 1.5K-tok budget` | 0.89 | `anchor` | Labels merge into an illegible smear. |

### Failure characterization

- **Failure mode:** silent. Balancer reports the highest-confidence fit (`anchor`) for every variant because vertical content height is unchanged.
- **Visual artifact:** SVG `<text>` with `text-anchor="middle"` and no clip-path keeps drawing past adjacent labels. By "extreme" the bottom of the chart is an unreadable text salad.
- **Why the contract can't catch it:** CCR is a vertical-axis-only diagnostic. The knobs (`hero-scale`, `row-pad`, `section-gap`) all operate on vertical proportions. There's no horizontal pressure variable, so there's nothing to detect or adjust.
- **What the balancer would have to know:** measured text width per label / available column width per bar. If `label_width > 0.85 × column_width`, the label needs rotation, truncation, or a different layout.

### Mitigation paths (not implemented; ranked by cost)

1. **CSS-only**, low cost: use `<foreignObject>` with HTML labels and `text-overflow: ellipsis`. Truncates instead of overlapping. Loses information, but fails gracefully.
2. **Geometric**, medium cost: rotate labels 45° when count > 5 and any label exceeds a width threshold. Common chart-library behavior. Compromises mobile/thumbnail legibility.
3. **Content-aware**, high cost: extend the balancer with a `--fit-horizontal-pressure` axis. Measure each label's natural width; if any exceeds its column, trigger label rotation, abbreviation, or category aggregation. Requires per-archetype label-handling specs.

**Recommendation:** Add a horizontal-pressure check to `fit.js` that doesn't change strategy but emits a `data-fit-horizontal="overflow"` attribute. CSS can respond by switching to rotated or abbreviated labels. This separates the new dimension from the existing 5-regime contract.

---

## Edge 02 · B-card · sparse pin distribution

**Setup:** Same B-card (1080×1080, pin spike + hero). Vary the number of pins with non-trivial data.

| Variant | Active pins | CCR | Strategy | Visual result |
|---|---|---|---|---|
| dense | 50 | 0.62 | `distribute` | As designed. Hero peak, surrounding distribution. |
| clustered | 10 | 0.62 | `distribute` | Mid void in chart area; peak still anchors. |
| sparse | 3 | 0.62 | `distribute` | Large void around peak. Card feels under-filled. |
| lone | 1 | 0.62 | `distribute` | Single peak in vast empty band. Card is mostly hero. |

### Failure characterization

- **Failure mode:** worse than silent — the balancer applies `distribute` with `--fit-hero-scale: 1.08`, GROWING the hero on cards where the chart is increasingly empty. This is the opposite of what we want.
- **Visual artifact:** the lone-peak card has the hero at +8% size dominating a near-empty chart, making the card feel both over-loud (hero) and under-filled (chart) simultaneously.
- **Why the contract can't catch it:** DOM `scrollHeight` doesn't know about visual content density inside an SVG. 50 pins at 100% height and 50 pins at 1% height have the same DOM height (the SVG itself), so the same CCR.
- **What the balancer would have to know:** painted pixel density. Or, application-specific: sum of pin heights / theoretical max sum.

### Mitigation paths

1. **Content-density measurement**, low cost: have the SVG report its "filled area" via a custom CSS variable or data attribute set by the data-rendering code. `data-density="0.18"` on `.b-pins` would let fit.js read it and incorporate into CCR.
2. **Archetype-specific override**, medium cost: define per-archetype CCR adjusters. B-card multiplies CCR by `(actual_pin_density / expected_pin_density)` before classification.
3. **Visual-pixel-density measurement**, high cost: rasterize and measure painted area. Not feasible at runtime.

**Recommendation:** option 1. The chart-data code already knows the density. Have it emit `data-fit-density` on the relevant content block, and have fit.js multiply CCR by that ratio when present. Backwards-compatible (default density = 1).

---

## Edge 03 · header-only card · degenerate archetype

**Setup:** A 1:1 card with kicker, title, deck. No hero stat, no list, no chart. Title length varies.

| Variant | Title words | CCR | Strategy | Visual result |
|---|---|---|---|---|
| minimal | 3 | 0.35 | `amplify` | Title grows (because t-title was wired to hero-scale). Void below. |
| typical | 8 | 0.45 | `distribute` | Title slightly larger. Less void. |
| long | 16 | 0.61 | `distribute` | Title fills upper half. Void below. |
| extreme | 32 | 0.86 | `anchor` | Title fills frame. No adjustment needed. |

### Failure characterization

- **Failure mode:** strategy is misaligned with archetype. The knobs were defined for cards with a hero + list. On header-only cards:
  - `--fit-hero-scale` has no hero to scale (in this test I wired `t-title` to it as a substitute, which is **not** how the contract is documented to behave).
  - `--fit-row-pad` has no rows.
  - `--fit-section-gap` is meaningful, but on a 3-row grid (head / body / foot) widening the gap pushes empty space wider, not better.
- **Visual artifact:** void in the middle of the card regardless of strategy. The balancer can't fix structural emptiness by scaling typography.
- **Why the contract can't catch it:** the knobs assume a hero exists, a list exists, sections need balancing. On a card whose only content is in the head, the knobs map to nothing or apply to the wrong element.

### Mitigation paths

1. **Per-archetype knob bindings**, low cost: each archetype declares which knobs apply. Header-only cards would bind hero-scale to title size only and section-gap to a flex/grid `gap` they actually use. Make it explicit and documented.
2. **A fourth knob**, medium cost: `--fit-body-fill` for archetypes where the middle block should expand to fill (e.g. with rule lines, watermark, divider art, or a deliberate negative-space treatment).
3. **Archetype validation**, low cost but breaking: the balancer warns when a card has no `[data-fit-content]` blocks of certain types (no hero, no list). Logs to console; ignores the knob in question.

**Recommendation:** option 1 plus 3. Each archetype documents which knobs it consumes. fit.js detects and warns when a card is missing the structures its strategy expects. Don't apply a strategy if the archetype contract isn't satisfied — fall back to `anchor` with a warning.

---

## Cross-cutting findings

### What the balancer gets right
- Five regimes maps to a real-world content variance. The boundaries (0.40, 0.70, 0.95, 1.05) match where visual perception of "too sparse" and "too dense" actually shift.
- The CSS-variable contract is good. Decoupling JS strategy from CSS look is the right architecture.
- The clone-and-measure approach correctly reads natural content height despite locked grid tracks.

### What the balancer gets wrong

| Limit | Symptom | Root cause |
|---|---|---|
| 1D diagnostic | Long horizontal labels overlap silently | CCR is vertical-only |
| DOM-height proxy | Sparse charts get same strategy as dense charts | scrollHeight ≠ visual density |
| Archetype-coupled knobs | Strategies apply to structures that may not exist | Knob targets are baked into knob names |
| No knob targeting | All knobs apply to all cards, even when irrelevant | No archetype → knob mapping |
| No warning | Silent failures look identical to correct fits | Strategies always succeed |

### Hierarchy of fixes (smallest contract change first)

1. **Add a fit-horizontal-pressure data attribute** (no CCR change, no new strategy). CSS responds when set.
2. **Add a fit-density input from the data layer**. `data-fit-density` multiplies CCR. Backwards compatible.
3. **Document per-archetype knob bindings**. Each archetype declares which knobs it consumes; balancer skips knobs not bound.
4. **Add a `degenerate` strategy or fallback**. When required structures aren't present, fall back to `anchor` and log a warning.

### What I would NOT do

- **Add more regimes.** Five is enough. The problem isn't classification, it's diagnostic dimensionality.
- **Make the balancer try to fix horizontal collisions.** That's a layout decision, not a balance decision. The balancer should detect the condition and let CSS handle the response.
- **Auto-truncate content.** Loses information without user awareness. Worse than overlap.
- **Add a "panic" mode that hides elements.** Better to fail visibly so the human notices than to fail invisibly so they don't.

---

## Verdict

The three-knob contract is **correct but incomplete**. It handles the F-card (and other hero+list archetypes) cleanly. It needs two extensions to handle the full archetype set without silent failures:

1. **A second diagnostic axis** (horizontal pressure or content density) that emits attributes for CSS to respond to. Does not change strategies.
2. **Per-archetype knob bindings** so strategies are predictably scoped. Does not change knob targets.

Both are additive. The current contract continues to work as-is. Neither requires breaking the spacing scale, type ramp, or other locked rules.
