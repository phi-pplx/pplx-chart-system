// Spacing audit for the ranked scorecard. Same harness logic as
// measure.cjs but with a measureScorecard() function that walks the
// component's anatomy.

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCALE = [4, 8, 14, 20, 28, 40, 56, 80, 112];
const TOKEN_NAMES = { 4: '--s-1', 8: '--s-2', 14: '--s-3', 20: '--s-4', 28: '--s-5', 40: '--s-6', 56: '--s-7', 80: '--s-8', 112: '--s-9' };
const FLOOR = 20;

function nearestToken(px) {
  let best = SCALE[0], dist = Math.abs(px - SCALE[0]);
  for (const v of SCALE) {
    const d = Math.abs(px - v);
    if (d < dist) { dist = d; best = v; }
  }
  return { value: best, name: TOKEN_NAMES[best], drift: px - best };
}
// Layout gaps must clear the --s-4 floor.
// Intra-label gaps (arrow→text inside a single visual unit, name→sub-label
// inside a single cell) are exempt and classified separately.
function classify(px, isIntraLabel = false) {
  if (px <= 0) return 'zero';
  if (isIntraLabel) {
    return SCALE.some(v => Math.abs(v - px) <= 2) ? 'intra_label_on_scale' : 'intra_label_off_scale';
  }
  if (px < FLOOR) return 'BELOW_FLOOR';
  return SCALE.some(v => Math.abs(v - px) <= 2) ? 'on_scale' : 'off_scale';
}

async function measureScorecard(page) {
  return await page.evaluate(() => {
    const m = [];
    const px = v => parseFloat(v);

    const frame = document.querySelector('.frame');
    const header = document.querySelector('.header');
    const title = document.querySelector('.title');
    const subtitle = document.querySelector('.subtitle');
    const sectionLabel = document.querySelector('.section-label');
    const chartWrap = document.querySelector('.chart-wrap');
    const colHeaderRow = document.querySelector('.col-header-row');
    const colHeaders = [...document.querySelectorAll('.col-header')];
    const tbody = document.querySelector('.tbody');
    const rows = [...tbody.querySelectorAll('.row')];
    const axisKey = document.querySelector('.axis-key');
    const footer = document.querySelector('.footer');

    const fcs = getComputedStyle(frame);
    const hcs = getComputedStyle(header);
    const tcs = getComputedStyle(tbody);
    const cwcs = getComputedStyle(chartWrap);

    // ── Frame: padding (all sides) + row-gap ──
    m.push({ label: 'Frame · padding (all sides)',  role: 'chart-to-border clearance', px: px(fcs.paddingTop) });
    m.push({ label: 'Frame · row-gap',              role: 'major block spacing',       px: px(fcs.rowGap) });

    // ── Header internal ──
    m.push({ label: 'Header · padding-bottom (rule clearance)', role: 'title bar internal', px: px(hcs.paddingBottom) });
    m.push({ label: 'Header · padding-right (mark clearance)',  role: 'title-to-mark gap',  px: px(hcs.paddingRight) });

    // Title text-end → mark-start
    const tr = title.getBoundingClientRect();
    const mr = document.querySelector('.mark').getBoundingClientRect();
    m.push({ label: 'Title text-end → mark-start', role: 'horizontal label gap', px: mr.left - tr.right });

    // Subtitle margin-top
    m.push({ label: 'Subtitle · margin-top', role: 'title→subtitle gap', px: px(getComputedStyle(subtitle).marginTop) });

    // ── Chart-wrap nested grid ──
    m.push({ label: 'Chart-wrap · row-gap', role: 'col-header → tbody → axis-key gap', px: px(cwcs.rowGap) });

    // ── Column header internal padding-bottom + table-rule clearance ──
    m.push({ label: 'Col-header · padding-bottom (rule clearance)', role: 'header→data rule', px: px(getComputedStyle(colHeaders[0]).paddingBottom) });

    // ── Table body row-gap ──
    m.push({ label: 'Tbody · row-gap', role: 'inter-row gap', px: px(tcs.rowGap) });

    // ── Row column-gap ──
    const rowCs = getComputedStyle(rows[0]);
    m.push({ label: 'Row · column-gap', role: 'inter-column gap (table cells)', px: px(rowCs.columnGap) });

    // ── Row padding (vertical breathing inside the row track) ──
    m.push({ label: 'Row · padding-top (internal)', role: 'row track padding', px: px(rowCs.paddingTop) });
    m.push({ label: 'Row · padding-bottom (internal)', role: 'row track padding', px: px(rowCs.paddingBottom) });

    // ── Inter-row visual gap (measured edge-to-edge) ──
    if (rows.length > 1) {
      const r0 = rows[0].getBoundingClientRect();
      const r1 = rows[1].getBoundingClientRect();
      m.push({ label: 'Row 0 bottom → Row 1 top (visual)', role: 'inter-row visual gap', px: r1.top - r0.bottom });
    }

    // ── Model cell · internal name→org row-gap (INTRA-LABEL) ──
    const modelCell = rows[0].querySelector('.cell-model');
    m.push({ label: 'Model cell · row-gap (name→org)', role: 'model cell stack', px: px(getComputedStyle(modelCell).rowGap), intraLabel: true });

    // ── Delta cell · arrow→text gap (INTRA-LABEL) ──
    const deltaCell = rows[0].querySelector('.cell-delta');
    m.push({ label: 'Delta cell · gap (arrow→text)', role: 'delta cell internal', px: px(getComputedStyle(deltaCell).gap), intraLabel: true });

    // ── Axis-key padding-top (rule clearance below tbody) ──
    m.push({ label: 'Axis-key · padding-top (rule clearance)', role: 'tbody→axis rule', px: px(getComputedStyle(axisKey).paddingTop) });
    m.push({ label: 'Axis-key · column-gap', role: 'axis-key columns', px: px(getComputedStyle(axisKey).columnGap) });

    // ── Last row bottom → axis-key top (measured) ──
    const lastRow = rows[rows.length - 1].getBoundingClientRect();
    const axR = axisKey.getBoundingClientRect();
    m.push({ label: 'Last row bottom → axis-key top', role: 'tbody→axis-key gap', px: axR.top - lastRow.bottom });

    // ── Footer · padding-top (rule clearance) ──
    m.push({ label: 'Footer · padding-top (rule clearance)', role: 'footer rule→text', px: px(getComputedStyle(footer).paddingTop) });
    m.push({ label: 'Footer · gap (between text spans)', role: 'footer item gap', px: px(getComputedStyle(footer).gap) });

    // ── Cross-section measured gaps ──
    const headerR = header.getBoundingClientRect();
    const slR = sectionLabel.getBoundingClientRect();
    m.push({ label: 'Header bottom → section-label top', role: 'header→section gap', px: slR.top - headerR.bottom });

    const cwR = chartWrap.getBoundingClientRect();
    m.push({ label: 'Section-label bottom → chart-wrap top', role: 'section→chart gap', px: cwR.top - slR.bottom });

    const footerR = footer.getBoundingClientRect();
    m.push({ label: 'Chart-wrap bottom → footer top', role: 'chart→footer gap', px: footerR.top - cwR.bottom });

    return m;
  });
}

