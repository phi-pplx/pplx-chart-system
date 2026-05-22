# Perplexity chart system

Black-canvas, PPLX Mono benchmark charts using the Comet palette. Four chart patterns, full design spec, and animated social-ready exports.

---

## What's in the box

| folder | what | when to use |
|---|---|---|
| `01_charts/` | editable HTML sources | when you need to build a new chart in the system or modify an existing one |
| `02_exports/static/` | high-res JPGs | slides, decks, blog posts, screenshots |
| `02_exports/animated-gif/` | looped GIFs | paste-anywhere — Slack, Notion, Discord, blog inline |
| `02_exports/animated-mp4/` | H.264 MP4s | video-aware platforms — X / LinkedIn / Instagram |
| `03_system/` | full system spec + design guide | reference when extending the system or onboarding a designer |
| `04_brand/` | reusable assets — fonts, palette, mark | any future chart, page, or deck |

See `INVENTORY.md` for a file-by-file listing.

---

## The four chart patterns

1. **Snippet bar** — divergent horizontal bar chart with subtotal and standout punchline bar
2. **Frontier line** — multi-series line chart with optional axis break and dashed reference series
3. **BrowseComp** — scatter + line with inline point labels and dotted competitor benchmarks
4. **SimpleQA** — scatter + line (same pattern as BrowseComp, different domain)

---

## Role-bound palette

Same hue, same meaning, every chart.

| role | hex | comet token |
|---|---|---|
| **hero / punchline** | `#2ca1ab` | Teal 400 |
| **baseline / comparison** | `#923272` | Magenta 600 |
| **reference (dotted)** | `#d4cdc1` | warm grey |

Bar-only gradient inter-shades (snippet chart only): Magenta 500 → Purple 500 → Indigo 400 → Indigo 500 → Blue 500.

---

## Motion language

Three curves, each tuned to physical weight.

| curve | bezier | character | applied to |
|---|---|---|---|
| **A · Settle** | `cubic-bezier(0.16, 1, 0.3, 1)` | ease-out expo — fast start, confident landing | bar widths, line draws |
| **B · Pop** | `cubic-bezier(0.34, 1.56, 0.64, 1)` | ease-out back — subtle 4% overshoot | markers, value labels |
| **C · Whisper** | `cubic-bezier(0.4, 0, 0.2, 1)` | material standard — gentle fade | inline labels |

**Exponential stagger** instead of linear: cascade accelerates visually, reads as one fluid motion rather than a metronome.

**Punchline pause** (snippet only): Vital gets an extra 220ms before growing — signals "and here's the answer."

**Rules:**
- Animate only data marks. Never animate text, axes, frame, gridlines, or chrome.
- Loop: empty start frame → cascade → 2.2s hold → snap reset (invisible) → restart.

---

## Export specs

| format | width | fps | quality | typical size | best for |
|---|---|---|---|---|---|
| JPG | 2632 (2x of 1316) | — | q=95 | 200-400 KB | slides, decks, print |
| GIF | 1200 | 24 | 256-color, bayer dither | 270-310 KB | Slack, Notion, Discord, blog |
| MP4 | 1200 | 24 | H.264 yuv420p, CRF 18 | 80-170 KB | X, LinkedIn, Instagram |

---

## System rules (full spec in `03_system/chart-system-guide.html`)

- Equal left/right padding always (40px), never asymmetric
- PPLX Mono throughout — no PPLX Sans in chart UI
- No skewed or rotated text — y-axis context goes above the plot as a section sublabel
- Teal 400 and Magenta 600 are reserved roles, never used as decoration
- Bars/lines stagger via exponential easing, not linear delays
- Markers always carry overshoot; labels never do

---

## Quick start

To open a chart and tweak it:
1. Open any HTML in `01_charts/` directly in a browser — fonts will load from `01_charts/assets/fonts/`
2. Data lives in JavaScript arrays at the top of the `<script>` block (look for `const data` or `const series`)
3. Edit, save, refresh — animations replay automatically on reload

To use the brand assets elsewhere:
1. Fonts: `04_brand/fonts/` (load both VF files via `@font-face`)
2. Mark: `04_brand/pplx-symbol.svg` (single path, `currentColor` for fill — inherits text color)
3. Palette: `04_brand/comet-palette.json` (full 9×9 hex grid, programmatic)

---

*Generated for Perplexity Creative Studio · v3 (Option A palette · premium motion language)*
