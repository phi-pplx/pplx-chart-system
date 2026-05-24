// Verify the corrected charts no longer have any sub-floor spacing
const { chromium } = require('playwright');
const path = require('path');

const SCALE = [4, 8, 14, 20, 28, 40, 56, 80, 112];
const TOKEN_NAMES = { 4: '--s-1', 8: '--s-2', 14: '--s-3', 20: '--s-4', 28: '--s-5', 40: '--s-6', 56: '--s-7', 80: '--s-8', 112: '--s-9' };
const FLOOR = 20;
function nearestToken(px) {
  let best = SCALE[0], dist = Math.abs(px - SCALE[0]);
  for (const v of SCALE) { const d = Math.abs(px - v); if (d < dist) { dist = d; best = v; } }
  return { value: best, name: TOKEN_NAMES[best], drift: px - best };
}
function classify(px) {
  if (px <= 0) return 'zero';
  if (px < FLOOR) return 'BELOW_FLOOR';
  return SCALE.some(v => Math.abs(v - px) <= 2) ? 'on_scale' : 'off_scale';
}

async function measureSnippetFixed(page) {
  return await page.evaluate(() => {
    const m = [];
    const px = v => parseFloat(v);
    const frame = document.querySelector('.frame');
    const header = document.querySelector('.header');
    const sectionLabel = document.querySelector('.section-label');
    const chartWrap = document.querySelector('.chart-wrap');
    const rows = [...document.querySelectorAll('.row')];
    const xaxis = document.querySelector('.xaxis');
    const xlabel = document.querySelector('.xlabel');
    const footer = document.querySelector('.footer');
    const fcs = getComputedStyle(frame);
    const hcs = getComputedStyle(header);
    const slR = sectionLabel.getBoundingClientRect();
    const hR = header.getBoundingClientRect();
    const cwR = chartWrap.getBoundingClientRect();
    const xR = xaxis.getBoundingClientRect();
    const xlR = xlabel.getBoundingClientRect();
    const ftR = footer.getBoundingClientRect();
    const lastBar = rows[rows.length - 1].querySelector('.barwrap').getBoundingClientRect();
    const val = document.querySelector('.value');
    const vcs = getComputedStyle(val);
    const ticks = [...xaxis.querySelectorAll('.tick')];

    m.push({ label: 'Frame · padding (all sides)', px: px(fcs.paddingTop) });
    m.push({ label: 'Frame · row-gap', px: px(fcs.rowGap) });
    m.push({ label: 'Header · padding-bottom (rule clearance)', px: px(hcs.paddingBottom) });
    m.push({ label: 'Header bottom → section-label top', px: slR.top - hR.bottom });
    m.push({ label: 'Section-label bottom → chart-wrap top', px: cwR.top - slR.bottom });
    m.push({ label: 'Chart-wrap · row-gap', px: px(getComputedStyle(chartWrap).rowGap) });
    m.push({ label: 'Value label · padding (inside bar)', px: px(vcs.paddingLeft) });
    m.push({ label: 'Cat label · padding-right', px: px(getComputedStyle(rows[0].querySelector('.cat')).paddingRight) });
    m.push({ label: 'Tick offset (was 10px)', px: px(getComputedStyle(ticks[0]).top) });
    m.push({ label: 'X-axis bottom → xlabel top', px: xlR.top - xR.bottom });
    m.push({ label: 'Xlabel bottom → footer top', px: ftR.top - xlR.bottom });
    m.push({ label: 'Footer · padding-top (rule clearance)', px: px(getComputedStyle(footer).paddingTop) });
    m.push({ label: 'Footer · gap', px: px(getComputedStyle(footer).gap) });
    return m;
  });
}

