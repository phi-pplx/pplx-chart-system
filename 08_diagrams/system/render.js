/* ─────────────────────────────────────────────────────────────────────────
   PPLX Announcement-Diagram System · Render v0
   Takes a data object and a target element, builds the HTML for an
   archetype. Returns the .body element so wires can be routed.
   ───────────────────────────────────────────────────────────────────────── */

(function () {
  // Real PPLX 2026 symbol (the wing/arrow glyph, not the asterisk).
  const MARK_SVG = `
    <svg viewBox="0 0 254 275" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="currentColor" d="M207.649 2.21927C209.816 0.0528457 213.075 -0.595764 215.905 0.576694C218.736 1.74918 220.581 4.5119 220.581 7.57572V86.2554H245.452C249.636 86.2557 253.027 89.6472 253.027 93.8306V202.187C253.027 206.371 249.636 209.762 245.452 209.762H220.581V267.043C220.581 270.107 218.735 272.87 215.904 274.043C213.074 275.215 209.816 274.566 207.649 272.4L134.091 198.841V267.085C134.091 271.268 130.699 274.66 126.516 274.66C122.332 274.66 118.94 271.268 118.94 267.085V198.842L45.3828 272.4C43.2164 274.566 39.9585 275.215 37.1279 274.043C34.2973 272.87 32.4512 270.107 32.4512 267.043V209.762H7.5752C3.39155 209.762 2.88624e-05 206.371 0 202.187V93.8306C6.59711e-05 89.647 3.39158 86.2554 7.5752 86.2554H32.4512V7.57572C32.4512 4.51189 34.2973 1.74917 37.1279 0.576694C39.9584 -0.595448 43.2165 0.0529879 45.3828 2.21927L118.94 75.7769V7.57572C118.94 3.39212 122.332 0.000522602 126.516 0.000522602C130.699 0.000522602 134.091 3.39212 134.091 7.57572V75.7769L207.649 2.21927ZM47.6016 173.175V248.755L118.94 177.417V110.757L47.6016 173.175ZM134.091 177.416L205.431 248.755V202.303C205.43 202.265 205.428 202.226 205.428 202.187C205.428 202.148 205.43 202.109 205.431 202.07V173.175L134.091 110.757V177.416ZM217.993 164.037C219.637 165.475 220.581 167.553 220.581 169.738V194.612H237.877V101.406H146.411L217.993 164.037ZM15.1504 194.612H32.4512V169.738C32.4512 167.553 33.3941 165.475 35.0381 164.037L106.621 101.406H15.1504V194.612ZM47.6016 86.2554H107.993L47.6016 25.8638V86.2554ZM145.04 86.2554H205.431V25.8638L145.04 86.2554Z"/>
    </svg>`;

  // 24×24 icon set, single stroke, currentColor.
  const ICONS = {
    rss:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a8 8 0 0 1 8 8"/><path d="M4 4a15 15 0 0 1 15 15"/><circle cx="5" cy="18" r="1.3" fill="currentColor" stroke="none"/></svg>`,
    shield:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3 L20 6 V12 C20 16.5 16.5 20 12 21 C7.5 20 4 16.5 4 12 V6 Z"/></svg>`,
    laptop:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M2 20h20" stroke-linecap="round"/></svg>`,
    endpoint:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="4" width="18" height="13" rx="1"/><path d="M8 21h8 M12 17v4" stroke-linecap="round"/></svg>`,
    doc:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M5 4h11l3 3v13H5z"/><path d="M8 10h8 M8 14h7 M8 18h5" stroke-linecap="round"/></svg>`,
    config:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="1.5"/><path d="M7 10h10 M7 14h6" stroke-linecap="round"/></svg>`,
    ext:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 6h16v10H4z"/><path d="M9 20h6 M12 16v4" stroke-linecap="round"/><path d="M14 9l-3 3 3 3" stroke-linecap="round"/></svg>`,
    warn:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3l10 18H2z"/><path d="M12 10v5" stroke-linecap="round"/><circle cx="12" cy="18" r="0.8" fill="currentColor" stroke="none"/></svg>`,
    box:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg>`,
    lines:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M8 9h8 M8 13h8 M8 17h5" stroke-linecap="round"/></svg>`,
    spark:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3 L13.8 10.2 L21 12 L13.8 13.8 L12 21 L10.2 13.8 L3 12 L10.2 10.2 Z"/></svg>`,
    cpu:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="1"/><path d="M9 3v3 M15 3v3 M9 18v3 M15 18v3 M3 9h3 M3 15h3 M18 9h3 M18 15h3"/></svg>`
  };

  function el(tag, attrs = {}, html) {
    const e = document.createElement(tag);
    for (const k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'style') e.setAttribute('style', attrs[k]);
      else if (k.startsWith('data-')) e.setAttribute(k, attrs[k]);
      else e[k] = attrs[k];
    }
    if (html != null) e.innerHTML = html;
    return e;
  }

  function buildHead(data) {
    const head = el('div', { class: 'head' });
    const meta = el('div', { class: 'meta' });
    if (data.kicker) meta.appendChild(el('div', { class: 'kicker' }, data.kicker));
    if (data.title)  meta.appendChild(el('h1',  { class: 'title'  }, data.title));
    head.appendChild(meta);
    head.appendChild(el('div', { class: 'mark', 'aria-label': 'Perplexity' }, MARK_SVG));
    return head;
  }

  function buildFoot(data) {
    const foot = el('div', { class: 'foot' });
    foot.appendChild(el('div', { class: 'left'  }, data.footerLeft  || ''));
    foot.appendChild(el('div', { class: 'right' }, data.footerRight || ''));
    if (data.stamp !== false) {
      const stamp = data.stamp || 'PPLX · diagram-system v0.1 · 2026';
      foot.appendChild(el('div', { class: 'stamp' }, stamp));
    }
    return foot;
  }

  function activityStrip(values, peakAt) {
    // values: array of 0..1; peakAt: optional index of the bar to mark as peak
    if (!values || !values.length) return null;
    const strip = el('div', { class: 'activity' });
    values.forEach((v, i) => {
      const bar = el('div', { class: 'bar' + (i === peakAt ? ' peak' : '') });
      bar.style.setProperty('--v', String(Math.max(0.05, Math.min(1, v))));
      strip.appendChild(bar);
    });
    return strip;
  }

  function pipelineNode(node) {
    const cls = ['p-node'];
    if (node.accent) cls.push('accent');
    const e = el('div', { class: cls.join(' ') });
    if (node.icon)    e.appendChild(el('div', { class: 'ic' }, ICONS[node.icon] || ''));
    const stack = el('div');
    stack.appendChild(el('div', { class: 'lbl' }, node.label || ''));
    if (node.sub)     stack.appendChild(el('div', { class: 'sub' }, node.sub));
    e.appendChild(stack);
    if (node.activity) {
      const strip = activityStrip(node.activity, node.activityPeak);
      if (strip) e.appendChild(strip);
    }
    return e;
  }

  function softNode(node) {
    const e = el('div', { class: 'p-node soft' });
    if (node.icon) e.appendChild(el('div', { class: 'ic' }, ICONS[node.icon] || ''));
    const stack = el('div');
    stack.appendChild(el('div', { class: 'lbl' }, node.label || ''));
    if (node.sub) stack.appendChild(el('div', { class: 'sub' }, node.sub));
    e.appendChild(stack);
    if (node.pill) e.appendChild(el('div', { class: 'pill' + (node.pillStyle ? ' ' + node.pillStyle : '') }, node.pill));
    if (node.activity) {
      const strip = activityStrip(node.activity, node.activityPeak);
      if (strip) e.appendChild(strip);
    }
    return e;
  }

  function core(c) {
    const wrap = el('div', { class: 'p-core' });
    if (c.cls) wrap.classList.add(...c.cls.split(' '));
    if (c.id)  wrap.classList.add(c.id);
    const head = el('div', { class: 'core-head' });
    head.appendChild(el('div', { class: 'core-name' }, c.name || ''));
    if (c.meta) head.appendChild(el('div', { class: 'core-meta' }, c.meta));
    wrap.appendChild(head);
    if (c.deck) wrap.appendChild(el('div', { class: 'core-deck' }, c.deck));
    if (c.tiles && c.tiles.length) {
      const tiles = el('div', { class: 'p-tiles' });
      c.tiles.forEach(t => {
        const ti = el('div', { class: 'p-tile' + (t.flag ? ' flag' : '') });
        ti.appendChild(el('div', { class: 'ic' }, ICONS[t.icon] || ICONS.box));
        ti.appendChild(el('div', { class: 'lab' }, t.label || ''));
        if (t.count != null) ti.appendChild(el('div', { class: 'count' }, String(t.count)));
        tiles.appendChild(ti);
      });
      wrap.appendChild(tiles);
    }
    if (c.table && c.table.length) {
      const tbl = el('div', { class: 'p-table' });
      c.table.forEach(r => {
        const row = el('div', { class: 'p-row' + (r.accent ? ' accent' : '') });
        row.appendChild(el('div', { class: 'k' }, r.k));
        row.appendChild(el('div', { class: 'v' }, r.v));
        tbl.appendChild(row);
      });
      wrap.appendChild(tbl);
    }
    return wrap;
  }

  function renderPipeline(data, target) {
    target.innerHTML = '';
    // Compact mode: drop second-order encodings (sparklines, wire weights,
    // warn borders) so the construction stays inside Bertin's 3-component
    // image limit. Tile count labels are text annotations, not retinal
    // variables, and are preserved.
    const compact = !!data.compact;
    if (compact) {
      data = JSON.parse(JSON.stringify(data));
      // Strip activity arrays from all nodes
      const stripActivity = (n) => { if (n) { delete n.activity; delete n.activityPeak; } };
      (data.inputs?.nodes || []).forEach(stripActivity);
      (data.outputs?.nodes || []).forEach(stripActivity);
      stripActivity(data.inputs?.assembler);
      // Flatten wire weights so all wires render at base style stroke width
      (data.wires || []).forEach(w => delete w.weight);
    }
    const surface = el('div', {
      class: 'surface' + (data.preview ? ' preview' : '') + (compact ? ' compact' : ''),
      'data-aspect': data.aspect || '16:9',
      'data-mode': data.mode || 'editorial'
    });

    surface.appendChild(buildHead(data));

    const body = el('div', { class: 'body pipeline' });
    if (data.wires) body.setAttribute('data-wires', JSON.stringify(data.wires));

    // Inputs section
    const inputsSec = el('div', { class: 'p-section p-inputs' });
    if (data.inputs?.label) inputsSec.appendChild(el('div', { class: 'col-label' }, data.inputs.label));
    const inputsList = el('div', { class: 'p-list' });
    (data.inputs?.nodes || []).forEach(n => {
      const node = pipelineNode(n);
      if (n.id) node.classList.add(n.id);
      inputsList.appendChild(node);
    });
    inputsSec.appendChild(inputsList);
    if (data.inputs?.assembler) {
      const a = softNode(data.inputs.assembler);
      if (data.inputs.assembler.id) a.classList.add(data.inputs.assembler.id);
      inputsSec.appendChild(a);
    }
    body.appendChild(inputsSec);

    // Core
    const coreSec = el('div', { class: 'p-section p-coreSec' });
    if (data.core?.label) coreSec.appendChild(el('div', { class: 'col-label' }, data.core.label));
    const c = core(data.core || {});
    coreSec.appendChild(c);
    body.appendChild(coreSec);

    // Outputs
    const outputsSec = el('div', { class: 'p-section p-outputs' });
    if (data.outputs?.label) outputsSec.appendChild(el('div', { class: 'col-label' }, data.outputs.label));
    const outputsList = el('div', { class: 'p-list' });
    (data.outputs?.nodes || []).forEach(n => {
      const node = pipelineNode(n);
      if (n.id) node.classList.add(n.id);
      outputsList.appendChild(node);
    });
    outputsSec.appendChild(outputsList);
    body.appendChild(outputsSec);

    surface.appendChild(body);
    surface.appendChild(buildFoot(data));

    target.appendChild(surface);

    return body;
  }

  // ─── Timeline archetype ─────────────────────────────────────────────────
  function tCard(m) {
    const card = el('div', { class: 't-card' + (m.accent ? ' accent' : '') });
    card.appendChild(el('h3', { class: 'title' }, m.title || ''));
    const body = el('div', { class: 'body' });
    if (m.deck) body.appendChild(el('div', null, m.deck));
    if (m.bullets && m.bullets.length) {
      const ul = el('ul');
      m.bullets.forEach(b => ul.appendChild(el('li', null, b)));
      body.appendChild(ul);
    }
    card.appendChild(body);
    if (m.pill || m.tag) {
      const meta = el('div', { class: 'meta' });
      if (m.pill) meta.appendChild(el('div', { class: 'pill' + (m.pillStyle ? ' ' + m.pillStyle : '') }, m.pill));
      if (m.tag)  meta.appendChild(el('div', null, m.tag));
      card.appendChild(meta);
    }
    return card;
  }

  function renderTimeline(data, target) {
    target.innerHTML = '';
    const surface = el('div', {
      class: 'surface' + (data.preview ? ' preview' : ''),
      'data-aspect': data.aspect || '16:9',
      'data-mode': data.mode || 'editorial'
    });
    surface.appendChild(buildHead(data));

    const body = el('div', { class: 'body timeline' });
    const horizontal = (data.aspect || '16:9') === '16:9';
    body.classList.add(horizontal ? 'horizontal' : 'vertical');

    const milestones = data.milestones || [];

    if (horizontal) {
      // cards row
      const cards = el('div', { class: 'cards' });
      milestones.forEach(m => cards.appendChild(tCard(m)));
      body.appendChild(cards);
      // dots row (track + dots)
      const track = el('div', { class: 'track' });
      const dots  = el('div', { class: 'dots' });
      milestones.forEach(m => dots.appendChild(el('div', { class: 'dot' + (m.accent ? ' accent' : '') })));
      track.appendChild(dots);
      body.appendChild(track);
      // dates row
      const dates = el('div', { class: 'dates' });
      milestones.forEach(m => dates.appendChild(el('div', { class: 'date' }, m.date || '')));
      body.appendChild(dates);
    } else {
      // Vertical: each milestone is one row of (date | milestone) in a 2-col grid.
      milestones.forEach(m => {
        body.appendChild(el('div', { class: 'date' + (m.accent ? ' accent' : '') }, m.date || ''));
        const wrap = el('div', { class: 'milestone-wrap' + (m.accent ? ' accent' : '') });
        wrap.appendChild(tCard(m));
        body.appendChild(wrap);
      });
    }

    surface.appendChild(body);
    surface.appendChild(buildFoot(data));
    target.appendChild(surface);
    return body;
  }

  // ─── Comparison archetype (FT deviation/ranking) ──────────────────────────
  function renderComparison(data, target) {
    target.innerHTML = '';
    const surface = el('div', {
      class: 'surface' + (data.preview ? ' preview' : ''),
      'data-aspect': data.aspect || '16:9',
      'data-mode': data.mode || 'editorial'
    });
    surface.appendChild(buildHead(data));

    const body = el('div', { class: 'body comparison' });

    const scaleMin = data.scale?.min ?? 0;
    const scaleMax = data.scale?.max ?? Math.max(...data.rows.map(r => Number(r.value) || 0)) * 1.05;
    const ticks = data.scale?.ticks || [scaleMin, (scaleMin + scaleMax) / 2, scaleMax];
    const unit  = data.scale?.unit || '';

    // Axis header
    const axis = el('div', { class: 'c-axis' });
    axis.appendChild(el('div', null, data.scale?.label || ''));
    const scaleEl = el('div', { class: 'scale' });
    ticks.forEach(t => {
      const pct = ((t - scaleMin) / (scaleMax - scaleMin)) * 100;
      const tick = el('div', { class: 'tick', style: `left: ${pct}%;` });
      const lbl = el('div', { class: 'tick-label', style: `left: ${pct}%;` }, String(t) + unit);
      scaleEl.appendChild(tick);
      scaleEl.appendChild(lbl);
    });
    axis.appendChild(scaleEl);
    axis.appendChild(el('div', null, data.scale?.benchmark || ''));
    body.appendChild(axis);

    // Sort rows descending by value if not pre-sorted
    const rows = (data.rows || []).slice().sort((a,b) => (Number(b.value)||0) - (Number(a.value)||0));

    // Rows
    const list = el('div', { class: 'c-rows' });
    rows.forEach((r, i) => {
      const classes = ['c-row'];
      if (r.accent)            classes.push('accent');
      else if (r.series === 2) classes.push('series-2');
      else if (r.series === 3) classes.push('series-3');
      const row = el('div', { class: classes.join(' ') });

      // Left cell: name + meta + rank
      const left = el('div', { class: 'left' });
      left.appendChild(el('div', { class: 'name' }, r.name || ''));
      const meta = el('div', { class: 'meta' });
      if (r.category) meta.appendChild(el('span', null, r.category));
      meta.appendChild(el('span', { class: 'rank' }, '#' + (i + 1)));
      left.appendChild(meta);
      row.appendChild(left);

      // Center: bar track with CI overlay
      const track = el('div', { class: 'bar-track' });
      const bar = el('div', { class: 'bar' });
      const v = (Number(r.value) - scaleMin) / (scaleMax - scaleMin);
      bar.style.setProperty('--v', String(Math.max(0, Math.min(1, v))));
      track.appendChild(bar);
      // Confidence interval, if present
      if (r.ci && Array.isArray(r.ci) && r.ci.length === 2) {
        const lo = (r.ci[0] - scaleMin) / (scaleMax - scaleMin);
        const hi = (r.ci[1] - scaleMin) / (scaleMax - scaleMin);
        const ci = el('div', { class: 'ci', style: `left: ${lo*100}%; right: ${(1-hi)*100}%;` });
        ci.appendChild(el('div', { class: 'span' }));
        track.appendChild(ci);
      }
      row.appendChild(track);

      // Right: value + delta
      const right = el('div', { class: 'right' });
      const valueEl = el('div', { class: 'value' });
      valueEl.innerHTML = (r.display ?? String(r.value)) + (unit ? `<span class="unit">${unit}</span>` : '');
      right.appendChild(valueEl);
      if (r.delta) {
        const d = String(r.delta);
        const dCls = d.startsWith('+') ? 'positive' : (d.startsWith('−') || d.startsWith('-') ? 'negative' : '');
        right.appendChild(el('div', { class: 'delta' + (dCls ? ' ' + dCls : '') }, d));
      }
      row.appendChild(right);

      list.appendChild(row);
    });
    body.appendChild(list);

    if (data.note) {
      const fn = el('div', { class: 'c-foot-note' });
      fn.appendChild(el('div', null, data.note));
      if (data.noteRight) fn.appendChild(el('div', null, data.noteRight));
      body.appendChild(fn);
    }

    surface.appendChild(body);
    surface.appendChild(buildFoot(data));
    target.appendChild(surface);
    return body;
  }

  // ─── Stat Hero archetype ────────────────────────────────────────────────
  function renderStatHero(data, target) {
    target.innerHTML = '';
    const surface = el('div', {
      class: 'surface' + (data.preview ? ' preview' : ''),
      'data-aspect': data.aspect || '16:9',
      'data-mode': data.mode || 'editorial'
    });
    surface.appendChild(buildHead(data));

    const body = el('div', { class: 'body stathero' });

    // Hero block
    const hero = el('div', { class: 'h-hero' });
    if (data.hero?.preamble) hero.appendChild(el('div', { class: 'preamble' }, data.hero.preamble));
    const num = el('div', { class: 'number' });
    num.innerHTML = (data.hero?.number || '') + (data.hero?.unit ? `<span class="unit">${data.hero.unit}</span>` : '');
    hero.appendChild(num);
    if (data.hero?.context) hero.appendChild(el('div', { class: 'context' }, data.hero.context));
    body.appendChild(hero);

    // Supporting bars
    if (data.support && data.support.rows && data.support.rows.length) {
      const support = el('div', { class: 'h-support' });
      if (data.support.label) support.appendChild(el('div', { class: 'col-label' }, data.support.label));
      const rows = el('div', { class: 'h-rows' });
      // Find max for scaling (or use explicit max)
      const maxVal = data.support.max ?? Math.max(...data.support.rows.map(r => Number(r.value) || 0));
      data.support.rows.forEach(r => {
        const row = el('div', { class: 'h-row' + (r.accent ? ' accent' : '') });
        row.appendChild(el('div', { class: 'lbl' }, r.label || ''));
        const bar = el('div', { class: 'bar' });
        const v = (Number(r.value) || 0) / (maxVal || 1);
        bar.style.setProperty('--v', String(Math.max(0, Math.min(1, v))));
        row.appendChild(bar);
        row.appendChild(el('div', { class: 'val' }, r.display || String(r.value)));
        if (r.delta) row.appendChild(el('div', { class: 'delta' }, r.delta));
        rows.appendChild(row);
      });
      support.appendChild(rows);
      body.appendChild(support);
    }

    surface.appendChild(body);
    surface.appendChild(buildFoot(data));
    target.appendChild(surface);
    return body;
  }

  // Public
  window.PPLXDiagram = {
    renderPipeline,
    renderTimeline,
    renderStatHero,
    renderComparison,
    ICONS
  };
})();
