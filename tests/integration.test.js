#!/usr/bin/env node
/**
 * Skill-authoring integration test for the PPLX Chart System.
 *
 * Purpose: simulate exactly what a skill does when it integrates with the
 * live system, and fail loudly if the contract is broken.
 *
 * Pipeline per archetype:
 *   1. Fetch manifest.json from the live Pages URL
 *   2. For each archetype, fetch its template_url
 *   3. Strip HTML comments (so {{ name }} examples in docs don't count)
 *   4. Expand any handlebars-style {{#each xs}} ... {{/each}} and
 *      {{#if k}} ... {{/if}} blocks using the synthetic fixture
 *   5. Substitute every {{ key }} with the fixture value
 *   6. Check: any remaining {{...}} = missing placeholder (fail)
 *   7. Check: rendered HTML contains the PPLX 2026 mark
 *      (an inline <svg ... viewBox="0 0 254 275"> with a single <path>)
 *
 * Independently, every URL listed under manifest.assets is HEAD-checked.
 *
 * Run:    node tests/integration.test.js
 * Or:     npm test
 * Exit:   0 on all-pass, 1 on any failure.
 *
 * Zero dependencies. Node 18+ for the global fetch.
 */

'use strict';

const {
  FIXTURES,
  PLACEHOLDER_REGEX,
  PPLX_MARK_REGEX,
  render,
} = require('./_template');

const MANIFEST_URL =
  process.env.MANIFEST_URL ||
  'https://phi-pplx.github.io/pplx-chart-system/manifest.json';

const C = {
  reset: '\x1b[0m', dim: '\x1b[2m', bold: '\x1b[1m',
  green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m', cyan: '\x1b[36m',
};
const NO_COLOR = process.env.NO_COLOR || !process.stdout.isTTY;
const c = (color, s) => (NO_COLOR ? s : C[color] + s + C.reset);

async function checkUrls(urls) {
  const results = new Map();
  const queue = [...urls];
  const workers = Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const u = queue.shift();
      try {
        const r = await fetch(u, { method: 'HEAD' });
        results.set(u, { ok: r.ok, status: r.status });
      } catch (e) {
        results.set(u, { ok: false, status: 'NET-ERR', error: e.message });
      }
    }
  });
  await Promise.all(workers);
  return results;
}

function collectAssetUrls(manifest) {
  const urls = new Set();
  const a = manifest.assets || {};
  for (const v of Object.values(a)) {
    if (typeof v === 'string') urls.add(v);
    else if (v && typeof v === 'object') {
      for (const v2 of Object.values(v)) if (typeof v2 === 'string') urls.add(v2);
    }
  }
  for (const [, def] of Object.entries(manifest.archetypes || {})) {
    if (def.template_url) urls.add(def.template_url);
  }
  return [...urls];
}

