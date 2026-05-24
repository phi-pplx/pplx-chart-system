// Audit the toolkit landing page against the same floor rule
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
function classify(px, isIntraLabel = false) {
  if (px <= 0) return 'zero';
  if (isIntraLabel) return SCALE.some(v => Math.abs(v - px) <= 2) ? 'intra_label_on_scale' : 'intra_label_off_scale';
  if (px < FLOOR) return 'BELOW_FLOOR';
  return SCALE.some(v => Math.abs(v - px) <= 2) ? 'on_scale' : 'off_scale';
}

async function measurePage(page) {
  return await page.evaluate(() => {
    const m = [];
    const px = v => parseFloat(v);

    // Page-level container
    const main = document.querySelector('main.page');
    const mcs = getComputedStyle(main);
    m.push({ label: 'Page · padding-top',    role: 'page outer', px: px(mcs.paddingTop) });
    m.push({ label: 'Page · padding-right',  role: 'page outer', px: px(mcs.paddingRight) });
    m.push({ label: 'Page · padding-bottom', role: 'page outer', px: px(mcs.paddingBottom) });
    m.push({ label: 'Page · padding-left',   role: 'page outer', px: px(mcs.paddingLeft) });
    m.push({ label: 'Page · row-gap (section→section)', role: 'page rhythm', px: px(mcs.rowGap) });

    // Hero
    const hero = document.querySelector('.hero');
    m.push({ label: 'Hero · row-gap', role: 'hero internal', px: px(getComputedStyle(hero).rowGap) });

    // Section heads
    const sections = [...document.querySelectorAll('section.section')];
    sections.forEach((s, i) => {
      const cs = getComputedStyle(s);
      m.push({ label: `Section ${i+1} · row-gap (head→body)`, role: 'section internal', px: px(cs.rowGap) });
      const head = s.querySelector('.section-head');
      if (head) {
        const hcs = getComputedStyle(head);
        m.push({ label: `Section ${i+1} · head row-gap (tag→title)`, role: 'head internal', px: px(hcs.rowGap) });
        m.push({ label: `Section ${i+1} · head padding-bottom (rule clearance)`, role: 'head rule', px: px(hcs.paddingBottom) });
      }
    });

    // Pair (before/after)
    const pair = document.querySelector('.pair');
    if (pair) {
      const pcs = getComputedStyle(pair);
      m.push({ label: 'Pair · column-gap', role: 'before/after gap', px: px(pcs.columnGap) });
      m.push({ label: 'Pair · row-gap',    role: 'before/after gap', px: px(pcs.rowGap) });
      const pcard = pair.querySelector('.pair-card');
      if (pcard) m.push({ label: 'Pair-card · row-gap (label→img→caption)', role: 'pair internal', px: px(getComputedStyle(pcard).rowGap) });
    }

    // Rules grid (2x2)
    const rules = document.querySelector('.rules');
    if (rules) {
      const rcs = getComputedStyle(rules);
      m.push({ label: 'Rules grid · column-gap', role: 'rule card gap', px: px(rcs.columnGap) });
      m.push({ label: 'Rules grid · row-gap',    role: 'rule card gap', px: px(rcs.rowGap) });
      const rule = rules.querySelector('.rule');
      m.push({ label: 'Rule card · row-gap (num→title→body)', role: 'rule internal', px: px(getComputedStyle(rule).rowGap) });
      m.push({ label: 'Rule card · padding', role: 'rule internal padding', px: px(getComputedStyle(rule).paddingTop) });
    }

    // Catalog
    const catalog = document.querySelector('.catalog');
    if (catalog) {
      m.push({ label: 'Catalog · row-gap (card→card)', role: 'catalog rhythm', px: px(getComputedStyle(catalog).rowGap) });
      const card = catalog.querySelector('.cat-card');
      const ccs = getComputedStyle(card);
      m.push({ label: 'Cat-card · column-gap (img→meta)', role: 'card internal', px: px(ccs.columnGap) });
      m.push({ label: 'Cat-card · padding', role: 'card internal padding', px: px(ccs.paddingTop) });
      const meta = card.querySelector('.cat-meta');
      m.push({ label: 'Cat-card · meta row-gap', role: 'card meta stack', px: px(getComputedStyle(meta).rowGap) });
      const links = card.querySelector('.cat-links');
      m.push({ label: 'Cat-card · link button gap', role: 'card link row', px: px(getComputedStyle(links).gap) });
    }

    // Verdict
    const verdict = document.querySelector('.verdict');
    if (verdict) {
      const vcs = getComputedStyle(verdict);
      m.push({ label: 'Verdict · row-gap', role: 'verdict internal', px: px(vcs.rowGap) });
      m.push({ label: 'Verdict · padding', role: 'verdict padding',  px: px(vcs.paddingTop) });
      const vrow = verdict.querySelector('.verdict-row');
      m.push({ label: 'Verdict-row · column-gap', role: 'verdict row cols', px: px(getComputedStyle(vrow).columnGap) });
    }

    // Footer
    const footer = document.querySelector('.footer');
    if (footer) {
      const fcs = getComputedStyle(footer);
      m.push({ label: 'Footer · padding-top (rule clearance)', role: 'footer rule', px: px(fcs.paddingTop) });
      m.push({ label: 'Footer · column-gap', role: 'footer cols', px: px(fcs.columnGap) });
      m.push({ label: 'Footer · row-gap',    role: 'footer rows', px: px(fcs.rowGap) });
      const col = footer.querySelector('.footer-col');
      m.push({ label: 'Footer-col · row-gap (label→link stack)', role: 'footer col internal', px: px(getComputedStyle(col).rowGap) });
    }

    // Prose
    const prose = document.querySelector('.prose');
    if (prose) m.push({ label: 'Prose · row-gap (para→para)', role: 'prose rhythm', px: px(getComputedStyle(prose).rowGap) });

    return m;
  });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 2000 });
  await page.goto('file:///tmp/pplx-chart-system-work/09_toolkit/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const ms = await measurePage(page);
  await browser.close();

  const annotated = ms.map(item => ({
    ...item,
    classification: classify(item.px, item.intraLabel),
    nearest_token: nearestToken(item.px)
  }));

  console.log('\n══════ toolkit landing page ══════');
  let pass = 0, warn = 0, fail = 0;
  annotated.forEach(item => {
    let icon;
    switch (item.classification) {
      case 'BELOW_FLOOR': icon = '✗'; fail++; break;
      case 'off_scale':   icon = '⚠'; warn++; break;
      default:            icon = '✓'; pass++;
    }
    console.log(`  ${icon} ${item.px.toFixed(1).padStart(6)}px  ${item.label.padEnd(58)} → ${item.nearest_token.name.padEnd(5)} (${item.nearest_token.value}px)`);
  });
  console.log(`\n  ─── pass ${pass} · warn ${warn} · BELOW FLOOR ${fail} ───`);

  if (fail === 0 && warn === 0) {
    console.log('\n✓ Zero sub-floor violations. Page audits clean. The toolkit dogfoods its own contract.');
  } else if (fail === 0) {
    console.log('\n⚠ No sub-floor violations, but some values are off-scale.');
  } else {
    console.log('\n✗ Has sub-floor violations on the page itself — fix required.');
    process.exit(1);
  }
})();
