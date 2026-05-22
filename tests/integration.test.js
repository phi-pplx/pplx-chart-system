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

const MANIFEST_URL =
  process.env.MANIFEST_URL ||
  'https://phi-pplx.github.io/pplx-chart-system/manifest.json';

const PPLX_MARK_REGEX = /<svg[^>]*viewBox=["']0 0 254 275["'][^>]*>[\s\S]*?<path/i;
const PLACEHOLDER_REGEX = /\{\{\s*([^#/][^}]*?)\s*\}\}/g; // skips {{#...}} and {{/...}}
const COMMENT_REGEX = /<!--[\s\S]*?-->/g;

// ----- ANSI for the report -----
const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};
const NO_COLOR = process.env.NO_COLOR || !process.stdout.isTTY;
const c = (color, s) => (NO_COLOR ? s : C[color] + s + C.reset);

// ============================================================
// Fixtures — synthetic data covering every placeholder shape.
// The values are obviously synthetic so they never get mistaken
// for real production output.
// ============================================================
const FIXTURES = {
  A: {
    kicker: 'FIXTURE · sample benchmark',
    title: 'Synthetic A card',
    hero: '42.0',
    hero_unit: '%',
    deck: 'Synthetic deck text for archetype A test fixture, multi-line to exercise wrapping.',
    bar_count: 5,
    bars: [
      { value: '50', label: 'one', height_pct: 100, highlight: false },
      { value: '42', label: 'two', height_pct: 84, highlight: true },
      { value: '31', label: 'three', height_pct: 62 },
      { value: '20', label: 'four', height_pct: 40 },
      { value: '12', label: 'five', height_pct: 24 },
    ],
    footer_left: 'fixture · n=5',
    footer_right: '2026',
  },
  B: {
    kicker: 'FIXTURE · 2x2',
    title: 'Synthetic B card',
    cell_1_label: 'cell one',
    cell_1_value: '0.858',
    cell_1_unit: '',
    cell_1_delta: '+11 vs baseline',
    cell_2_label: 'cell two',
    cell_2_value: '2.0',
    cell_2_unit: '×',
    cell_2_delta: 'vs baseline',
    cell_3_label: 'cell three',
    cell_3_value: '+20',
    cell_3_unit: '%',
    cell_3_delta: 'lift',
    cell_4_label: 'cell four',
    cell_4_value: '−12',
    cell_4_unit: '%',
    cell_4_delta: 'lift',
    footer_left: 'fixture · 4 metrics',
    footer_right: '2026',
  },
  C: {
    kicker: 'FIXTURE · before/after',
    title: 'Synthetic C card',
    hero: '7.5',
    hero_unit: '×',
    deck: 'Synthetic deck text for archetype C test fixture.',
    left_label: 'before',
    left_value: '$0.153',
    right_label: 'after',
    right_value: '$0.020',
    delta_caption: '−87% cost · +11pp accuracy',
    footer_left: 'fixture · b=4',
    footer_right: '2026',
  },
  D: {
    kicker: 'FIXTURE · multi-category',
    title: 'Synthetic D card',
    hero: '+11.5',
    hero_unit: 'pp',
    deck: 'Synthetic deck text for archetype D test fixture, inline with hero.',
    col_count: 7,
    columns: [
      { label: 'b=1', peak: false, dots: [{ mid: false }, { mid: true }, { mid: true }] },
      { label: '2', peak: false, dots: [{ mid: false }, { mid: true }, { mid: true }, { mid: true }] },
      { label: '3', peak: false, dots: [{ mid: false }, { mid: true }, { mid: true }, { mid: true }, { mid: true }] },
      { label: '4', peak: true, dots: [{ mid: false }, { mid: true }, { mid: true }, { mid: true }, { mid: true }, { mid: true }, { hi: true }] },
      { label: '5', peak: false, dots: [{ mid: false }, { mid: true }, { mid: true }, { mid: true }, { mid: true }] },
      { label: '6', peak: false, dots: [{ mid: false }, { mid: true }, { mid: true }, { mid: true }] },
      { label: '7', peak: false, dots: [{ mid: false }, { mid: true }, { mid: true }] },
    ],
    footer_left: 'fixture · 7 budgets',
    footer_right: '2026',
  },
  E: {
    kicker: 'FIXTURE · editorial',
    title: 'Synthetic E card',
    hero: '73.9',
    hero_unit: '%',
    deck: 'Synthetic deck text for archetype E test fixture, multi-line to exercise wrapping.',
    triad_1_label: 'metric one',
    triad_1_value: '$0.02',
    triad_1_unit: '',
    triad_2_label: 'metric two',
    triad_2_value: '4',
    triad_2_unit: '×',
    triad_3_label: 'metric three',
    triad_3_value: '7.5',
    triad_3_unit: '×',
    footer_left: 'fixture · n=3 models',
    footer_right: '2026',
  },
  F: {
    kicker: 'FIXTURE · ranked',
    title: 'Synthetic F card',
    lead_rank: '02',
    lead_name: 'Synthetic-Lead',
    lead_name_soft: '-suffix',
    lead_value: '1136',
    rows: [
      { rank: '01', name: 'Synthetic Row One', value: '1142' },
      { rank: '03', name: 'Synthetic Row Three', value: '1132' },
      { rank: '04', name: 'Synthetic Row Four', value: '1115' },
      { rank: '05', name: 'Synthetic Row Five', value: '1082' },
    ],
    footer_left: 'fixture · 10K votes',
    footer_right: '2026',
  },
  'G-display': {
    kicker: 'FIXTURE · G-display',
    hero: 'Synthetic display headline for the G archetype.',
    footer_left: 'fixture · G',
    footer_right: '2026',
  },
  'G-editorial': {
    kicker: 'FIXTURE · G-editorial',
    title: 'Synthetic editorial title.',
    deck: 'Synthetic deck text for G-editorial test fixture, slightly longer to exercise paragraph rendering.',
    footer_left: 'fixture · G',
    footer_right: '2026',
  },
  'G-quote': {
    kicker: 'FIXTURE · G-quote',
    quote: '\u201cSynthetic quotation for the G-quote test fixture.\u201d',
    attribution: 'Fixture · 2026',
    footer_left: 'fixture · G',
    footer_right: '2026',
  },
};

// ============================================================
// Tiny handlebars-style template expander.
// Supports {{#each xs}} ... {{/each}} and {{#if k}} ... {{/if}}.
// Inside an #each block, the loop variable references the item's
// fields directly: {{ field }} → item.field.
// ============================================================
function expand(template, data) {
  // Greedily walk the template, building a new string. Track scope.
  let out = '';
  let i = 0;
  while (i < template.length) {
    // Look for the next opening block
    const eachMatch = /\{\{#each\s+(\w+)\s*\}\}/.exec(template.slice(i));
    const ifMatch = /\{\{#if\s+(\w+)\s*\}\}/.exec(template.slice(i));
    let next = null;
    if (eachMatch && (!ifMatch || eachMatch.index <= ifMatch.index)) {
      next = { kind: 'each', match: eachMatch };
    } else if (ifMatch) {
      next = { kind: 'if', match: ifMatch };
    }
    if (!next) {
      out += template.slice(i);
      break;
    }
    out += template.slice(i, i + next.match.index);
    const openEnd = i + next.match.index + next.match[0].length;
    const key = next.match[1];
    const closeTag = next.kind === 'each' ? '{{/each}}' : '{{/if}}';
    // Find matching close (balanced, simple — we don't support same-kind nesting deeper than 1)
    const closeIdx = findMatchingClose(template, openEnd, next.kind);
    if (closeIdx === -1) {
      throw new Error(`Unclosed ${next.kind} block for "${key}" in template`);
    }
    const inner = template.slice(openEnd, closeIdx);
    if (next.kind === 'each') {
      const arr = data[key];
      if (!Array.isArray(arr)) {
        // Treat as empty silently — caller will surface missing data
      } else {
        for (const item of arr) {
          // Merge item over parent so loop-local fields shadow outer scope.
          const merged = Object.assign({}, data, item);
          // First recursively expand any nested block helpers.
          // Then substitute scalars against the merged scope so item-scoped
          // placeholders ({{ value }}, {{ label }}, etc.) resolve before
          // we leave this scope.
          out += substitute(expand(inner, merged), merged);
        }
      }
    } else {
      // if: render inner only when key is truthy.
      // Same trick — expand nested blocks, then substitute against current scope.
      if (data[key]) {
        out += substitute(expand(inner, data), data);
      }
    }
    i = closeIdx + closeTag.length;
  }
  return out;
}

function findMatchingClose(template, fromIdx, kind) {
  const openRe = kind === 'each' ? /\{\{#each\s+\w+\s*\}\}/g : /\{\{#if\s+\w+\s*\}\}/g;
  const closeTag = kind === 'each' ? '{{/each}}' : '{{/if}}';
  openRe.lastIndex = fromIdx;
  let depth = 1;
  let cursor = fromIdx;
  while (depth > 0) {
    const nextClose = template.indexOf(closeTag, cursor);
    if (nextClose === -1) return -1;
    openRe.lastIndex = cursor;
    const nextOpen = openRe.exec(template);
    if (nextOpen && nextOpen.index < nextClose) {
      depth++;
      cursor = nextOpen.index + nextOpen[0].length;
    } else {
      depth--;
      if (depth === 0) return nextClose;
      cursor = nextClose + closeTag.length;
    }
  }
  return -1;
}

function substitute(template, data) {
  return template.replace(PLACEHOLDER_REGEX, (m, key) => {
    const k = key.trim();
    if (Object.prototype.hasOwnProperty.call(data, k)) {
      const v = data[k];
      return v == null ? '' : String(v);
    }
    return m; // leave unsubstituted — the test will catch it
  });
}

function stripComments(html) {
  return html.replace(COMMENT_REGEX, '');
}

// ============================================================
// Asset URL checker — concurrent HEAD requests, capped at 8 at a time
// ============================================================
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
      for (const v2 of Object.values(v)) {
        if (typeof v2 === 'string') urls.add(v2);
      }
    }
  }
  for (const [, def] of Object.entries(manifest.archetypes || {})) {
    if (def.template_url) urls.add(def.template_url);
  }
  return [...urls];
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log(c('bold', '\nPPLX Chart System · skill integration test'));
  console.log(c('dim', `manifest: ${MANIFEST_URL}\n`));

  // 1. Fetch manifest
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

  // 2. Per-archetype tests
  const archetypeResults = [];
  for (const [key, def] of Object.entries(manifest.archetypes)) {
    const r = { key, name: def.name, template_url: def.template_url, checks: {} };
    archetypeResults.push(r);

    if (!def.template_url) {
      r.checks.fetch = { pass: false, detail: 'no template_url in manifest' };
      continue;
    }

    // Fetch template
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

    // Strip HTML comments so {{ name }} in docs doesn't count
    const stripped = stripComments(tmpl);

    // Fixture for this archetype
    const fixture = FIXTURES[key];
    if (!fixture) {
      r.checks.fixture = { pass: false, detail: `no fixture defined for "${key}"` };
      continue;
    }
    r.checks.fixture = { pass: true };

    // Expand block helpers, then substitute scalars
    let rendered;
    try {
      const expanded = expand(stripped, fixture);
      rendered = substitute(expanded, fixture);
    } catch (e) {
      r.checks.render = { pass: false, detail: e.message };
      continue;
    }
    r.checks.render = { pass: true };

    // Check 1: any remaining {{...}} = missing placeholder
    const remaining = [...rendered.matchAll(PLACEHOLDER_REGEX)].map(m => m[1].trim());
    const uniqueMissing = [...new Set(remaining)];
    r.checks.placeholders = {
      pass: uniqueMissing.length === 0,
      detail: uniqueMissing.length === 0
        ? `all substituted`
        : `missing: ${uniqueMissing.join(', ')}`,
      missing: uniqueMissing,
    };

    // Check 2: PPLX mark present
    r.checks.mark = {
      pass: PPLX_MARK_REGEX.test(rendered),
      detail: PPLX_MARK_REGEX.test(rendered)
        ? `inline SVG viewBox 254×275 present`
        : `PPLX 2026 mark NOT found in rendered HTML`,
    };

    r.rendered_length = rendered.length;
  }

  // 3. Asset URL liveness
  const assetUrls = collectAssetUrls(manifest);
  console.log(c('dim', `checking ${assetUrls.length} asset URLs...\n`));
  const urlResults = await checkUrls(assetUrls);

  // ============================================================
  // Report
  // ============================================================
  console.log(c('bold', '═══ Archetype results ═══'));
  console.log();
  console.log(
    c('dim', 'Archetype       Fetch  Render  Placeh.  Mark   Size    Notes')
  );
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
    const failed = !r.checks.fetch?.pass
      || !r.checks.render?.pass
      || !r.checks.placeholders?.pass
      || !r.checks.mark?.pass;
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
  console.log(c('bold', '═══ Asset URL liveness ═══'));
  console.log();
  console.log(c('dim', 'Status  URL'));
  console.log(c('dim', '─'.repeat(96)));
  let urlAllPass = true;
  const sortedUrls = [...urlResults.keys()].sort();
  for (const u of sortedUrls) {
    const v = urlResults.get(u);
    const status = v.ok
      ? c('green', String(v.status).padEnd(6))
      : c('red', String(v.status).padEnd(6));
    if (!v.ok) urlAllPass = false;
    console.log(`${status}  ${u}`);
  }

  // Summary
  console.log();
  console.log(c('bold', '═══ Summary ═══'));
  const archPassN = archetypeResults.filter(r =>
    r.checks.fetch?.pass && r.checks.render?.pass && r.checks.placeholders?.pass && r.checks.mark?.pass
  ).length;
  const urlPassN = [...urlResults.values()].filter(v => v.ok).length;
  console.log(
    `Archetypes: ${archPassN}/${archetypeResults.length} passed all checks`
  );
  console.log(
    `Asset URLs: ${urlPassN}/${urlResults.size} returned 2xx`
  );
  const ok = archAllPass && urlAllPass;
  console.log();
  console.log(ok
    ? c('green', c('bold', 'ALL CHECKS PASSED'))
    : c('red', c('bold', 'FAILURES PRESENT — review notes above'))
  );
  console.log();

  process.exit(ok ? 0 : 1);
}

main().catch(e => {
  console.error(c('red', `unhandled error: ${e.stack || e}`));
  process.exit(2);
});
