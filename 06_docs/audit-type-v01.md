# Type Size Audit · v0.1 · Honest

Measured against the rules we've built together. Computed-style data, not vibes.

## Rules in play

From the locked rule set and audit framework:

| # | Rule | Source |
|---|---|---|
| R1 | Type sizes in `cqi`, never `px` | Locked user preference |
| R2 | All headlines = GT Canon Narrow Medium, opsz tracks font-size | This morning |
| R3 | Hero stats only Canon (was the v7 rule; expanded R2 broadens it) | v7 locked |
| R4 | Mono = utility chrome (kicker/label/footer/tag). Sans = body | Locked |
| R5 | "Be more considerate of the type system" — every decision traces to the ramp | Locked |
| R6 | Spacing/sizing consistency at pixel level | Locked |
| R7 | Minimum effective difference between steps | Tufte / smallest effective difference |
| R8 | WCAG AA floor on every text role | Locked |
| R9 | Type clamped against tiny canvases (`clamp()` floors) | v0.1 fix |

## The defined ramp

Tokens declare 7 steps with `clamp(min, cqi, max)`:

| Token | Role | At 1920w | At 1080w | At 540w (preview) |
|---|---|---|---|---|
| `--t-mark` | hero stat / display claim | clamp(38, 5.0cqi, 220) → **96** | → **54** | → **38** |
| `--t-title` | title | clamp(18, 2.4cqi, 56) → **46** | → **26** | → **18** |
| `--t-deck` | card subtitle | clamp(13, 1.55cqi, 32) → **30** | → **17** | → **13** |
| `--t-body` | body | clamp(11, 1.30cqi, 24) → **25** | → **14** | → **11** |
| `--t-label` | node label | clamp(11, 1.20cqi, 22) → **23** | → **13** | → **11** |
| `--t-utility` | mono utility | clamp(10, 1.05cqi, 19) → **20** | → **11** | → **10** |
| `--t-micro` | mono micro | clamp(9, 0.92cqi, 16) → **18** | → **10** | → **9** |

That's the **system as designed**. Now what was actually rendered:

---

## Measured sizes vs. rendered ramp

I read computed styles on every text role across all 7 rendered canvases (4 archetypes × 2 aspects, editorial only — branded mode shares tokens). Here's what's clean and what isn't.

### Headlines (Canon)

| Role | At 1920 | At 1080 | Token | Verdict |
|---|---|---|---|---|
| `.title` | 44.2px | 24px | `--t-title` (clamped: 46/26) | **Slightly under target** — the clamp ceiling is 56px, mid is 2.4cqi which at 1920w = 46.08, at 1080w = 25.92. Measured 44.2 / 24 — those are *not* the clamp middle. Off by ~2px each. |
| `.h-hero .number` | 92px | 50px | `--t-mark` (clamped: 96/54) | **Slightly under target** — same pattern. 5.0cqi × 1920 = 96, but measured 92. Off by ~4px. |

The discrepancy: `cqi` resolves against the **container** width, not viewport. My `.surface` has `padding: 40px 40px`, so the inline container is 1920 − 80 = 1840px. 2.4cqi of 1840 = 44.16. **That matches the 44.2 reading exactly.** Same math for hero number: 5.0cqi × 1840 = 92px. ✓

**Conclusion:** the ramp is working correctly — `cqi` is doing what container queries are supposed to do. The "expected" px values I wrote above were wrong because they assumed viewport width, not surface inline width.

### Headlines · timeline anomaly

Timeline editorial 16:9 reports `.title` at 22–44.2px. That's **two distinct sizes for the same class**.

Cause: the timeline has both:
- `.head .title` (the diagram-level title, 44.2px) — correct
- `.t-card .title` (per-milestone card title, 22px) — **same class name, different role**

