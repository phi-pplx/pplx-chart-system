// Spacing audit harness — measures every internal padding, gap, and
// clearance on the snippet-bar and frontier-line charts. Compares each
// value against the system spacing scale and flags everything below
// --s-4 (20px). Writes JSON findings + annotation coords for later overlay.

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCALE = [4, 8, 14, 20, 28, 40, 56, 80, 112];
const TOKEN_NAMES = { 4: '--s-1', 8: '--s-2', 14: '--s-3', 20: '--s-4', 28: '--s-5', 40: '--s-6', 56: '--s-7', 80: '--s-8', 112: '--s-9' };
const FLOOR = 20; // --s-4 floor

function nearestToken(px) {
  let best = SCALE[0], dist = Math.abs(px - SCALE[0]);
  for (const v of SCALE) {
    const d = Math.abs(px - v);
    if (d < dist) { dist = d; best = v; }
  }
  return { value: best, name: TOKEN_NAMES[best], drift: px - best };
}

function classify(px) {
  if (px <= 0) return 'zero';
  if (px < FLOOR) return 'BELOW_FLOOR';
  // within 2px of any scale value = on-scale
  const onScale = SCALE.some(v => Math.abs(v - px) <= 2);
  return onScale ? 'on_scale' : 'off_scale';
}

