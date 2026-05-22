/**
 * Shared template rendering logic for the test suite.
 *
 * Exports:
 *   FIXTURES     — synthetic fixture data, one entry per archetype key
 *   expand(t,d)  — expand {{#each xs}} ... {{/each}} and {{#if k}} ... {{/if}}
 *   substitute(t,d) — substitute {{ key }} scalar placeholders
 *   stripComments(html) — strip <!-- ... --> blocks
 *   render(template, fixture) — full pipeline (strip comments, expand, substitute)
 *   PLACEHOLDER_REGEX
 *   PPLX_MARK_REGEX
 *   ARCHETYPE_VIEWPORT — pixel dimensions per native aspect ratio
 *
 * Used by both integration.test.js and visual.test.js so the rendering
 * pipeline is identical across the suite.
 */

'use strict';

const PPLX_MARK_REGEX = /<svg[^>]*viewBox=["']0 0 254 275["'][^>]*>[\s\S]*?<path/i;
const PLACEHOLDER_REGEX = /\{\{\s*([^#/][^}]*?)\s*\}\}/g;
const COMMENT_REGEX = /<!--[\s\S]*?-->/g;

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
    cell_2_unit: '\u00d7',
    cell_2_delta: 'vs baseline',
    cell_3_label: 'cell three',
    cell_3_value: '+20',
    cell_3_unit: '%',
    cell_3_delta: 'lift',
    cell_4_label: 'cell four',
    cell_4_value: '\u221212',
    cell_4_unit: '%',
    cell_4_delta: 'lift',
    footer_left: 'fixture · 4 metrics',
    footer_right: '2026',
  },
  C: {
    kicker: 'FIXTURE · before/after',
    title: 'Synthetic C card',
    hero: '7.5',
    hero_unit: '\u00d7',
    deck: 'Synthetic deck text for archetype C test fixture.',
    left_label: 'before',
    left_value: '$0.153',
    right_label: 'after',
    right_value: '$0.020',
    delta_caption: '\u221287% cost · +11pp accuracy',
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
    triad_2_unit: '\u00d7',
    triad_3_label: 'metric three',
    triad_3_value: '7.5',
    triad_3_unit: '\u00d7',
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

// Native viewport per archetype. The visual test uses these so each
// card renders at its true production aspect ratio.
const ARCHETYPE_VIEWPORT = {
  A:             { width: 1080, height: 1080 },
  B:             { width: 1080, height: 1080 },
  C:             { width: 1080, height: 1080 },
  D:             { width: 1920, height: 1080 },
  E:             { width: 1080, height: 1350 },
  F:             { width: 1080, height: 1920 },
  'G-display':   { width: 1080, height: 1080 },
  'G-editorial': { width: 1080, height: 1080 },
  'G-quote':     { width: 1080, height: 1080 },
};

function stripComments(html) {
  return html.replace(COMMENT_REGEX, '');
}

function substitute(template, data) {
  return template.replace(PLACEHOLDER_REGEX, (m, key) => {
    const k = key.trim();
    if (Object.prototype.hasOwnProperty.call(data, k)) {
      const v = data[k];
      return v == null ? '' : String(v);
    }
    return m;
  });
}

function findMatchingClose(template, fromIdx, kind) {
  const openRe = kind === 'each' ? /\{\{#each\s+\w+\s*\}\}/g : /\{\{#if\s+\w+\s*\}\}/g;
  const closeTag = kind === 'each' ? '{{/each}}' : '{{/if}}';
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

function expand(template, data) {
  let out = '';
  let i = 0;
  while (i < template.length) {
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
    const closeIdx = findMatchingClose(template, openEnd, next.kind);
    if (closeIdx === -1) throw new Error(`Unclosed ${next.kind} block for "${key}"`);
    const inner = template.slice(openEnd, closeIdx);
    if (next.kind === 'each') {
      const arr = data[key];
      if (Array.isArray(arr)) {
        for (const item of arr) {
          const merged = Object.assign({}, data, item);
          out += substitute(expand(inner, merged), merged);
        }
      }
    } else if (data[key]) {
      out += substitute(expand(inner, data), data);
    }
    i = closeIdx + closeTag.length;
  }
  return out;
}

/** Full pipeline: comments, blocks, scalars. */
function render(template, fixture) {
  return substitute(expand(stripComments(template), fixture), fixture);
}

module.exports = {
  FIXTURES,
  ARCHETYPE_VIEWPORT,
  PLACEHOLDER_REGEX,
  PPLX_MARK_REGEX,
  stripComments,
  substitute,
  expand,
  render,
};
