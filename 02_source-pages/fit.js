/**
 * pplx chart system · layout balancer + edge-case validator
 *
 * Two responsibilities:
 *
 * 1. BALANCE (the original responsibility):
 *    Measure content-to-canvas ratio (CCR), classify into one of five regimes,
 *    apply a strategy via data-fit + CSS variables.
 *
 *      CCR < 0.40   → amplify    (content too sparse)
 *      0.40–0.70    → distribute (room available)
 *      0.70–0.95    → anchor     (fits comfortably; no adjustment)
 *      0.95–1.05    → pack       (fills canvas; no adjustment)
 *      > 1.05       → compact    (overflows; tighten)
 *
 * 2. VALIDATE (added in v7.1 from edge-case stress test):
 *    For cards with a declared archetype (data-fit-archetype="A|B|...|G"),
 *    check three failure classes that the CCR diagnostic cannot detect:
 *
 *      - horizontal-overflow:  text wider than its column
 *      - density-mismatch:     declared visual density below archetype minimum
 *      - missing-structure:    a required content block is absent
 *
 *    On detection, fit.js emits a console warning and sets data-fit-warn on
 *    the offending element. With <body class="fit-debug">, the warning is
 *    rendered as a visible magenta strip on the card.
 *
 *    Never auto-fixes. Authors decide the response.
 *
 * Reference: tokens.json#archetypes, tokens.json#failure-detection.
 */