async function run(file, label) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 1700 });
  await page.goto('file://' + path.resolve(file), { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const ms = await measureScorecard(page);
  await browser.close();

  // Classify + token-snap
  const annotated = ms.map(item => ({
    ...item,
    classification: classify(item.px, item.intraLabel),
    nearest_token: nearestToken(item.px)
  }));

  fs.writeFileSync('/home/user/workspace/chart-spacing-audit/ranked-scorecard.json', JSON.stringify(annotated, null, 2));

  console.log(`\n══════ ${label} ══════`);
  let pass = 0, warn = 0, fail = 0, intra = 0;
  annotated.forEach(item => {
    let icon;
    switch (item.classification) {
      case 'BELOW_FLOOR': icon = '✗'; fail++; break;
      case 'off_scale': icon = '⚠'; warn++; break;
      case 'intra_label_on_scale': icon = '·'; intra++; break;
      case 'intra_label_off_scale': icon = '·⚠'; intra++; break;
      default: icon = '✓'; pass++;
    }
    const note = item.intraLabel ? ' [intra-label]' : '';
    console.log(`  ${icon.padEnd(2)} ${item.px.toFixed(1).padStart(6)}px  ${item.label.padEnd(48)} → ${item.nearest_token.name.padEnd(5)} (${item.nearest_token.value}px)${note}`);
  });
  console.log(`\n  ─── layout pass ${pass} · warn ${warn} · BELOW FLOOR ${fail} · intra-label ${intra} ───`);
  return { pass, warn, fail, intra, annotated };
}

(async () => {
  const result = await run(
    '/home/user/workspace/chart-spacing-audit/03-ranked-scorecard.fixed.html',
    'ranked-scorecard'
  );

  if (result.fail === 0 && result.warn === 0) {
    console.log('\n✓ Zero sub-floor violations. All layout gaps on scale. Intra-label gaps tracked separately.');
    console.log('✓ Grid-stack pattern holds for this non-chart component.');
  } else if (result.fail === 0) {
    console.log('\n⚠ No sub-floor violations, but some layout values are off-scale.');
  } else {
    console.log('\n✗ Has sub-floor violations — fix required.');
    process.exit(1);
  }
})();
