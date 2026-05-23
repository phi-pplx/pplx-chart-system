// Bumblebee — v0.1 with multivariate encoding
// activity: 7-day running stat per node, normalized 0..1 (most recent on the right)
// wire weight: 0..1 throughput (records/day on that path) — drives stroke thickness
// tile count: actual matches in the last scan run — per Neurath (equal-size symbols
//   carrying definite quantities)

window.BUMBLEBEE_DATA = {
  kicker: 'Open source · Read only · macOS & Linux',
  title: 'Bumblebee scanning pipeline',
  inputs: {
    label: '01 · Threat intel',
    nodes: [
      {
        id: 'n-pub', icon: 'rss',
        label: 'Public reports',
        sub: '7d: 18 advisories',
        activity: [0.20, 0.10, 0.40, 0.20, 0.55, 0.30, 0.65],
        activityPeak: 6
      },
      {
        id: 'n-3p', icon: 'shield',
        label: 'Third-party feeds',
        sub: '7d: 41 updates',
        activity: [0.35, 0.50, 0.25, 0.70, 0.55, 0.85, 0.60],
        activityPeak: 5
      }
    ],
    assembler: {
      id: 'n-comp', icon: 'laptop',
      label: 'Perplexity Computer',
      sub: 'Builds threat_intel/*.json',
      pill: 'PR',
      activity: [0.30, 0.45, 0.25, 0.50, 0.40, 0.70, 0.80],
      activityPeak: 6
    }
  },
  core: {
    id: 'n-bumb',
    label: '02 · Bumblebee · one-shot read',
    name: 'Bumblebee',
    meta: 'Go 1.25 · static binary · zero deps',
    deck: 'Reads lockfiles, package-manager metadata, MCP configs, and editor & browser extensions on the endpoint. No package-manager execution. No source-file reads.',
    tiles: [
      { icon: 'endpoint', label: 'Endpoint',    count: '8,412' },
      { icon: 'doc',      label: 'Lockfiles',   count: '2,107' },
      { icon: 'config',   label: 'MCP configs', count: '914'   },
      { icon: 'ext',      label: 'Extensions',  count: '3,260' },
      { icon: 'warn',     label: 'Match',       count: '14', flag: true }
    ],
    table: [
      { k: 'Baseline', v: 'Common roots · extensions · MCP' },
      { k: 'Project',  v: 'Configured dev directories' },
      { k: 'Deep',     v: 'Explicit roots, on Computer trigger', accent: true }
    ]
  },
  outputs: {
    label: '03 · NDJSON output',
    nodes: [
      {
        id: 'n-pkg', icon: 'box',
        label: 'Package records',
        sub: '~14.7k / scan',
        activity: [0.55, 0.60, 0.50, 0.65, 0.60, 0.62, 0.58]
      },
      {
        id: 'n-find', icon: 'warn',
        label: 'Findings',
        sub: '14 in last run',
        accent: true,
        activity: [0.10, 0.05, 0.20, 0.08, 0.30, 0.15, 0.95],
        activityPeak: 6
      },
      {
        id: 'n-sum', icon: 'lines',
        label: 'Scan summary',
        sub: 'For state promotion',
        activity: [0.45, 0.50, 0.55, 0.48, 0.52, 0.50, 0.55]
      }
    ]
  },
  footerLeft: 'github.com/perplexityai/bumblebee',
  footerRight: 'Catalog refreshed by Computer when a new campaign is reported',
  stamp: 'PPLX · diagram-system v0.1 · pipeline archetype · 2026.05',
  wires: [
    // Throughput-weighted; spine collection from feeds into Computer
    { from: '.n-pub', fromSide: 'right', to: '.n-comp', toSide: 'right',
      via: 'spine', spineGroup: 'feeds', style: 'neutral', arrow: false, weight: 0.30 },
    { from: '.n-3p',  fromSide: 'right', to: '.n-comp', toSide: 'right',
      via: 'spine', spineGroup: 'feeds', style: 'neutral', arrow: false, weight: 0.65 },
    { from: '.n-comp', fromSide: 'right', to: '.n-bumb', toSide: 'left',
      style: 'ink', weight: 0.55 },
    // Output fan: package records is the high-volume path, findings is the punchline (rare),
    // scan summary is moderate
    { from: '.n-bumb', fromSide: 'right', to: '.n-pkg',  toSide: 'left',
      style: 'neutral', weight: 0.95 },
    { from: '.n-bumb', fromSide: 'right', to: '.n-find', toSide: 'left',
      style: 'accent',  weight: 0.10 },
    { from: '.n-bumb', fromSide: 'right', to: '.n-sum',  toSide: 'left',
      style: 'neutral', weight: 0.50 }
  ],
  wiresVertical: [
    { from: '.n-pub', fromSide: 'bottom', to: '.n-comp', toSide: 'bottom',
      via: 'spine', spineGroup: 'feeds', style: 'neutral', arrow: false, weight: 0.30 },
    { from: '.n-3p',  fromSide: 'bottom', to: '.n-comp', toSide: 'bottom',
      via: 'spine', spineGroup: 'feeds', style: 'neutral', arrow: false, weight: 0.65 },
    { from: '.n-comp', fromSide: 'bottom', to: '.n-bumb', toSide: 'top',
      style: 'ink', weight: 0.55 },
    { from: '.n-bumb', fromSide: 'bottom', to: '.n-pkg',  toSide: 'top',
      style: 'neutral', weight: 0.95 },
    { from: '.n-bumb', fromSide: 'bottom', to: '.n-find', toSide: 'top',
      style: 'accent',  weight: 0.10 },
    { from: '.n-bumb', fromSide: 'bottom', to: '.n-sum',  toSide: 'top',
      style: 'neutral', weight: 0.50 }
  ]
};
