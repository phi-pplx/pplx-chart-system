# Audit scripts

Node + Playwright harnesses that measure every padding, margin, gap, and clearance on a chart or page, then classify each value against the spacing scale.

Floor is `--s-4` (20px). Anything below is flagged as a violation. Anything between scale tokens is flagged off-scale. Anything on a token passes.

## Files

- `measure-charts.cjs` — audits `01-snippet-bar.fixed.html` and `02-frontier-line.fixed.html`
- `measure-scorecard.cjs` — audits `03-ranked-scorecard.fixed.html` (handles the table anatomy and the intra-label carve-out for tight typographic stacks)
- `measure-toolkit-page.cjs` — audits this landing page itself
- `verify-charts.cjs` — runs `measure-charts.cjs` against the corrected versions and confirms zero sub-floor violations

## How to run

```bash
npm install playwright
npx playwright install chromium
node measure-toolkit-page.cjs
```

The script exits with status 0 if zero sub-floor violations, status 1 if any are found. Suitable for a CI pre-merge check.

## Current verdict

| Asset | Pass | Off scale | Sub-floor |
|---|---:|---:|---:|
| Snippet bar | 13 | 0 | 0 |
| Frontier line | 12 | 0 | 0 |
| Ranked scorecard | 20 | 1 | 0 |
| This landing page | 44 | 0 | 0 |

The scorecard's one off-scale value is the title-to-mark whitespace (44px), which is content-driven not configurable.
