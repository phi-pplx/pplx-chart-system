/* ─────────────────────────────────────────────────────────────────────────
   PPLX Announcement-Diagram System · Wire Router v0
   Auto-routes orthogonal connections from measured DOM positions.
   No hand-tuned SVG coordinates anywhere in the system.

   Usage: declare wires as data attributes on the .body element:
     <div class="body" data-wires='[
       {"from":".pub-reports","fromSide":"right",
        "to":".computer","toSide":"right",
        "via":"spine","style":"neutral"},
       {"from":".computer","fromSide":"right",
        "to":".bumblebee","toSide":"left","style":"ink"},
       {"from":".bumblebee","fromSide":"right",
        "to":".findings","toSide":"left","style":"accent"}
     ]'></div>

   Then call: await PPLXWires.route(document.querySelector('.body'));
   Sets window.__wiresReady = true when complete.
   ───────────────────────────────────────────────────────────────────────── */

window.PPLXWires = (function () {
  const NS = 'http://www.w3.org/2000/svg';

  // Style keys resolved against CSS vars at route time (SVG stroke= can't take var()).
  const STYLE_KEYS = {
    neutral: { varName: '--wire',        width: 1.25, marker: 'arr-neutral' },
    ink:     { varName: '--wire-ink',    width: 1.5,  marker: 'arr-ink'     },
    accent:  { varName: '--wire-accent', width: 1.5,  marker: 'arr-accent'  }
  };

  function cssVar(name, el) {
    return getComputedStyle(el).getPropertyValue(name).trim();
  }

  function ensureDefs(svg) {
    if (svg.querySelector('defs')) return;
    const defs = document.createElementNS(NS, 'defs');
    const cs = getComputedStyle(svg);
    const colors = {
      'arr-neutral': cs.getPropertyValue('--wire').trim() || '#9a8074',
      'arr-ink':     cs.getPropertyValue('--wire-ink').trim() || '#091717',
      'arr-accent':  cs.getPropertyValue('--wire-accent').trim() || '#0fb5b3'
    };
    Object.entries(colors).forEach(([id, fill]) => {
      const m = document.createElementNS(NS, 'marker');
      m.setAttribute('id', id);
      m.setAttribute('viewBox', '0 0 10 10');
      m.setAttribute('refX', '9');
      m.setAttribute('refY', '5');
      m.setAttribute('markerWidth', '6');
      m.setAttribute('markerHeight', '6');
      m.setAttribute('orient', 'auto-start-reverse');
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', 'M0,0 L10,5 L0,10 Z');
      p.setAttribute('fill', fill);
      m.appendChild(p);
      defs.appendChild(m);
    });
    svg.insertBefore(defs, svg.firstChild);
  }

  function side(rect, which, host) {
    const cx = rect.left + rect.width / 2 - host.left;
    const cy = rect.top  + rect.height / 2 - host.top;
    if (which === 'left')   return { x: rect.left   - host.left, y: cy };
    if (which === 'right')  return { x: rect.right  - host.left, y: cy };
    if (which === 'top')    return { x: cx,                       y: rect.top    - host.top };
    if (which === 'bottom') return { x: cx,                       y: rect.bottom - host.top };
    return { x: cx, y: cy };
  }

  /**
   * Orthogonal elbow: from (a) to (b) with a single bend.
   * If `viaSpine` is provided (an x-coord), the wire runs to spineX then
   * down/up to b's y, then into b. Useful for collecting multiple feeds.
   */
  function elbowPath(a, b, opts = {}) {
    const stub = opts.stub ?? 12;
    if (opts.viaSpineX != null) {
      const sx = opts.viaSpineX;
      return `M ${a.x} ${a.y} H ${sx} V ${b.y} H ${b.x}`;
    }
    // Default: horizontal stub out of a, vertical to b's y, horizontal into b.
    const dx = b.x - a.x;
    const dir = dx >= 0 ? 1 : -1;
    const midX = a.x + dir * Math.max(stub, Math.abs(dx) / 2);
    return `M ${a.x} ${a.y} H ${midX} V ${b.y} H ${b.x}`;
  }

  async function route(bodyEl) {
    if (!bodyEl) return;
    await document.fonts.ready;
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    const declarations = JSON.parse(bodyEl.getAttribute('data-wires') || '[]');
    if (!declarations.length) { window.__wiresReady = true; return; }

    // Find or create the .wires svg.
    let svg = bodyEl.querySelector('svg.wires');
    if (!svg) {
      svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'wires');
      bodyEl.appendChild(svg);
    }
    // Clear prior paths
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    ensureDefs(svg);

    const host = bodyEl.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${Math.round(host.width)} ${Math.round(host.height)}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.width  = '100%';
    svg.style.height = '100%';

    // Pre-compute spine x positions if any wire declares via:"spine".
    const spineX = {};
    declarations.forEach((w, i) => {
      if (w.via === 'spine') {
        const fromEl = bodyEl.querySelector(w.from);
        const toEl   = bodyEl.querySelector(w.to);
        if (!fromEl || !toEl) return;
        const a = side(fromEl.getBoundingClientRect(), w.fromSide || 'right', host);
        const b = side(toEl.getBoundingClientRect(),   w.toSide   || 'left',  host);
        // Spine sits halfway between the rightmost from-edge and the leftmost to-edge.
        // Group spines by `spineGroup` so multiple wires share an x.
        const key = w.spineGroup || `${Math.round(a.x)}_${Math.round(b.x)}`;
        if (spineX[key] == null) {
          spineX[key] = Math.round((a.x + b.x) / 2);
        }
      }
    });

    declarations.forEach((w) => {
      const fromEl = bodyEl.querySelector(w.from);
      const toEl   = bodyEl.querySelector(w.to);
      if (!fromEl || !toEl) return;
      const a = side(fromEl.getBoundingClientRect(), w.fromSide || 'right', host);
      const b = side(toEl.getBoundingClientRect(),   w.toSide   || 'left',  host);

      const styleKey = STYLE_KEYS[w.style || 'neutral'];
      const stroke = getComputedStyle(bodyEl).getPropertyValue(styleKey.varName).trim();
      // Optional `weight` (0..1) encodes throughput. Scales stroke from 1.0 to 3.5px,
      // keeping the style key's base width as the lower anchor so light traffic still reads.
      const base = styleKey.width;
      const finalWidth = (w.weight != null)
        ? Math.max(base, 1.0 + Number(w.weight) * 2.5)
        : base;
      const style = { stroke, width: finalWidth, marker: styleKey.marker };
      const opts = { stub: w.stub ?? 14 };
      if (w.via === 'spine') {
        const key = w.spineGroup || `${Math.round(a.x)}_${Math.round(b.x)}`;
        opts.viaSpineX = spineX[key];
      }
      const d = elbowPath(a, b, opts);

      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('stroke', style.stroke);
      path.setAttribute('stroke-width', String(style.width));
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('fill', 'none');
      if (w.arrow !== false) path.setAttribute('marker-end', `url(#${style.marker})`);
      if (w.dash)            path.setAttribute('stroke-dasharray', w.dash);
      svg.appendChild(path);
    });

    window.__wiresReady = true;
  }

  return { route, elbowPath };
})();

// Auto-init: route every .body[data-wires] on the page when fonts are ready.
(async () => {
  await document.fonts.ready;
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const bodies = document.querySelectorAll('.body[data-wires]');
  for (const b of bodies) await PPLXWires.route(b);
  window.__wiresReady = true;
})();
