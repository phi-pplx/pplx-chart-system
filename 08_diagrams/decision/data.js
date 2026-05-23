window.PPLX_COMPUTER_ROUTING = {
  kicker: 'Perplexity Computer · Task routing',
  title: 'How Computer chooses a path',
  start: {
    name: 'User prompt arrives',
    deck: 'Computer parses the prompt, looks at attached context, and decides which path will reach the answer fastest.',
    meta: 'Step 0 · Parse'
  },
  checks: [
    {
      q: 'Does the prompt reference a connected app?',
      chosen: 'yes',
      branches: [
        { side: 'yes', tag: 'Match', lbl: 'Route to connector',     sub: 'Gmail, Linear, Notion, Slack, GitHub, calendar, drive, more.' },
        { side: 'no',  tag: 'No match', lbl: 'Continue to browse', sub: 'No app context. Try the web next.' }
      ]
    },
    {
      q: 'Can the answer be found on the public web?',
      chosen: 'yes',
      branches: [
        { side: 'yes', tag: 'Web', lbl: 'Search + fetch', sub: 'Parallel queries, then read selected sources.' },
        { side: 'no',  tag: 'Web fails', lbl: 'Use the model', sub: 'Reason from training, mark uncertainty.' }
      ]
    },
    {
      q: 'Does the task need a multi-step action?',
      chosen: 'yes',
      branches: [
        { side: 'yes', tag: 'Plan', lbl: 'Spawn subagents', sub: 'Parallelize independent steps, then assemble.' },
        { side: 'no',  tag: 'Single', lbl: 'Answer inline', sub: 'One pass, one response.' }
      ]
    }
  ],
  end: {
    name: 'Deliver the answer',
    meta: 'Step N · Respond',
    deck: 'Cited, formatted, and ready to act on. Or hand off as a deliverable file.',
    accent: true
  },
  footerLeft: 'perplexity.ai/computer · task routing · may 2026',
  footerRight: 'Default path · most-common case',
  stamp: 'PPLX · diagram-system v0.2 · decision archetype · 2026.05'
};