async function measureSnippetBar(page) {
  return await page.evaluate(() => {
    const m = []; // measurements
    const pick = (el, label, role, target = null) => {
      if (!el) { m.push({ label, role, error: 'missing element' }); return; }
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { el, cs, r, label, role };
    };
    const px = v => parseFloat(v);

    const frame = document.querySelector('.frame');
    const header = document.querySelector('.header');
    const title = document.querySelector('.title');
    const sectionLabel = document.querySelector('.section-label');
    const chartWrap = document.querySelector('.chart-wrap');
    const chart = document.querySelector('#chart');
    const rows = [...document.querySelectorAll('.row')];
    const xaxis = document.querySelector('.xaxis');
    const xlabel = document.querySelector('.xlabel');
    const footer = document.querySelector('.footer');
    const mark = document.querySelector('.mark');

    const fr = frame.getBoundingClientRect();
    const fcs = getComputedStyle(frame);

    // ────── Frame internal padding ──────
    m.push({
      label: 'Frame · padding-top',
      role: 'chart-to-border clearance (top)',
      px: px(fcs.paddingTop), source: 'computed'
    });
    m.push({
      label: 'Frame · padding-right',
      role: 'chart-to-border clearance (right)',
      px: px(fcs.paddingRight), source: 'computed'
    });
    m.push({
      label: 'Frame · padding-bottom',
      role: 'chart-to-border clearance (bottom)',
      px: px(fcs.paddingBottom), source: 'computed'
    });
    m.push({
      label: 'Frame · padding-left',
      role: 'chart-to-border clearance (left)',
      px: px(fcs.paddingLeft), source: 'computed'
    });

    // ────── Header anatomy ──────
    const hcs = getComputedStyle(header);
    m.push({ label: 'Header · padding-bottom (rule clearance)', role: 'title bar internal', px: px(hcs.paddingBottom), source: 'computed' });
    m.push({ label: 'Header · padding-right (mark clearance)', role: 'title-to-mark gap', px: px(hcs.paddingRight), source: 'computed' });

    // Title → mark horizontal gap (measured)
    const tr = title.getBoundingClientRect();
    const mr = mark.getBoundingClientRect();
    m.push({ label: 'Title text-end → mark-start', role: 'horizontal label gap', px: mr.left - tr.right, source: 'measured', visual: { x: tr.right, y: tr.top, w: mr.left - tr.right, h: tr.height } });

    // ────── Header → section label ──────
    const slcs = getComputedStyle(sectionLabel);
    const slR = sectionLabel.getBoundingClientRect();
    const hR = header.getBoundingClientRect();
    m.push({ label: 'Header bottom → section-label top', role: 'header→content gap', px: slR.top - hR.bottom, source: 'measured', visual: { x: hR.left, y: hR.bottom, w: hR.width, h: slR.top - hR.bottom } });
    m.push({ label: 'Section-label · margin-top', role: 'CSS spec margin', px: px(slcs.marginTop), source: 'computed' });
    m.push({ label: 'Section-label · margin-bottom', role: 'CSS spec margin', px: px(slcs.marginBottom), source: 'computed' });

    // ────── Section label → chart top ──────
    const cwR = chartWrap.getBoundingClientRect();
    const cwcs = getComputedStyle(chartWrap);
    m.push({ label: 'Section-label bottom → chart-wrap top', role: 'label→chart gap', px: cwR.top - slR.bottom, source: 'measured', visual: { x: cwR.left, y: slR.bottom, w: cwR.width, h: cwR.top - slR.bottom } });
    m.push({ label: 'Chart-wrap · margin-top', role: 'CSS spec margin', px: px(cwcs.marginTop), source: 'computed' });

    // ────── Row anatomy (bar geometry) ──────
    const rcs = getComputedStyle(rows[0]);
    const rH = rows[0].getBoundingClientRect().height;
    m.push({ label: 'Row · height', role: 'row track', px: rH, source: 'computed' });
    const barwrap = rows[0].querySelector('.barwrap');
    const bcs = getComputedStyle(barwrap);
    const barH = parseFloat(bcs.height);
    m.push({ label: 'Bar · height', role: 'bar track', px: barH, source: 'computed' });
    const barGap = (rH - barH) / 2;
    m.push({ label: 'Bar top/bottom inset within row', role: 'bar→row whitespace', px: barGap, source: 'computed' });

    // Row-to-row gap is 0 (rows are grid-stacked). Measure actual inter-bar gap edge-to-edge
    if (rows.length > 1) {
      const r0 = rows[0].querySelector('.barwrap').getBoundingClientRect();
      const r1 = rows[1].querySelector('.barwrap').getBoundingClientRect();
      m.push({ label: 'Bar-to-bar vertical gap (between bar bottoms/tops)', role: 'inter-bar clearance', px: r1.top - r0.bottom, source: 'measured' });
    }

    // Category label → bar gap (cat right edge → bar wrap left edge for negative bars)
    const cat0 = rows[0].querySelector('.cat');
    const catCs = getComputedStyle(cat0);
    m.push({ label: 'Category label · padding-right (cat→bar gap)', role: 'cat→bar gap', px: parseFloat(catCs.paddingRight), source: 'computed' });

    // Inside-bar value label padding
    const val = document.querySelector('.value');
    const vcs = getComputedStyle(val);
    m.push({ label: 'Value label · padding-left/right (inside bar)', role: 'value label inset', px: parseFloat(vcs.paddingLeft), source: 'computed' });
    m.push({ label: 'Value label · font-size', role: 'micro-typo', px: parseFloat(vcs.fontSize), source: 'computed', note: 'type, not spacing' });

    // ────── X-axis ──────
    const lastRow = rows[rows.length - 1];
    const lastBar = lastRow.querySelector('.barwrap').getBoundingClientRect();
    const xR = xaxis.getBoundingClientRect();
    const xcs = getComputedStyle(xaxis);
    m.push({ label: 'Last bar bottom → xaxis top', role: 'chart→axis gap', px: xR.top - lastBar.bottom, source: 'measured', visual: { x: lastBar.left, y: lastBar.bottom, w: lastBar.width, h: xR.top - lastBar.bottom } });
    m.push({ label: 'X-axis · margin-top', role: 'CSS spec', px: parseFloat(xcs.marginTop), source: 'computed' });

    // Tick spacing — measure between two adjacent ticks
    const ticks = [...xaxis.querySelectorAll('.tick')];
    if (ticks.length >= 2) {
      const t0 = ticks[0].getBoundingClientRect();
      const t1 = ticks[1].getBoundingClientRect();
      const tickInterval = (t1.left + t1.width/2) - (t0.left + t0.width/2);
      m.push({ label: 'X-axis tick interval', role: 'tick rhythm', px: tickInterval, source: 'measured', note: 'data-driven, not spacing token' });
      m.push({ label: 'Tick offset (top:10 in CSS)', role: 'tick to axis line', px: parseFloat(getComputedStyle(ticks[0]).top), source: 'computed' });
    }

    // x-label
    const xlR = xlabel.getBoundingClientRect();
    const xlcs = getComputedStyle(xlabel);
    m.push({ label: 'X-axis bottom → xlabel top', role: 'axis→axis-label gap', px: xlR.top - xR.bottom, source: 'measured', visual: { x: xlR.left, y: xR.bottom, w: xlR.width, h: xlR.top - xR.bottom } });
    m.push({ label: 'X-label · margin-top', role: 'CSS spec', px: parseFloat(xlcs.marginTop), source: 'computed' });

    // ────── Footer ──────
    const ftR = footer.getBoundingClientRect();
    const ftcs = getComputedStyle(footer);
    m.push({ label: 'Xlabel bottom → footer top', role: 'content→footer gap', px: ftR.top - xlR.bottom, source: 'measured', visual: { x: ftR.left, y: xlR.bottom, w: ftR.width, h: ftR.top - xlR.bottom } });
    m.push({ label: 'Footer · padding-top (rule clearance)', role: 'footer rule→text gap', px: parseFloat(ftcs.paddingTop), source: 'computed' });
    m.push({ label: 'Footer · gap', role: 'footer item gap', px: parseFloat(ftcs.gap || '0'), source: 'computed' });

    return m;
  });
}

