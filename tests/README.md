# Tests

Two test suites that share one fixture set. Both run against the live `manifest.json` so changes to templates, CSS, or fonts are caught even when no code in this repo changes.

| Suite | File | What it checks |
|---|---|---|
| **Integration** | `integration.test.js` | Manifest is well-formed, every template fetches, placeholders all substitute, PPLX mark is in every rendered card, every asset URL returns 2xx. |
| **Visual regression** | `visual.test.js` | Each archetype renders pixel-for-pixel within tolerance of an approved baseline screenshot. |

Shared rendering pipeline lives in `_template.js` (FIXTURES, expander, substituter) so both suites use identical inputs.

---

## Integration test

```bash
npm test
# or
node tests/integration.test.js
```

Zero dependencies, Node 18+. Output:

```
═══ Archetype results ═══
Archetype       Fetch  Render  Placeh.  Mark   Size    Notes
─────────────────────────────────────────────────────────────────
A               PASS   PASS    PASS     PASS    3327
...
ALL CHECKS PASSED
```

Exit 0 on pass, 1 on any failure, 2 on unhandled error.

---

## Visual regression test

```bash
# Run regression check against committed baselines
npm run test:visual

# Regenerate baselines (after an intentional design change)
npm run baseline
```

Requires `playwright`, `pixelmatch`, `pngjs` from `package.json` devDependencies (`npm install` once).

### How it works

For each archetype declared in the live manifest:

1. Fetch its `template_url`
2. Render with the synthetic fixture (`_template.js#FIXTURES`)
3. Launch Chromium at the archetype's **native viewport** (1080×1080, 1080×1350, 1080×1920, or 1920×1080)
4. Set page content; wait for `networkidle` and `document.fonts.ready`
5. Screenshot the `.card` element
6. Diff against `tests/baselines/<key>.png` with [pixelmatch](https://github.com/mapbox/pixelmatch)
7. Save `tests/current/<key>.png` and `tests/diffs/<key>.png` (diff pixels rendered in magenta)
8. Emit `tests/visual-report.html` showing baseline / current / diff side-by-side per archetype

### Tolerance

- **Per-pixel color threshold:** 0.1 (pixelmatch default, anything more sensitive surfaces subpixel antialiasing as drift)
- **Total tolerance:** ≤ 0.50% of pixels may differ before the test fails
- **Determinism:** in this sandbox, back-to-back runs report 0.000% / 0 px (literally byte-identical). The 0.50% headroom exists for the rare case where a CI runner's Chromium build version shifts.

### Anti-flake measures

The most common source of visual regression flake is webfont swap mid-render. The test mitigates with:

- `await document.fonts.ready` before every screenshot
- A 150ms idle tick after fonts settle so layout reflows once and stays put
- `deviceScaleFactor: 1` (avoid subpixel rendering noise)
- `prefers-reduced-motion: reduce` emulated
- An injected stylesheet that forces `animation: none` and `transition: none` everywhere
- `cardLocator.screenshot({ animations: 'disabled' })` belt-and-suspenders

### What gets committed

- ✅ `tests/baselines/<key>.png` — the approved design. These are the test.
- ❌ `tests/current/<key>.png` — per-run, gitignored
- ❌ `tests/diffs/<key>.png` — per-run, gitignored
- ❌ `tests/visual-report.html` — per-run, gitignored. CI uploads it as an artifact instead.

### Updating baselines

When you intentionally change a template or its CSS:

```bash
npm run baseline
git add tests/baselines/
git commit -m "Update visual baselines: <reason>"
```

Reviewers should always inspect the diff in the PR — new baselines should be reviewed visually, not just rubber-stamped.

### Pointing at a different manifest

Set `MANIFEST_URL` to override the default:

```bash
MANIFEST_URL=https://my-fork.example.com/manifest.json npm run test:visual
```

### Exit codes

- `0` — all archetypes within tolerance
- `1` — at least one archetype exceeds tolerance (drift)
- `2` — unhandled error in the test itself
