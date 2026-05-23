# PPLX Announcement-Diagram System · v0.1

Companion to the chart system. Where `01_charts/` carries quantitative figures (bars, lines, scatters), this folder carries *announcement diagrams* — the architectural and editorial visuals that accompany product launches, security disclosures, and research blog posts.

Built and audited against two formal frameworks:
- **Edward Tufte** (post-hoc criticism, heuristics) — 14-criterion audit
- **Jacques Bertin** (a priori construction theory) — 15-criterion audit

Audit documents live in [`../06_docs/`](../06_docs/).

---

## Six archetypes built

| Letter | Name | FT Visual Vocabulary | Real use |
|---|---|---|---|
| **P** | Pipeline | Flow | Bumblebee scanning pipeline · MCP integration architecture · Search API request flow |
| **T** | Timeline | Chronology | Comet security journey · launch sequences · changelog narrative |
| **H** | Stat Hero | Magnitude | BrowseSafe benchmark size · "200M queries" cards · Stripe Press-style numbers |
| **C** | Comparison | Deviation / Ranking | BrowseComp · SimpleQA · FRAMES leaderboards · latency tables |
| **S** | Schema | Network | Product surface map · system topology · dependency overview |
| **D** | Decision | Branching logic | Computer task routing · triage tree · state machine |

Grid (G) intentionally omitted — categorical × categorical matrices fold into Comparison.

---

## Two modes × three aspects

Every archetype renders in:
- **Editorial mode** (`#FBFAF4` warm cream surface) — for blog, docs, PDF embeds
- **Branded mode** (`#0A0A0A` near-black) — for social cards, press kits

At three aspect ratios:
- **16:9** (1920 × 1080) — landscape, blog embeds
- **1:1** (1080 × 1080) — square social
- **4:5** (1080 × 1350) — vertical social

Same source data drives all six combinations. The system uses container queries (`cqi` units) so type and spacing scale with the surface.

---

## Pipeline · Full vs Compact

Pipeline has two variants that resolve a real Tufte ↔ Bertin tension:

- **Full** carries 4 active retinal variables (wire weight encodes throughput, sparkline strips encode 7-day activity, accent encodes punchline, warn encodes exception). Tufte-dense, Bertin-figuration. Use for blog/docs where sequential reading is acceptable.
- **Compact** strips back to 1 active retinal variable (accent only). Bertin-image. Reads at the overall level in ≤3 seconds. Use for social cards and press.

Pass `compact: true` in the data object to render Compact.

---

## Token system

All tokens defined in [`system/tokens.css`](system/tokens.css):

### Color (Comet palette, v0.1)
| Role | Branded value | Editorial text variant |
|---|---|---|
| Punchline | `#35bec8` teal-300 | `#15797f` teal-700 (4.93:1 AA on cream) |
| Warn / extreme | `#dd54ac` magenta-400 | `#b03683` magenta-700 (5.43:1 AA on cream) |
| Secondary cool | `#7284e6` indigo-400 | `#3d4cb8` indigo-700 (6.87:1 AA on cream) |
| Neutral baseline | `#d4cdc1` warm grey | `#6b5648` warm-grey-700 (5.62:1 AA on cream) |

Bright variants used for graphical fills (≥3:1 required per WCAG 2.2 SC 1.4.11). Darker -700 variants used for text in editorial mode.

### Type
| Role | Family | Variation |
|---|---|---|
| Headline (`.head .title`, `.h-hero .number`) | GT Canon | Narrow Medium, `wdth 75, wght 500`, `font-optical-sizing: auto` |
| Body / label | PPLX Sans | `wght 400–600` |
| Utility / kicker / footer / pill | PPLX Mono | `wght 500` |

### Spacing
Locked scale: `4 · 8 · 14 · 20 · 28 · 40 · 56 · 80 · 112`.

### Type ramp (clamped)
| Token | clamp() | Used for |
|---|---|---|
| `--t-mark` | `clamp(38px, 5.0cqi, 220px)` | Hero stat |
| `--t-display` | `clamp(28px, 3.6cqi, 80px)` | Subhero (reserved for Stack / Decision) |
| `--t-title` | `clamp(18px, 2.4cqi, 56px)` | Diagram title |
| `--t-deck` | `clamp(13px, 1.55cqi, 32px)` | Card subtitle |
| `--t-body` | `clamp(11px, 1.30cqi, 24px)` | Body / values |
| `--t-label` | `clamp(11px, 1.20cqi, 22px)` | Node labels |
| `--t-utility` | `clamp(10px, 1.05cqi, 19px)` | Mono utility |
| `--t-micro` | `clamp(9px, 0.92cqi, 16px)` | Mono micro |