async function measureFrontierLine(page) {
  return await page.evaluate(() => {
    const m = [];
    const px = v => parseFloat(v);

    const frame = document.querySelector('.frame');
    const header = document.querySelector('.header');
    const title = document.querySelector('.title');
    const mark = document.querySelector('.mark');
    const subtitle = document.querySelector('.subtitle') || document.querySelector('.title-meta');
    const chartWrap = document.querySelector('.chart-wrap') || document.querySelector('svg').parentElement;
    const svg = document.querySelector('svg.chart, svg#chart, svg:not(.mark)');
    const legend = document.querySelector('.legend');
    const footer = document.querySelector('.footer');

    const fr = frame.getBoundingClientRect();
    const fcs = getComputedStyle(frame);

    m.push({ label: 'Frame · padding-top', role: 'chart-to-border (top)', px: px(fcs.paddingTop), source: 'computed' });
    m.push({ label: 'Frame · padding-right', role: 'chart-to-border (right)', px: px(fcs.paddingRight), source: 'computed' });
    m.push({ label: 'Frame · padding-bottom', role: 'chart-to-border (bottom)', px: px(fcs.paddingBottom), source: 'computed' });
    m.push({ label: 'Frame · padding-left', role: 'chart-to-border (left)', px: px(fcs.paddingLeft), source: 'computed' });

    const hcs = getComputedStyle(header);
    m.push({ label: 'Header · padding-bottom (rule clearance)', role: 'title bar internal', px: px(hcs.paddingBottom), source: 'computed' });
    m.push({ label: 'Header · padding-right (mark clearance)', role: 'title-to-mark gap', px: px(hcs.paddingRight), source: 'computed' });

    const tr = title.getBoundingClientRect();
    const mr = mark.getBoundingClientRect();
    m.push({ label: 'Title text-end → mark-start', role: 'horizontal label gap', px: mr.left - tr.right, source: 'measured', visual: { x: tr.right, y: tr.top, w: Math.max(1, mr.left - tr.right), h: tr.height } });

    if (subtitle) {
      const stR = subtitle.getBoundingClientRect();
      m.push({ label: 'Title bottom → subtitle top', role: 'title→subtitle gap', px: stR.top - tr.bottom, source: 'measured', visual: { x: tr.left, y: tr.bottom, w: tr.width, h: stR.top - tr.bottom } });
      m.push({ label: 'Subtitle · margin-top', role: 'CSS spec', px: parseFloat(getComputedStyle(subtitle).marginTop), source: 'computed' });
    }

    // Header → SVG top
    const hR = header.getBoundingClientRect();
    const svgR = svg.getBoundingClientRect();
    m.push({ label: 'Header bottom → SVG top', role: 'header→chart gap', px: svgR.top - hR.bottom, source: 'measured', visual: { x: hR.left, y: hR.bottom, w: hR.width, h: svgR.top - hR.bottom } });

    // SVG PAD inner — read from PAD constant via DOM hint or computed
    // We'll compute by looking at the first y-tick label vs first gridline
    const yTickLabels = [...svg.querySelectorAll('text')].filter(t => /^\d/.test(t.textContent.trim()));
    const gridlines = [...svg.querySelectorAll('line')];
    const allTexts = [...svg.querySelectorAll('text')];

    // First inner gridline x (leftmost horizontal line's x1)
    const hLines = gridlines.filter(l => Math.abs(parseFloat(l.getAttribute('y1')) - parseFloat(l.getAttribute('y2'))) < 0.5);
    if (hLines.length > 0) {
      const innerLeft = Math.min(...hLines.map(l => parseFloat(l.getAttribute('x1'))));
      m.push({ label: 'SVG plot · inner padding-left (data area)', role: 'PAD.left from SVG attrs', px: innerLeft, source: 'computed' });
      const svgW = parseFloat(svg.getAttribute('viewBox')?.split(' ')[2] || svg.getAttribute('width'));
      const innerRight = Math.max(...hLines.map(l => parseFloat(l.getAttribute('x2'))));
      m.push({ label: 'SVG plot · inner padding-right (data area)', role: 'PAD.right from SVG attrs', px: svgW - innerRight, source: 'computed' });
    }
    const vLines = gridlines.filter(l => Math.abs(parseFloat(l.getAttribute('x1')) - parseFloat(l.getAttribute('x2'))) < 0.5);
    if (vLines.length > 0) {
      const innerTop = Math.min(...vLines.map(l => parseFloat(l.getAttribute('y1'))));
      m.push({ label: 'SVG plot · inner padding-top (data area)', role: 'PAD.top from SVG attrs', px: innerTop, source: 'computed' });
      const svgH = parseFloat(svg.getAttribute('viewBox')?.split(' ')[3] || svg.getAttribute('height'));
      const innerBottom = Math.max(...vLines.map(l => parseFloat(l.getAttribute('y2'))));
      m.push({ label: 'SVG plot · inner padding-bottom (data area)', role: 'PAD.bottom from SVG attrs', px: svgH - innerBottom, source: 'computed' });
    }

    // Y-axis tick spacing
    const yLabels = allTexts.filter(t => {
      const txt = t.textContent.trim();
      return /^\d+(\.\d+)?$/.test(txt) && parseFloat(t.getAttribute('x')) < 100;
    });
    if (yLabels.length >= 2) {
      const sorted = yLabels.map(t => parseFloat(t.getAttribute('y'))).sort((a,b)=>a-b);
      const interval = sorted[1] - sorted[0];
      m.push({ label: 'Y-axis tick interval (vertical)', role: 'tick rhythm', px: interval, source: 'measured' });
    }

    // X-axis tick label gap below axis line
    const xAxisLabels = allTexts.filter(t => parseFloat(t.getAttribute('y')) > 800);
    if (xAxisLabels.length >= 2) {
      const sorted = xAxisLabels.map(t => parseFloat(t.getAttribute('x'))).sort((a,b)=>a-b);
      const interval = sorted[1] - sorted[0];
      m.push({ label: 'X-axis tick interval (horizontal)', role: 'tick rhythm', px: interval, source: 'measured' });
    }

    // Legend
    if (legend) {
      const lcs = getComputedStyle(legend);
      m.push({ label: 'Legend · row gap', role: 'legend row gap', px: parseFloat(lcs.rowGap || lcs.gap), source: 'computed' });
      m.push({ label: 'Legend · column gap', role: 'legend column gap', px: parseFloat(lcs.columnGap || lcs.gap), source: 'computed' });
      const items = [...legend.querySelectorAll('.item, .legend-item')];
      if (items.length > 0) {
        m.push({ label: 'Legend item · internal gap (glyph→label)', role: 'legend item internal', px: parseFloat(getComputedStyle(items[0]).gap), source: 'computed' });
      }
      const lR = legend.getBoundingClientRect();
      m.push({ label: 'SVG bottom → legend top', role: 'chart→legend gap', px: lR.top - svgR.bottom, source: 'measured', visual: { x: lR.left, y: svgR.bottom, w: lR.width, h: lR.top - svgR.bottom } });
    }

    if (footer) {
      const ftR = footer.getBoundingClientRect();
      const ftcs = getComputedStyle(footer);
      const prev = legend ? legend.getBoundingClientRect() : svgR;
      m.push({ label: 'Previous block bottom → footer top', role: 'content→footer gap', px: ftR.top - prev.bottom, source: 'measured', visual: { x: ftR.left, y: prev.bottom, w: ftR.width, h: ftR.top - prev.bottom } });
      m.push({ label: 'Footer · padding-top (rule clearance)', role: 'footer rule→text', px: parseFloat(ftcs.paddingTop), source: 'computed' });
    }

    return m;
  });
}

