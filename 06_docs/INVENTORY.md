# Inventory

Complete file listing with purpose and dimensions.

## 01_charts/  — editable HTML sources

| file | chart type | dimensions | notes |
|---|---|---|---|
| `01-snippet-bar.html` | divergent bar | 1316 × 980 | Snippet composition: change in tokens per snippet |
| `02-frontier-line.html` | multi-series line | 1316 × 980 | Three-variant evidence frontier |
| `03-browsecomp.html` | scatter + line | 1316 × 980 | BrowseComp accuracy vs tokens |
| `04-simpleqa.html` | scatter + line | 1316 × 980 | SimpleQA accuracy vs tokens |
| `05-comparison.html` | side-by-side overview | 2728 × 1324 | snippet bar + frontier line shown together with shared palette strip |
| `assets/fonts/*.woff2` | font payload | — | PPLX Sans Beta v2 + PPLX Mono Beta v0 |

## 02_exports/static/  — high-res JPGs

| file | dimensions | quality |
|---|---|---|
| `01-snippet-bar.jpg` | 2632 × 1960 | q=95 (2x DPR of native 1316 × 980) |
| `02-frontier-line.jpg` | 2632 × 1960 | q=95 |
| `03-browsecomp.jpg` | 2632 × 1960 | q=95 |
| `04-simpleqa.jpg` | 2632 × 1960 | q=95 |
| `05-comparison.jpg` | 5456 × 2648 | q=95 (2x DPR of 2728 × 1324) |

## 02_exports/animated-gif/  — looped GIFs

| file | dimensions | fps | encoding |
|---|---|---|---|
| `01-snippet-bar.gif` | 1200 × 893 | 24 | 256-color palette, bayer dither |
| `02-frontier-line.gif` | 1200 × 893 | 24 | same |
| `03-browsecomp.gif` | 1200 × 893 | 24 | same |
| `04-simpleqa.gif` | 1200 × 893 | 24 | same |

## 02_exports/animated-mp4/  — H.264 video

| file | dimensions | fps | codec |
|---|---|---|---|
| `01-snippet-bar.mp4` | 1200 × 892 | 24 | H.264 yuv420p, CRF 18, faststart |
| `02-frontier-line.mp4` | 1200 × 892 | 24 | same |
| `03-browsecomp.mp4` | 1200 × 892 | 24 | same |
| `04-simpleqa.mp4` | 1200 × 892 | 24 | same |

## 03_system/  — design spec

| file | what |
|---|---|
| `chart-system-guide.html` | full scrolling spec doc — 11 sections covering canvas, header, plot geometry, axes, axis break, color grammar, lines+markers, inline labels, legend+footer, pre-flight checklist, full Comet palette grid |
| `chart-system-guide.jpg` | rendered guide as one tall image (1316 × ~11000px) |
| `assets/fonts/*.woff2` | font payload for the guide |

## 04_brand/  — reusable brand assets

| file | what |
|---|---|
| `fonts/PPLX-Sans-Beta-v2-VF.woff2` | PPLX Sans variable font |
| `fonts/PPLX-Mono-Beta-v0-VF.woff2` | PPLX Mono variable font |
| `pplx-symbol.svg` | 2026 Perplexity mark — single path, currentColor fill |
| `comet-palette.json` | full 9×9 Comet palette grid (9 hue families × 9 shades 100-900) with sampled hex values |

---

## File counts

- **24 deliverable files** (excluding font duplicates)
- **6 font copies** (3× same pair, in 3 locations so HTMLs work standalone)
- **30 total files**
- **Total archive size: ~5.5 MB**

## Animation cycle timings

| chart | cycle length | hold | total active anim |
|---|---|---|---|
| 01-snippet-bar | ~5.1s | 2.0s | ~3.1s |
| 02-frontier-line | ~4.9s | 2.2s | ~2.7s |
| 03-browsecomp | ~4.9s | 2.2s | ~2.7s |
| 04-simpleqa | ~4.9s | 2.2s | ~2.7s |
