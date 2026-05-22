#!/usr/bin/env node
/**
 * Visual regression test for the PPLX Chart System archetypes.
 *
 * Pipeline per archetype:
 *   1. Fetch live manifest.json (single source of truth)
 *   2. Fetch its template_url
 *   3. Render the template with the same FIXTURES used by integration.test.js
 *   4. Launch Chromium at the archetype's native viewport (e.g. 1080×1080)
 *   5. Set page content, wait for networkidle + document.fonts.ready
 *   6. Screenshot the .card element
 *   7. Diff against tests/baselines/<key>.png with pixelmatch
 *      Tolerance: per-pixel threshold 0.1, total diff ≤ 0.50% = pass
 *   8. Write tests/diffs/<key>.png and tests/current/<key>.png
 *   9. Emit a side-by-side HTML report at tests/visual-report.html
 *
 * Anti-flake measures:
 *   - deviceScaleFactor: 1 (no 2x subpixel noise amplification)
 *   - prefers-reduced-motion: 'reduce' emulated
 *   - All animations forced to duration 0 via injected style
 *   - Wait for document.fonts.ready (webfonts swap is the #1 source of flake)
 *   - Pinned Playwright version → pinned Chromium version → reproducible renders
 *
 * Usage:
 *   node tests/visual.test.js                  # run regression check
 *   node tests/visual.test.js --update-baselines  # regenerate baselines
 *   npm run test:visual
 *   npm run baseline
 *
 * Exit: 0 if every archetype is within tolerance, 1 if any exceeds it,
 *       2 on unhandled error.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const pixelmatch = require('pixelmatch').default || require('pixelmatch');
const { PNG } = require('pngjs');

const { FIXTURES, ARCHETYPE_VIEWPORT, render } = require('./_template');

const MANIFEST_URL =
  process.env.MANIFEST_URL ||
  'https://phi-pplx.github.io/pplx-chart-system/manifest.json';

const UPDATE_BASELINES = process.argv.includes('--update-baselines');
const PIXELMATCH_THRESHOLD = 0.1;        // per-pixel color similarity
const TOLERANCE_PCT = 0.50;              // total pixels-differing tolerance (%)

const HERE = path.resolve(__dirname);
const BASELINE_DIR = path.join(HERE, 'baselines');
const CURRENT_DIR  = path.join(HERE, 'current');
const DIFF_DIR     = path.join(HERE, 'diffs');
const REPORT_PATH  = path.join(HERE, 'visual-report.html');

const C = {
  reset: '\x1b[0m', dim: '\x1b[2m', bold: '\x1b[1m',
  green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', cyan: '\x1b[36m',
};
const NO_COLOR = process.env.NO_COLOR || !process.stdout.isTTY;
const c = (color, s) => (NO_COLOR ? s : C[color] + s + C.reset);

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

function readPNG(p) {
  return PNG.sync.read(fs.readFileSync(p));
}

async function renderArchetypeToPNG(browser, key, html, viewport) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  // Inject a stylesheet that nukes animations + transitions so the rendered
  // state is deterministic regardless of timing.
  await page.addInitScript(() => {
    const css = `*,*::before,*::after{animation:none!important;transition:none!important;}`;
    const tag = document.createElement('style');
    tag.textContent = css;
    document.documentElement.appendChild(tag);
  });

  await page.setContent(html, { waitUntil: 'networkidle', timeout: 30000 });

  // Critical: wait for webfonts to settle. Without this, screenshots
  // capture mid-FOUT state and every run diffs unpredictably.
  await page.evaluate(() => document.fonts.ready);
  // One more idle tick after fonts swap to let layout settle.
  await page.waitForTimeout(150);

  // Screenshot the card itself (not the body) so the diff is bounded
  // by the artifact under test, not the surrounding flex centering.
  const cardLocator = page.locator('.card');
  const buf = await cardLocator.screenshot({ animations: 'disabled' });
  await context.close();
  return buf;
}

function diffPNGs(baselinePath, currentBuf) {
  const baseline = readPNG(baselinePath);
  const current = PNG.sync.read(currentBuf);

  if (baseline.width !== current.width || baseline.height !== current.height) {
    return {
      sameSize: false,
      mismatchedPixels: null,
      totalPixels: baseline.width * baseline.height,
      diffPct: 100,
      diffPNG: null,
      detail: `size mismatch: baseline ${baseline.width}×${baseline.height} vs current ${current.width}×${current.height}`,
    };
  }

  const { width, height } = baseline;
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(
    baseline.data, current.data, diff.data,
    width, height,
    { threshold: PIXELMATCH_THRESHOLD, includeAA: false, diffColor: [205, 45, 125] /* magenta */ }
  );

  return {
    sameSize: true,
    mismatchedPixels: mismatched,
    totalPixels: width * height,
    diffPct: (mismatched / (width * height)) * 100,
    diffPNG: PNG.sync.write(diff),
    detail: '',
  };
}