Clamp floors ensure type never collapses below readable at small canvases.

---

## Architecture

```
08_diagrams/
├── system/           Shared system code
│   ├── tokens.css    Comet palette + spacing + type tokens
│   ├── base.css      Reset, surface, head, foot, card primitives
│   ├── render.js     Data → DOM render functions for each archetype
│   ├── wire-router.js Auto-routes orthogonal connections from DOM positions
│   └── mark.svg      Real PPLX 2026 symbol (wing glyph)
├── archetypes/       Per-archetype CSS
│   ├── pipeline.css
│   ├── timeline.css
│   ├── stathero.css
│   └── comparison.css
├── bumblebee/        Pipeline reference build · 4 + 4 variants (full + compact)
├── timeline/         Timeline reference build · 4 variants
├── stathero/         Stat Hero reference build · 4 variants
├── comparison/       Comparison reference build · 4 variants
├── sheet/            System overview pages
├── renders/          Rendered JPGs for every variant
└── fonts/            GT Canon + PPLX Sans/Mono
```

---

## Wire router

The Pipeline archetype uses an auto-routing wire system. Wires are declared as data, not hardcoded SVG paths:

```js
wires: [
  { from: '.n-pub',  fromSide: 'right', to: '.n-comp', toSide: 'right',
    via: 'spine', spineGroup: 'feeds', style: 'neutral', weight: 0.30 },
  { from: '.n-comp', fromSide: 'right', to: '.n-bumb', toSide: 'left',
    style: 'ink', weight: 0.55 },
  { from: '.n-bumb', fromSide: 'right', to: '.n-find', toSide: 'left',
    style: 'accent', weight: 0.10 }
]
```

The router measures actual DOM positions at render time and draws orthogonal elbows with the correct stroke style and arrowhead. Layout changes never break wire geometry. `weight` (0..1) scales stroke thickness 1.0–3.5px to encode throughput (Bertin-correct size encoding for quantitative components).

In Compact mode, the renderer strips all `weight` values before routing, so all wires render at constant stroke width.

---

## Audit summary

| | Tufte (post-hoc, heuristic) | Bertin (a priori, formal) |
|---|---|---|
| Pipeline Full | 14 pass · 1 N/A | Figuration by design (4 retinal variables) |
| Pipeline Compact | 14 pass · 1 N/A | 14 pass (1 retinal variable) |
| Timeline | 14 pass · 1 N/A | Passes all 15 tests |
| Stat Hero | 14 pass · 1 N/A | Passes all 15 tests |
| Comparison | 14 pass · 2 N/A | Passes all 15 tests |
| Schema (v0.2) | not yet | 13 pass · 1 partial · 2 N/A |
| Decision (v0.2) | not yet | 14 pass · 1 N/A |

Full audit documents:
- [`audit-tufte-v01.md`](../06_docs/audit-tufte-v01.md) — 14-criterion framework + per-archetype grades for P/T/H/C
- [`audit-bertin-v01.md`](../06_docs/audit-bertin-v01.md) — 15-criterion framework + per-archetype grades for P/T/H/C
- [`audit-bertin-v02.md`](../06_docs/audit-bertin-v02.md) — Bertin audit for S and D
- [`audit-tufte-mapping.md`](../06_docs/audit-tufte-mapping.md) — research → decisions traceability
- [`audit-type-v01.md`](../06_docs/audit-type-v01.md) — computed-style type audit

Original research briefs:
- [`research-tufte-canon.md`](../06_docs/research-tufte-canon.md)
- [`research-bertin-semiology.md`](../06_docs/research-bertin-semiology.md)

---

## How to use

Open any HTML file directly in a browser. To render to PNG / PDF for distribution, use the existing chart-system render scripts as a template — viewport sized to the target aspect ratio at 2× device scale factor, `page.fonts.ready` awaited, then a 200ms settle delay before screenshot.

To add a new diagram of an existing archetype:
1. Create a `data.js` next to your HTML, exporting a data object
2. Reference `system/tokens.css`, `system/base.css`, and the archetype CSS
3. Call `PPLXDiagram.render<ArchetypeName>(data, target)` then `PPLXWires.route(body)` if Pipeline

To add a new archetype, follow `archetypes/comparison.css` as a template — it covers the full pattern: archetype-scoped layout, optional axis primitives, row/column primitives, accent state, and series tier states.