`.t-card .title` cascades through the same GT Canon rule, so card titles are rendering in **Canon Narrow Medium** when they should be **PPLX Sans Medium** (they're labels, not headlines).

**This is a real violation of R2 + R4.** The card titles in Timeline are labels — they should not be Canon.

### Utility chrome (Mono)

| Role | Token | Measured @1920 | Measured @1080 | Verdict |
|---|---|---|---|---|
| `.kicker` | `--t-utility` (20/11) | 19 | 10.5 | Close — clamp ceiling caps it at 19, so we hit ceiling at 1920. ✓ |
| `.col-label` | `--t-micro` (18/10) | 16 | 9.2 | Clamp ceiling caps at 16. ✓ |
| `.foot .left/.right` | `--t-utility` (20/11) | 19 | 10.5 | ✓ |
| `.foot .stamp` | `--t-micro` (18/10) | 16 | 9.2 | ✓ |
| `.pill` | `--t-micro` (18/10) | 16 | 9.2 | ✓ |
| `.tile-label`, `.tile-count` | `--t-micro` | 16 | 9.2 | ✓ |
| `.core-meta`, `.node-sub`, `.timeline-date` | mixed | 16–19 | 9.2–10.5 | Mostly hitting --t-utility or --t-micro |

**Issue found:** `.timeline-date` is at 19px (--t-utility) but acts the same as `.foot-left`. Should it be? The date is a *label* in the timeline rail — arguably it deserves to be `--t-label` (Sans, larger) or it should stay Mono at one specific step. Currently it's the same size as the kicker. Probably fine.

### Body / labels (Sans)

| Role | Token | @1920 | @1080 | Verdict |
|---|---|---|---|---|
| `.node-label`, `.t-card-title`, `.c-row-name`, `.stathero-row-label` | `--t-label` (23/13) | 22 | 12 | Off by 1px from the ceiling — clamp ceiling is 22. ✓ |
| `.core-deck`, `.pipeline-table-v`, `.t-card-body`, `.t-card-li`, `.stathero-row-value` | `--t-body` (25/14) | 23.9 | 13 | Off by ~1px from ceiling 24. ✓ |
| `.core-name` | `--t-title × 0.92` (~42.3/23.9) | 40.6 | 22.1 | Calculated as 0.92 × 44.2 = 40.66 ✓ |
| `.hero-context` | `--t-deck` (30/17) | 28.5 | 15.5 | ✓ |

### Comparison values

The Comparison axis labels measured at 16 and 9.2px (Mono micro). Fine.

The `.c-row-name` and `.c-row-value` both at 22px Sans @1920. The **name** is a label; the **value** is data. Good — same weight class, makes the bar+value read as one row.

---

## Real violations I'd flag

### ❌ Violation 1: Canon bleeding into card-titles

`.t-card .title` in Timeline inherits the global GT Canon rule, but Timeline cards are *labels* (milestone titles), not headlines. Sans Medium is the right role.

**Severity:** Major. This breaks R4 ("Sans = body/labels, headlines only get Canon").

**Fix:** Either rename `.t-card .title` to `.t-card .name` (less invasive) or scope the global `.title` rule to `.head .title` only. The second option is correct architecture.

### ❌ Violation 2: `.pipeline-table-v` and `.core-deck` share the same token (`--t-body`) but they're different roles

`.pipeline-table-v` is a **data value** in a Mono/Sans grid (the Baseline / Project / Deep rows). `.core-deck` is **prose**. Both render at 23.9px Sans. Same size, but they're doing different jobs in the type ramp — values should probably be smaller-and-Mono or larger-and-bolder than prose.

**Severity:** Minor. They happen to look balanced now but the type system isn't expressing the difference.

**Fix:** Either accept that "value text in a table" and "body prose" can share a step, or split into `--t-value` and `--t-body`. I lean toward keeping them shared — the rule is "every step earns its place," not "every role gets a step."

### ⚠ Soft violation 3: there are too many Mono steps close together

| Role | Size @1920 |
|---|---|
| `.kicker` / `.foot-left/right` / `.timeline-date` | 19 |
| `.col-label` / `.foot-stamp` / `.pill` / `.tile-label` / `.tile-count` / `.core-meta` / `.node-sub` / `.t-card-meta` | 16 |
| (between them) | — |

So Mono has **two** sizes: 19 and 16. The "smallest effective difference" rule (Tufte) calls for distinguishable steps. 19→16 is a ~16% step. That's borderline — readable, but if I'm being strict, the difference between "kicker" and "tile-label" isn't communicating much. They're both small Mono.

**Severity:** Minor. Maybe collapse to one Mono utility size and let position/letter-spacing communicate role differences. But there's also an argument for keeping them — kickers sit at the top and need more presence than internal pills.

Actually I checked — the rule we documented is `--t-utility` for "kicker/footer", `--t-micro` for "sub-label/annotation." That mapping is honored. The two-step Mono ramp is intentional.

### ❌ Violation 4: the canon ramp doesn't have a value between `--t-mark` and `--t-title`

`--t-mark` (96px @1840 surface) and `--t-title` (44px @1840 surface) are 2.2× apart. That's a real gap. If a future archetype needs a "subhero" — a number that's not THE punchline but still display-scale — it has nowhere to land. Today this isn't biting because only Stat Hero uses `--t-mark`.

**Severity:** Latent, not active.

**Fix:** Add `--t-display: clamp(28px, 3.6cqi, 80px)` as the intermediate step. Use it when a headline needs to be louder than `.title` but isn't the singular hero stat.

### ✅ Confirmed clean

- All `cqi` units honored — no stray `px` font-sizes anywhere (R1 ✓)
- All clamp floors hold — nothing drops below 9px at any aspect (R9 ✓)
- Mono is utility-only, Sans is body, Canon is headline (R4 holds except for Violation 1)
- Spacing scale held — everything traces to a token, no magic numbers (R5 ✓)
- WCAG (R8) — separate audit, all editorial accents use -700 variants ✓

---

## Summary

| Verdict | Count |
|---|---|
| Pass | 5 confirmations |
| Minor | 2 (Mono spacing tightness, value/body share) |
| Major | 1 (Canon leaking into Timeline `.t-card .title`) |
| Latent | 1 (missing `--t-display` step) |

**Fix priority:**

1. **Scope `.title` to `.head .title`** so Timeline milestone titles drop back to Sans Medium. One CSS rule edit. High value, zero risk.
2. **Add `--t-display`** as an intermediate canon-eligible step for future archetypes. Add to tokens.css, no immediate use.
3. (Skip the minor ones unless we hit a case where the type system stops communicating.)

Want me to apply fixes 1 and 2 now?
