# PPLX Chart System · v7

Perplexity's chart system for social posts and research-blog figures. Two surfaces, one rulebook. Social cards are editorial: one hero number leading, the rest as support. Research charts are instrument readouts: axes, gridlines, every value defensible. Same v7 tokens drive both. Built to be picked up by a human or an agent.

**Live site:** [phi-pplx.github.io/pplx-chart-system](https://phi-pplx.github.io/pplx-chart-system) *(populates within ~2 minutes of first deploy)*

---

## Comet palette · token roles

The system uses Perplexity's Comet palette with four locked roles. One accent per card, applied to the row or point of interest.

| Token | Role | Hex | Use |
|---|---|---|---|
| **Teal 300** | Punchline | `#0fb5b3` | The leading accent. Highlighted bar, hero ranked entry, peak point, callout chip. Used once per card. |
| **Magenta 400** | Warm extreme | `#cd2d7d` | Reserved for warning states, failure tags, and the extreme-warm pole when a sequence needs both ends. fit.js `data-fit-warn` strip uses it. |
| **Indigo 400** | Secondary cool | `#5b6cff` | The secondary cool accent when a second series is unavoidable in a research-variant multi-line plot. Pairs with Teal 300 across a value axis. |
| **Warm grey reference** | Neutral baseline | `#9a8074` | The editorial-light surface baseline and the third series color in research multi-line plots. Reads as quiet against ink. |

Hero numbers always render in ink (`--text-dark-1` on dark, `--ink` on light), never in any palette color. The accent is reserved for the visual answer to the card's question — the bar that wins, the model that leads, the point that matters.

---

## What's in this repo

### `01_deployable-site/` — published landing site
The reference experience. Open `index.html` locally or hit the live URL above. Includes the opener block, grouped reference index (Foundations / Archetypes / Proofs / Exports), decision tree, archetype audit, two-track research-vs-social comparison, blog rebuilds, tokens export, and agent path walkthrough. All paths relative; works offline as long as `./fonts/` sits alongside.

### `02_source-pages/` — editable HTML sources
- `v7-archetype-audit.html` — every archetype (A through G family) at native aspect ratio
- `v7-two-track.html` — research vs social treatment of the same four datasets
- `v7-blog-rebuilds.html` — six real datasets from research.perplexity.ai rebuilt as v7 cards
- `v7-edge-cases.html` — failure stress test with the audit-findings annotations
- `v7-academic-dark.html`, `v7-academic-light.html`, `v7-editorial-dark.html`, `v7-editorial-light.html` — the four surface variants
- `fit.js` — layout balancer + validator (CCR classifier, three failure detection classes: horizontal-overflow, density-mismatch, missing-structure)
- `templates/` — **stable template directory for skill integration.** One minimal HTML file per archetype with `{{ kicker }}`, `{{ title }}`, `{{ hero }}`, `{{ footer_left }}`, `{{ footer_right }}` placeholder syntax. Shared `_base.css` holds all the rhythm + archetype rules. Templates reference the CSS by absolute URL so a single fetch gets you a working card.

### `03_fonts/` — variable fonts
- `GT-Canon-VF.woff2` — upright (wdth 37–150, wght 300–900, opsz 8–144)
- `GT-Canon-Italic-VF.woff2` — italic (opsz capped at 60, the font's design space)
- `PPLX-Sans-Beta-v2-VF.woff2`
- `PPLX-Mono-Beta-v0-VF.woff2`

### `04_renders/` — static JPGs
Drop into decks, docs, and review threads. `*-dark.jpg` files have the dark META layer that matches the landing canvas. `*-01/02/03.jpg` files are vertical slices of long pages. All four surface treatments included (academic/editorial × dark/light).

### `05_brand/` — PPLX 2026 mark
SVG of the symbol. Always 36×36 absolute top-right on data cards.

### `06_docs/` — specifications and audit findings
- `tokens.json` — full token export. Agents fetch this directly. Schema includes surfaces, spacing scale, type ramp, type rules, archetype contracts, and frame rules.
- `v7-audit-findings.md` — what shines and what strains across the archetype set
- `v7-two-track-spec.md` — the research/social split decision tree and per-row mapping
- `v7-edge-findings.md` — failure-stress audit findings
- `INVENTORY.md` / `README.md` — original system inventory

### `07_research-blog-refs/` — source figures
The actual research.perplexity.ai chart figures we modeled the research variant on. Source: "Advancing Search-Augmented Language Models", April 2026.

### `08_diagrams/` — announcement diagram archetypes
Six diagram archetypes built on the same spacing contract as the charts: Pipeline, Timeline, Stat Hero, Comparison, Schema, Decision. Each has editorial + branded variants at 16:9 and 1:1. Audited against Tufte and Bertin.

### `09_toolkit/` — research toolkit landing page
A simple landing page for anyone at Perplexity making charts. Covers why the system exists, what bad looks like (with side-by-side before/after of real shipped work), four core rules from Tufte and Bertin, the three starting templates, and the audit harness that catches sub-floor spacing. Lives at [phi-pplx.github.io/pplx-chart-system/09_toolkit/](https://phi-pplx.github.io/pplx-chart-system/09_toolkit/).

---

## How to use this

### Reading the system
Hit the live URL. Scroll through. The opener tells you what v7 is. The reference index groups everything into Foundations / Archetypes / Proofs / Exports. The decision tree picks the archetype for your data. The agent path shows how to render one.

### Building a new card
1. Identify your data shape (single hero, ranked list, multi-metric, before/after, curve, header-only)
2. Use the decision tree on the live page to pick the archetype
3. Read that archetype's contract in `06_docs/tokens.json` — kicker, title, hero, deck, content blocks, foot
4. Emit HTML using the contract — every type-size declaration in `cqi` so the card scales with its container
5. Validate with `fit.js`

### Building a research-blog figure
Use the research variant treatment shown in `v7-two-track.html`. Dark panel, hairline outer border, nested subplot card, PPLX Mono title, single Teal 300 accent on data, endpoint markers, axis-anchored values. Indigo 400 and warm grey enter only when a second and third series are unavoidable.

### Hosting elsewhere
Copy `01_deployable-site/` to any static host (Vercel, Netlify, S3+CloudFront, Cloudflare Pages). All paths are relative.

---

## Locked rules · v7

- **Spacing scale**: 4 · 8 · 14 · 20 · 28 · 40 · 56 · 80 · 112. Card padding is `--s-7` (56px) on all sides.
- **Hero stat**: GT Canon Narrow Medium, wdth 75, wght 500, opsz 60–144. Always in ink, never in accent.
- **One accent per card**. Teal 300 by default. Magenta 400 only for failure states. Indigo 400 only when a second series is required (research variant). Warm grey for the third series.
- **Numbers**: proportional figures for display heroes (`pnum lnum kern`), tabular for stacked columns (`tnum lnum kern`). The `%` is part of the number, not an annotation.
- **PPLX 2026 mark**: 36×36 absolute top-right, always.
- **GT Canon Italic**: capped at opsz 60 (the variable font's actual design space). Pushing past it produces sloppy rendering.
- **G archetype**: title face is GT Canon, NOT Mono. Mono is utility chrome only.
- **Type sizes in `cqi`**, never px. Cards must scale with their container; the audit caught this regression and the rule is now enforced.
- **No em dashes** in copy. **No emoji** as icons. **No violet** in UI. **No glassmorphism**.

## Rhythm contract (every card)

- **Head** — kicker + title left, PPLX 2026 mark right. Pins to top.
- **Breath** — the fluid `1fr` space below the hero stack. Never let content fill it. A minimum `gap: 4cqi` on the body grid guarantees the breath is never zero.
- **Content** — chart, list, comparison, or grid. Pins above the footer.
- **Foot** — hairline rule + Mono footer caption. Pins to bottom.

---

## For skill authors · manifest.json

The repo ships a `manifest.json` at the root and at the Pages URL. It's the single fetch target a skill needs: every asset URL, every archetype contract, the decision tree, the Comet palette role table, the type ramp, and the locked principles — all in one JSON document.

```
https://phi-pplx.github.io/pplx-chart-system/manifest.json
```

**Pattern for skills:**

1. Fetch `manifest.json` once
2. Use `manifest.decision_tree` to pick the archetype for the data shape
3. Fetch that archetype's `template_url` (e.g. `templates/E.html`)
4. Substitute placeholders — `{{ kicker }}`, `{{ title }}`, `{{ hero }}`, etc. Repeatable blocks (bars, columns, rows) follow the per-archetype `placeholders` list
5. The rendered HTML is self-contained: it loads `_base.css` by absolute URL, which loads the fonts. No build step required.
6. Optionally fetch `fit.js` and load it after render to validate the card against its contract (attaches `data-fit-warn` on any breakage)

See the `skill_usage` block in `manifest.json` for the full fetch pattern.

### Tests

Two test suites under `tests/`. Both run against the live `manifest.json` so they catch drift in templates, CSS, or fonts even when no code in this repo changes.

- **`integration.test.js`** — simulates a skill: fetch manifest, fetch each `template_url`, substitute placeholders with synthetic fixtures, check no placeholder is left unsubstituted, check the PPLX 2026 mark is in every rendered card, HEAD-check every asset URL. Run with `npm test`. Zero dependencies, Node 18+.
- **`visual.test.js`** — renders each archetype with the same fixtures in headless Chromium at its native viewport, screenshots the `.card` element, and diffs pixel-by-pixel against a committed baseline. Tolerance is 0.50% of pixels; in practice back-to-back runs produce 0.000% diffs because the renders are byte-identical. Emits a `tests/visual-report.html` showing baseline / current / diff side-by-side per archetype. Run with `npm run test:visual`. Regenerate baselines with `npm run baseline` after intentional design changes. Requires `playwright`, `pixelmatch`, and `pngjs` (`npm install`).

CI runs both on every push, every PR, and nightly. On visual failure, the workflow uploads the report and diff PNGs as a downloadable artifact.

---

## Deploying this repo

The included GitHub Actions workflow (`.github/workflows/pages.yml`) publishes `01_deployable-site/` to GitHub Pages on every push to `main`. To deploy a copy:

1. Fork this repo
2. Settings → Pages → Source: **GitHub Actions**
3. Push to `main` — the workflow handles the rest

---

Generated · May 2026 · v7