async function run(chartFile, outName, measureFn) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1400, height: 1700 });
  const url = 'file://' + path.resolve(chartFile);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const measurements = await measureFn(page);
  await browser.close();

  // Classify
  const annotated = measurements.map(item => {
    if (item.note === 'type, not spacing' || item.note === 'data-driven, not spacing token') return item;
    if (typeof item.px !== 'number' || isNaN(item.px)) return item;
    return {
      ...item,
      classification: classify(item.px),
      nearest_token: nearestToken(item.px)
    };
  });

  fs.writeFileSync(`/home/user/workspace/chart-spacing-audit/${outName}.json`, JSON.stringify(annotated, null, 2));
  console.log(`\n══════ ${outName} ══════`);

  const violations = annotated.filter(a => a.classification === 'BELOW_FLOOR');
  const offScale  = annotated.filter(a => a.classification === 'off_scale');
  const onScale   = annotated.filter(a => a.classification === 'on_scale');

  console.log(`Total measurements: ${annotated.length}`);
  console.log(`  on scale:   ${onScale.length}`);
  console.log(`  off scale:  ${offScale.length}`);
  console.log(`  BELOW FLOOR (<${FLOOR}px): ${violations.length}`);

  if (violations.length) {
    console.log('\n  ✗ VIOLATIONS (below --s-4 floor):');
    violations.forEach(v => console.log(`    ${v.px.toFixed(1)}px  ${v.label}  (nearest: ${v.nearest_token.name} ${v.nearest_token.value}px, drift ${v.nearest_token.drift.toFixed(1)})`));
  }
  if (offScale.length) {
    console.log('\n  ⚠ OFF SCALE (above floor but not on a token):');
    offScale.forEach(v => console.log(`    ${v.px.toFixed(1)}px  ${v.label}  (nearest: ${v.nearest_token.name} ${v.nearest_token.value}px, drift ${v.nearest_token.drift.toFixed(1)})`));
  }

  return annotated;
}

(async () => {
  await run(
    '/home/user/workspace/pplx-chart-system/01_charts/01-snippet-bar.html',
    'snippet-bar',
    measureSnippetBar
  );
  await run(
    '/home/user/workspace/pplx-chart-system/01_charts/02-frontier-line.html',
    'frontier-line',
    measureFrontierLine
  );
})();