async function main() {
  console.log(c('bold', '\nPPLX Chart System · skill integration test'));
  console.log(c('dim', `manifest: ${MANIFEST_URL}\n`));

  let manifest;
  try {
    const r = await fetch(MANIFEST_URL);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    manifest = await r.json();
  } catch (e) {
    console.error(c('red', `FATAL: cannot fetch manifest: ${e.message}`));
    process.exit(1);
  }
  console.log(c('dim', `manifest version: ${manifest.version} · ${Object.keys(manifest.archetypes).length} archetypes\n`));

  const archetypeResults = [];
  for (const [key, def] of Object.entries(manifest.archetypes)) {
    const r = { key, name: def.name, template_url: def.template_url, checks: {} };
    archetypeResults.push(r);

    if (!def.template_url) {
      r.checks.fetch = { pass: false, detail: 'no template_url in manifest' };
      continue;
    }

    let tmpl;
    try {
      const res = await fetch(def.template_url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      tmpl = await res.text();
      r.checks.fetch = { pass: true };
    } catch (e) {
      r.checks.fetch = { pass: false, detail: e.message };
      continue;
    }

    const fixture = FIXTURES[key];
    if (!fixture) {
      r.checks.fixture = { pass: false, detail: `no fixture defined for "${key}"` };
      continue;
    }
    r.checks.fixture = { pass: true };

    let rendered;
    try {
      rendered = render(tmpl, fixture);
    } catch (e) {
      r.checks.render = { pass: false, detail: e.message };
      continue;
    }
    r.checks.render = { pass: true };

    const remaining = [...rendered.matchAll(PLACEHOLDER_REGEX)].map(m => m[1].trim());
    const uniqueMissing = [...new Set(remaining)];
    r.checks.placeholders = {
      pass: uniqueMissing.length === 0,
      detail: uniqueMissing.length === 0 ? 'all substituted' : `missing: ${uniqueMissing.join(', ')}`,
      missing: uniqueMissing,
    };

    r.checks.mark = {
      pass: PPLX_MARK_REGEX.test(rendered),
      detail: PPLX_MARK_REGEX.test(rendered)
        ? 'inline SVG viewBox 254×275 present'
        : 'PPLX 2026 mark NOT found in rendered HTML',
    };

    r.rendered_length = rendered.length;
  }

  const assetUrls = collectAssetUrls(manifest);
  console.log(c('dim', `checking ${assetUrls.length} asset URLs...\n`));
  const urlResults = await checkUrls(assetUrls);

  console.log(c('bold', '═══ Archetype results ═══\n'));
  console.log(c('dim', 'Archetype       Fetch  Render  Placeh.  Mark   Size    Notes'));
  console.log(c('dim', '─'.repeat(96)));

  let archAllPass = true;
  for (const r of archetypeResults) {
    const f = r.checks.fetch?.pass ? c('green', 'PASS ') : c('red', 'FAIL ');
    const rd = r.checks.render?.pass ? c('green', 'PASS  ') : (r.checks.render ? c('red', 'FAIL  ') : c('dim', ' —    '));
    const ph = r.checks.placeholders
      ? r.checks.placeholders.pass ? c('green', 'PASS   ') : c('red', 'FAIL   ')
      : c('dim', ' —     ');
    const mk = r.checks.mark
      ? r.checks.mark.pass ? c('green', 'PASS') : c('red', 'FAIL')
      : c('dim', ' — ');
    const sz = r.rendered_length ? String(r.rendered_length).padStart(6) : c('dim', '   — ');
    const failed = !r.checks.fetch?.pass || !r.checks.render?.pass
      || !r.checks.placeholders?.pass || !r.checks.mark?.pass;
    const note = failed
      ? c('yellow', [
          !r.checks.fetch?.pass && `fetch:${r.checks.fetch.detail}`,
          !r.checks.render?.pass && `render:${r.checks.render?.detail}`,
          !r.checks.placeholders?.pass && r.checks.placeholders?.detail,
          !r.checks.mark?.pass && r.checks.mark?.detail,
        ].filter(Boolean).join(' · '))
      : '';
    if (failed) archAllPass = false;
    console.log(`${r.key.padEnd(14)}  ${f}  ${rd}  ${ph}  ${mk}   ${sz}  ${note}`);
  }

  console.log();
  console.log(c('bold', '═══ Asset URL liveness ═══\n'));
  console.log(c('dim', 'Status  URL'));
  console.log(c('dim', '─'.repeat(96)));
  let urlAllPass = true;
  for (const u of [...urlResults.keys()].sort()) {
    const v = urlResults.get(u);
    const status = v.ok ? c('green', String(v.status).padEnd(6)) : c('red', String(v.status).padEnd(6));
    if (!v.ok) urlAllPass = false;
    console.log(`${status}  ${u}`);
  }

  console.log();
  console.log(c('bold', '═══ Summary ═══'));
  const archPassN = archetypeResults.filter(r =>
    r.checks.fetch?.pass && r.checks.render?.pass && r.checks.placeholders?.pass && r.checks.mark?.pass
  ).length;
  const urlPassN = [...urlResults.values()].filter(v => v.ok).length;
  console.log(`Archetypes: ${archPassN}/${archetypeResults.length} passed all checks`);
  console.log(`Asset URLs: ${urlPassN}/${urlResults.size} returned 2xx`);
  const ok = archAllPass && urlAllPass;
  console.log();
  console.log(ok ? c('green', c('bold', 'ALL CHECKS PASSED')) : c('red', c('bold', 'FAILURES PRESENT — review notes above')));
  console.log();
  process.exit(ok ? 0 : 1);
}

main().catch(e => {
  console.error(c('red', `unhandled error: ${e.stack || e}`));
  process.exit(2);
});