async function measureFrontierFixed(page) {
  return await page.evaluate(() => {
    const m = [];
    const px = v => parseFloat(v);
    const frame = document.querySelector('.frame');
    const header = document.querySelector('.header');
    const title = document.querySelector('.title');
    const subtitle = document.querySelector('.subtitle');
    const svg = document.querySelector('svg.chart');
    const legend = document.querySelector('.legend');
    const footer = document.querySelector('.footer');
    const fcs = getComputedStyle(frame);
    const hcs = getComputedStyle(header);

    m.push({ label: 'Frame · padding', px: px(fcs.paddingTop) });
    m.push({ label: 'Frame · row-gap', px: px(fcs.rowGap) });
    m.push({ label: 'Header · padding-bottom (rule clearance)', px: px(hcs.paddingBottom) });
    if (subtitle) m.push({ label: 'Subtitle · margin-top', px: px(getComputedStyle(subtitle).marginTop) });

    // SVG PAD measurement
    const vbWidth = svg.viewBox?.baseVal?.width || 1236;
    const vbHeight = svg.viewBox?.baseVal?.height || 1100;
    const hLines = [...svg.querySelectorAll('line')].filter(l => Math.abs(parseFloat(l.getAttribute('y1')) - parseFloat(l.getAttribute('y2'))) < 0.5);
    if (hLines.length > 0) {
      m.push({ label: 'SVG plot · PAD.left', px: Math.min(...hLines.map(l => parseFloat(l.getAttribute('x1')))) });
      m.push({ label: 'SVG plot · PAD.right', px: vbWidth - Math.max(...hLines.map(l => parseFloat(l.getAttribute('x2')))) });
    }
    const vLines = [...svg.querySelectorAll('line')].filter(l => Math.abs(parseFloat(l.getAttribute('x1')) - parseFloat(l.getAttribute('x2'))) < 0.5);
    if (vLines.length > 0) {
      m.push({ label: 'SVG plot · PAD.top', px: Math.min(...vLines.map(l => parseFloat(l.getAttribute('y1')))) });
      m.push({ label: 'SVG plot · PAD.bottom', px: vbHeight - Math.max(...vLines.map(l => parseFloat(l.getAttribute('y2')))) });
    }

    const lcs = getComputedStyle(legend);
    m.push({ label: 'Legend · row-gap', px: px(lcs.rowGap) });
    m.push({ label: 'Legend · column-gap', px: px(lcs.columnGap) });
    const item = legend.querySelector('.item');
    if (item) m.push({ label: 'Legend item · gap (glyph→label)', px: px(getComputedStyle(item).gap) });

    m.push({ label: 'Footer · padding-top', px: px(getComputedStyle(footer).paddingTop) });
    return m;
  });
}

async function run(file, label, measureFn) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 1700 });
  await page.goto('file://' + path.resolve(file), { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const ms = await measureFn(page);
  await browser.close();

  console.log(`\n══ ${label} ══`);
  let pass = 0, warn = 0, fail = 0;
  ms.forEach(item => {
    const cls = classify(item.px);
    const nt = nearestToken(item.px);
    const icon = cls === 'BELOW_FLOOR' ? '✗' : cls === 'off_scale' ? '⚠' : '✓';
    if (cls === 'BELOW_FLOOR') fail++;
    else if (cls === 'off_scale') warn++;
    else pass++;
    console.log(`  ${icon} ${item.px.toFixed(1)}px  ${item.label}  → ${nt.name} (${nt.value}px)`);
  });
  console.log(`  ─────  pass ${pass} · warn ${warn} · fail ${fail}`);
  return { pass, warn, fail };
}

(async () => {
  const a = await run('/home/user/workspace/chart-spacing-audit/01-snippet-bar.fixed.html', 'snippet-bar · FIXED', measureSnippetFixed);
  const b = await run('/home/user/workspace/chart-spacing-audit/02-frontier-line.fixed.html', 'frontier-line · FIXED', measureFrontierFixed);
  console.log(`\nOverall: pass ${a.pass + b.pass} · warn ${a.warn + b.warn} · fail ${a.fail + b.fail}`);
})();