function writeReport(results) {
  const rows = results.map(r => {
    const verdict = r.error
      ? `<span class="bad">error</span>`
      : r.updated
        ? `<span class="info">baseline updated</span>`
        : r.diffPct <= TOLERANCE_PCT
          ? `<span class="ok">PASS · ${r.diffPct.toFixed(3)}%</span>`
          : `<span class="bad">FAIL · ${r.diffPct.toFixed(3)}%</span>`;
    const baseImg = fs.existsSync(path.join(BASELINE_DIR, `${r.key}.png`))
      ? `<img src="./baselines/${r.key}.png" alt="baseline ${r.key}" loading="lazy" />`
      : '<span class="dim">no baseline</span>';
    const curImg = fs.existsSync(path.join(CURRENT_DIR, `${r.key}.png`))
      ? `<img src="./current/${r.key}.png" alt="current ${r.key}" loading="lazy" />`
      : '<span class="dim">no current render</span>';
    const diffImg = fs.existsSync(path.join(DIFF_DIR, `${r.key}.png`))
      ? `<img src="./diffs/${r.key}.png" alt="diff ${r.key}" loading="lazy" />`
      : '<span class="dim">no diff</span>';
    return `
    <section class="row">
      <header>
        <h2>${r.key}</h2>
        <div class="meta">${r.viewport.width} × ${r.viewport.height} · ${verdict}</div>
        ${r.error ? `<div class="err">${escapeHtml(r.error)}</div>` : ''}
        ${r.detail ? `<div class="dim">${escapeHtml(r.detail)}</div>` : ''}
      </header>
      <div class="grid">
        <figure><figcaption>Baseline</figcaption>${baseImg}</figure>
        <figure><figcaption>Current</figcaption>${curImg}</figure>
        <figure><figcaption>Diff (magenta = pixels that changed)</figcaption>${diffImg}</figure>
      </div>
    </section>`;
  }).join('\n');

  const totalArch = results.length;
  const passed = results.filter(r => !r.error && !r.updated && r.diffPct <= TOLERANCE_PCT).length;
  const failed = results.filter(r => !r.error && !r.updated && r.diffPct > TOLERANCE_PCT).length;
  const updated = results.filter(r => r.updated).length;
  const errored = results.filter(r => r.error).length;

  const summary = `
    <p>
      <b>${passed}/${totalArch}</b> passed within tolerance (${TOLERANCE_PCT}% diff).
      ${failed ? `<b class="bad">${failed} failed</b>.` : ''}
      ${errored ? `<b class="bad">${errored} errored</b>.` : ''}
      ${updated ? `${updated} baseline${updated === 1 ? '' : 's'} updated.` : ''}
    </p>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>PPLX Chart System · Visual Regression Report</title>
<style>
  :root {
    --bg: #0a0b0c;
    --card: rgba(255,255,255,0.03);
    --ink: #f5f3eb;
    --ink-dim: rgba(245,243,235,0.62);
    --rule: rgba(255,255,255,0.10);
    --teal: #0fb5b3;
    --magenta: #cd2d7d;
  }
  *,*::before,*::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--bg); color: var(--ink); font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
  .wrap { max-width: 1500px; margin: 0 auto; padding: 56px 40px 112px; }
  header.page { margin-bottom: 56px; }
  h1 { font-size: 36px; letter-spacing: -0.02em; margin: 0 0 14px; font-weight: 500; }
  .kicker { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-dim); margin-bottom: 14px; }
  h2 { font-size: 18px; font-weight: 500; letter-spacing: -0.01em; margin: 0; }
  .meta { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: var(--ink-dim); margin-top: 4px; }
  section.row { border: 1px solid var(--rule); border-radius: 8px; padding: 28px; margin-bottom: 28px; background: var(--card); }
  section.row header { display: flex; flex-direction: column; gap: 4px; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid var(--rule); }
  .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; align-items: start; }
  figure { margin: 0; }
  figcaption { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10px; letter-spacing: 0.10em; text-transform: uppercase; color: var(--ink-dim); margin-bottom: 8px; }
  img { display: block; width: 100%; height: auto; background: #000; border: 1px solid var(--rule); border-radius: 4px; }
  .ok { color: var(--teal); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .bad { color: var(--magenta); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .info { color: var(--ink); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .dim { color: var(--ink-dim); font-size: 13px; }
  .err { color: var(--magenta); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; margin-top: 6px; }
  table.summary { border-collapse: collapse; margin: 24px 0 0; width: 100%; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
  table.summary th, table.summary td { text-align: left; padding: 8px 14px; border-bottom: 1px solid var(--rule); }
  table.summary th { color: var(--ink-dim); font-weight: 500; }
</style>
</head>
<body>
<div class="wrap">
  <header class="page">
    <div class="kicker">PPLX Chart System · Visual Regression Report</div>
    <h1>Archetype baselines vs current render</h1>
    ${summary}
    <table class="summary">
      <thead><tr><th>Archetype</th><th>Viewport</th><th>Verdict</th><th>Diff %</th><th>Pixels off</th></tr></thead>
      <tbody>
        ${results.map(r => `<tr>
          <td>${r.key}</td>
          <td>${r.viewport.width}×${r.viewport.height}</td>
          <td>${r.error ? '<span class="bad">error</span>' : r.updated ? '<span class="info">updated</span>' : r.diffPct <= TOLERANCE_PCT ? '<span class="ok">PASS</span>' : '<span class="bad">FAIL</span>'}</td>
          <td>${r.error ? '—' : r.updated ? '—' : r.diffPct.toFixed(3) + '%'}</td>
          <td>${r.error ? '—' : r.updated ? '—' : (r.mismatchedPixels ?? 0).toLocaleString()}</td>
        </tr>`).join('\n        ')}
      </tbody>
    </table>
  </header>
  ${rows}
</div>
</body>
</html>`;
  fs.writeFileSync(REPORT_PATH, html);
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function main() {
  console.log(c('bold', '\nPPLX Chart System · visual regression test'));
  console.log(c('dim', `manifest: ${MANIFEST_URL}`));
  console.log(c('dim', `mode:     ${UPDATE_BASELINES ? 'UPDATE BASELINES' : 'regression check'}`));
  console.log(c('dim', `tolerance: ≤${TOLERANCE_PCT}% pixel diff (per-pixel threshold ${PIXELMATCH_THRESHOLD})\n`));

  ensureDir(BASELINE_DIR);
  ensureDir(CURRENT_DIR);
  ensureDir(DIFF_DIR);

  let manifest;
  try {
    const r = await fetch(MANIFEST_URL);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    manifest = await r.json();
  } catch (e) {
    console.error(c('red', `FATAL: cannot fetch manifest: ${e.message}`));
    process.exit(2);
  }

  const browser = await chromium.launch();
  const results = [];

  for (const [key, def] of Object.entries(manifest.archetypes)) {
    const viewport = ARCHETYPE_VIEWPORT[key] || { width: 1080, height: 1080 };
    process.stdout.write(c('dim', `  ${key.padEnd(14)} ${viewport.width}×${viewport.height} · `));

    const r = { key, viewport };
    results.push(r);

    let tmpl;
    try {
      const res = await fetch(def.template_url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      tmpl = await res.text();
    } catch (e) {
      r.error = `fetch template: ${e.message}`;
      console.log(c('red', `error · ${r.error}`));
      continue;
    }

    const fixture = FIXTURES[key];
    if (!fixture) {
      r.error = `no fixture defined`;
      console.log(c('red', `error · no fixture`));
      continue;
    }

    let pngBuf;
    try {
      const html = render(tmpl, fixture);
      pngBuf = await renderArchetypeToPNG(browser, key, html, viewport);
    } catch (e) {
      r.error = `render: ${e.message}`;
      console.log(c('red', `error · ${r.error}`));
      continue;
    }

    const currentPath = path.join(CURRENT_DIR, `${key}.png`);
    fs.writeFileSync(currentPath, pngBuf);

    const baselinePath = path.join(BASELINE_DIR, `${key}.png`);

    if (UPDATE_BASELINES || !fs.existsSync(baselinePath)) {
      fs.writeFileSync(baselinePath, pngBuf);
      r.updated = true;
      console.log(c('cyan', UPDATE_BASELINES ? `baseline UPDATED (${pngBuf.length.toLocaleString()} bytes)` : `baseline CREATED`));
      continue;
    }

    const diff = diffPNGs(baselinePath, pngBuf);
    r.mismatchedPixels = diff.mismatchedPixels;
    r.totalPixels = diff.totalPixels;
    r.diffPct = diff.diffPct;
    r.detail = diff.detail;

    if (diff.diffPNG) {
      fs.writeFileSync(path.join(DIFF_DIR, `${key}.png`), diff.diffPNG);
    }

    if (!diff.sameSize) {
      console.log(c('red', `FAIL · ${diff.detail}`));
    } else if (diff.diffPct <= TOLERANCE_PCT) {
      console.log(c('green', `PASS · ${diff.diffPct.toFixed(3)}% diff (${diff.mismatchedPixels.toLocaleString()} px)`));
    } else {
      console.log(c('red', `FAIL · ${diff.diffPct.toFixed(3)}% diff (${diff.mismatchedPixels.toLocaleString()} px > ${TOLERANCE_PCT}% tolerance)`));
    }
  }

  await browser.close();

  writeReport(results);

  console.log();
  console.log(c('bold', '═══ Visual regression summary ═══\n'));
  console.log(c('dim', 'Archetype       Viewport     Verdict          Diff %      Pixels off'));
  console.log(c('dim', '─'.repeat(80)));
  for (const r of results) {
    const vp = `${r.viewport.width}×${r.viewport.height}`.padEnd(11);
    let verdict, dpct, mpx;
    if (r.error) {
      verdict = c('red', 'ERROR        '); dpct = '—       '; mpx = '—';
    } else if (r.updated) {
      verdict = c('cyan', 'UPDATED      '); dpct = '—       '; mpx = '—';
    } else if (r.diffPct <= TOLERANCE_PCT) {
      verdict = c('green', 'PASS         '); dpct = `${r.diffPct.toFixed(3)}%`.padEnd(8); mpx = r.mismatchedPixels.toLocaleString();
    } else {
      verdict = c('red', 'FAIL         '); dpct = `${r.diffPct.toFixed(3)}%`.padEnd(8); mpx = r.mismatchedPixels.toLocaleString();
    }
    console.log(`${r.key.padEnd(14)}  ${vp}  ${verdict}    ${dpct}    ${mpx}`);
  }
  console.log();
  console.log(c('dim', `report: ${path.relative(process.cwd(), REPORT_PATH)}`));

  const anyFail = results.some(r => r.error || (r.diffPct !== undefined && r.diffPct > TOLERANCE_PCT));
  if (UPDATE_BASELINES) {
    console.log(c('cyan', c('bold', '\nBaselines updated. Commit the new PNGs.\n')));
    process.exit(0);
  }
  console.log(anyFail ? c('red', c('bold', 'VISUAL DRIFT DETECTED — review the report.\n')) : c('green', c('bold', 'ALL VISUAL CHECKS PASSED\n')));
  process.exit(anyFail ? 1 : 0);
}

main().catch(e => {
  console.error(c('red', `unhandled error: ${e.stack || e}`));
  process.exit(2);
});