(function () {
  'use strict';

  // ====================================================================
  // STRATEGY TABLE
  // ====================================================================
  const STRATEGIES = {
    amplify:    { heroScale: 1.25, rowPad: 1.40, sectionGap: 1.35, auxOpacity: 1.0 },
    distribute: { heroScale: 1.08, rowPad: 1.15, sectionGap: 1.15, auxOpacity: 1.0 },
    anchor:     { heroScale: 1.0,  rowPad: 1.0,  sectionGap: 1.0,  auxOpacity: 1.0 },
    pack:       { heroScale: 1.0,  rowPad: 1.0,  sectionGap: 1.0,  auxOpacity: 1.0 },
    compact:    { heroScale: 0.88, rowPad: 0.75, sectionGap: 0.80, auxOpacity: 0.85 },
  };

  function classifyCCR(ratio) {
    if (ratio < 0.40)  return 'amplify';
    if (ratio < 0.70)  return 'distribute';
    if (ratio < 0.95)  return 'anchor';
    if (ratio < 1.05)  return 'pack';
    return 'compact';
  }

  // ====================================================================
  // ARCHETYPE CONTRACTS
  // Mirrors tokens.json#archetypes. Maintain both together.
  // ====================================================================
  const ARCHETYPES = {
    A: {
      name: 'Stat + bar chart',
      requiredBlocks: ['head', 'chart', 'foot'],
      knobs: ['hero-scale'],
      contract: {
        maxCategories: 8,
        maxCategoryLabelChars: 12,
      },
    },
    B: {
      name: 'Pin spike',
      requiredBlocks: ['head', 'hero', 'chart', 'foot'],
      knobs: ['hero-scale'],
      contract: {
        pinCount: 50,
        minDensity: 0.25,
      },
    },
    C: {
      name: 'Compact 2x2 comparison',
      requiredBlocks: ['head', 'grid', 'foot'],
      knobs: ['hero-scale'],
      contract: {
        cellCount: 4,
        maxCellNameChars: 16,
      },
    },
    D: {
      name: 'Dot-matrix bar',
      requiredBlocks: ['head', 'chart', 'foot'],
      knobs: ['hero-scale'],
      contract: {
        maxXLabels: 6,
        maxXLabelChars: 12,
      },
    },
    E: {
      name: 'Editorial stat block',
      requiredBlocks: ['head', 'hero-block', 'spark', 'quad', 'foot'],
      knobs: ['hero-scale', 'section-gap'],
      contract: {
        maxTitleChars: 64,
        maxDeckChars: 180,
      },
    },
    F: {
      name: 'Story stack wallet list',
      requiredBlocks: ['head', 'goal', 'list', 'foot'],
      knobs: ['hero-scale', 'row-pad', 'section-gap'],
      contract: {
        minRows: 2,
        maxRows: 18,
        maxRowNameChars: 18,
      },
    },
    G: {
      name: 'Editorial header card',
      requiredBlocks: ['head', 'foot'],
      knobs: ['title-scale'],
      contract: {
        minTitleChars: 12,
        maxTitleChars: 240,
        maxDeckChars: 200,
      },
    },
  };

  // ====================================================================
  // BALANCE PASS
  // ====================================================================

  function measureCard(card) {
    // Clone the card off-screen with height: auto so we read intrinsic
    // content height instead of the locked canvas height.
    const clone = card.cloneNode(true);
    clone.style.cssText += '; position: absolute; left: -99999px; top: 0; height: auto !important; width: ' + card.clientWidth + 'px;';
    document.body.appendChild(clone);
    const naturalH = clone.scrollHeight;
    document.body.removeChild(clone);
    return naturalH;
  }

  function applyStrategy(card, strategy) {
    const s = STRATEGIES[strategy];
    card.dataset.fit = strategy;
    card.style.setProperty('--fit-hero-scale',   s.heroScale);
    card.style.setProperty('--fit-row-pad',      s.rowPad);
    card.style.setProperty('--fit-section-gap', s.sectionGap);
    card.style.setProperty('--fit-aux-opacity', s.auxOpacity);
  }

  // G archetype: title scale is content-derived, not CCR-derived.
  // The title IS the content, so it should grow inversely with character count
  // to fill 60–85% of the canvas. fit.js computes a scale factor and writes
  // --fit-title-scale on the card. CSS multiplies its base font-size by this.
  //
  // The function uses character count as a cheap proxy for line-count after wrap.
  // For G-display: base 180px wants ~10–20 chars. For G-editorial: base 60px
  // wants ~120–200 chars. For G-quote: base 88px wants ~60–120 chars.
  // Outside those bands the scale clamps; warnings fire if over the contract max.
  function computeTitleScale(card) {
    const variant = card.dataset.variant;
    const titleEl = card.querySelector('.g-title');
    if (!titleEl || !variant) return;
    const chars = (titleEl.textContent || '').length;
    const bands = {
      display:   { minChars: 10,  maxChars: 80,  minScale: 0.55, maxScale: 1.10 },
      editorial: { minChars: 60,  maxChars: 240, minScale: 0.80, maxScale: 1.15 },
      quote:     { minChars: 50,  maxChars: 200, minScale: 0.72, maxScale: 1.08 },
    };
    const band = bands[variant];
    if (!band) return;
    // Linear interpolation: at minChars use maxScale, at maxChars use minScale
    const t = Math.max(0, Math.min(1, (chars - band.minChars) / (band.maxChars - band.minChars)));
    const scale = band.maxScale - t * (band.maxScale - band.minScale);
    card.style.setProperty('--fit-title-scale', scale.toFixed(3));
    card.dataset.fitTitleScale = scale.toFixed(2);
  }

  function balanceCard(card) {
    applyStrategy(card, 'anchor');  // measure with neutral knobs

    // For G archetype, apply title-scale BEFORE measuring — the scaled title
    // is the content height, so we want to measure it at its actual rendered size.
    if (card.dataset.fitArchetype === 'G') {
      computeTitleScale(card);
    }

    const contentH = measureCard(card);
    const canvasH = card.clientHeight;
    if (!canvasH) return null;
    let ccr = contentH / canvasH;

    // Density override: if the card declares data-fit-density, multiply CCR by it.
    // This lets the B-card's chart-data code tell the balancer how visually full
    // it actually is, which the DOM can't reveal.
    const densityEl = card.querySelector('[data-fit-density]');
    if (densityEl) {
      const d = parseFloat(densityEl.dataset.fitDensity);
      if (!Number.isNaN(d) && d > 0 && d <= 1) {
        ccr = ccr * d;
      }
    }

    const strategy = classifyCCR(ccr);
    applyStrategy(card, strategy);
    card.dataset.fitCcr = ccr.toFixed(2);

    // Re-apply title-scale after strategy (which would have reset it to default).
    if (card.dataset.fitArchetype === 'G') {
      computeTitleScale(card);
    }

    return { ccr, strategy };
  }

  // ====================================================================
  // VALIDATE PASS
  // ====================================================================

  function emitWarning(el, code, detail) {
    // Append to existing warnings rather than overwrite.
    const existing = el.dataset.fitWarn ? el.dataset.fitWarn.split(' ') : [];
    if (!existing.includes(code)) existing.push(code);
    el.dataset.fitWarn = existing.join(' ');
    console.warn('[pplx-fit] ' + code + ': ' + (detail || ''), el);
  }

  function validateMissingStructure(card, archetype) {
    const spec = ARCHETYPES[archetype];
    if (!spec) return;
    for (const block of spec.requiredBlocks) {
      const found = card.querySelector('[data-fit-content="' + block + '"]');
      if (!found) {
        emitWarning(
          card,
          'missing-structure:' + block,
          'archetype ' + archetype + ' requires block "' + block + '" but no [data-fit-content="' + block + '"] found'
        );
      }
    }
  }

  function validateDensity(card, archetype) {
    const spec = ARCHETYPES[archetype];
    if (!spec || !spec.contract.minDensity) return;
    const chartEl = card.querySelector('[data-fit-density]');
    if (!chartEl) return;  // density is optional; only check when declared
    const d = parseFloat(chartEl.dataset.fitDensity);
    if (Number.isNaN(d)) return;
    if (d < spec.contract.minDensity) {
      emitWarning(
        chartEl,
        'density-mismatch',
        'visual density ' + d.toFixed(2) + ' below ' + archetype + '-card minimum ' + spec.contract.minDensity
      );
    }
  }

  function validateHorizontalOverflow(card, archetype) {
    // Generic check: any [data-fit-overflow-test] element is measured against
    // its parent's width. If the natural content width exceeds the container,
    // flag it.
    //
    // For SVG text labels (which don't reflow), we instead check label string
    // length against the archetype's character limit.
    const spec = ARCHETYPES[archetype];
    if (!spec) return;

    // String-length checks (cheap, archetype-specific)
    if (spec.contract.maxCategoryLabelChars) {
      // A-card and D-card category labels live in <text class="mc-tick">
      card.querySelectorAll('.mc-tick').forEach(t => {
        if (t.textContent && t.textContent.length > spec.contract.maxCategoryLabelChars) {
          emitWarning(
            t,
            'horizontal-overflow',
            'category label "' + t.textContent + '" (' + t.textContent.length + ' chars) exceeds ' + archetype + '-card limit of ' + spec.contract.maxCategoryLabelChars
          );
        }
      });
    }
    if (spec.contract.maxRowNameChars) {
      card.querySelectorAll('.f-row .name').forEach(n => {
        if (n.textContent && n.textContent.length > spec.contract.maxRowNameChars) {
          emitWarning(
            n,
            'horizontal-overflow',
            'row name "' + n.textContent + '" exceeds ' + archetype + '-card limit of ' + spec.contract.maxRowNameChars
          );
        }
      });
    }
    if (spec.contract.maxTitleChars) {
      const title = card.querySelector('.t-title');
      if (title && title.textContent && title.textContent.length > spec.contract.maxTitleChars) {
        emitWarning(
          title,
          'horizontal-overflow',
          'title (' + title.textContent.length + ' chars) exceeds ' + archetype + '-card limit of ' + spec.contract.maxTitleChars
        );
      }
    }

    // DOM-measure check: any element with [data-fit-overflow-test] is compared
    // to its parent's clientWidth. Generic fallback for non-archetype-specific
    // content.
    card.querySelectorAll('[data-fit-overflow-test]').forEach(el => {
      const parent = el.parentElement;
      if (!parent) return;
      if (el.scrollWidth > parent.clientWidth * 0.98) {
        emitWarning(
          el,
          'horizontal-overflow',
          'content wider than container (' + el.scrollWidth + 'px > ' + parent.clientWidth + 'px)'
        );
      }
    });
  }

  function validateCard(card) {
    const archetype = card.dataset.fitArchetype;
    if (!archetype) return;
    if (!ARCHETYPES[archetype]) {
      console.warn('[pplx-fit] unknown archetype "' + archetype + '"', card);
      return;
    }
    validateMissingStructure(card, archetype);
    validateDensity(card, archetype);
    validateHorizontalOverflow(card, archetype);
  }

  // ====================================================================
  // DEBUG OVERLAY
  // When <body class="fit-debug"> is set, render warnings as a visible
  // magenta strip on each card with warnings. Authors see the issue
  // inline, not just in console.
  // ====================================================================

  function ensureDebugStyles() {
    if (document.getElementById('pplx-fit-debug-styles')) return;
    const style = document.createElement('style');
    style.id = 'pplx-fit-debug-styles';
    style.textContent = `
      body.fit-debug [data-fit-warn] {
        outline: 2px solid #c64670;
        outline-offset: -2px;
      }
      body.fit-debug [data-fit-card][data-fit-warn]::after {
        content: attr(data-fit-warn);
        position: absolute;
        top: 0; left: 0; right: 0;
        background: #c64670;
        color: #fff;
        font-family: 'PPLX Mono', ui-monospace, monospace;
        font-size: 11px;
        letter-spacing: 0.04em;
        padding: 6px 10px;
        z-index: 999;
        pointer-events: none;
        white-space: pre-wrap;
        line-height: 1.4;
      }
    `;
    document.head.appendChild(style);
  }

  // ====================================================================
  // ENTRY POINTS
  // ====================================================================

  function balanceAll(root) {
    ensureDebugStyles();
    const cards = (root || document).querySelectorAll('[data-fit-card]');
    const results = [];
    for (const card of cards) {
      // 1. Balance (always)
      const r = balanceCard(card);
      // 2. Validate (only when archetype is declared)
      validateCard(card);
      if (r) results.push({ el: card, ...r });
    }
    return results;
  }

  function init() {
    const run = () => balanceAll();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
    } else {
      run();
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(run);
    }
  }

  // Public API
  window.pplxFit = {
    balance: balanceAll,
    balanceCard: balanceCard,
    validateCard: validateCard,
    classify: classifyCCR,
    strategies: STRATEGIES,
    archetypes: ARCHETYPES,
  };

  init();
})();
