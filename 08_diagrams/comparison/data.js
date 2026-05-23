window.COMPARISON_DATA = {
  kicker: 'BrowseComp · Long-horizon web research',
  title: 'Search benchmark · Sonar Reasoning Pro leads',
  scale: {
    label: 'Score (%)',
    benchmark: 'BrowseComp · n = 1,266',
    min: 0,
    max: 75,
    ticks: [0, 25, 50, 75],
    unit: '%'
  },
  rows: [
    {
      name: 'Sonar Reasoning Pro',
      value: 53.4,
      display: '53.4',
      ci: [51.6, 55.2],
      delta: '+8.1 vs gpt-5',
      category: 'Perplexity',
      accent: true
    },
    {
      name: 'GPT-5',
      value: 45.3,
      display: '45.3',
      ci: [43.5, 47.1],
      delta: '+9.7 vs claude-4',
      category: 'OpenAI',
      series: 2
    },
    {
      name: 'Claude Opus 4',
      value: 35.6,
      display: '35.6',
      ci: [33.9, 37.3],
      delta: '+4.8 vs gemini-3',
      category: 'Anthropic',
      series: 2
    },
    {
      name: 'Gemini 3 Pro',
      value: 30.8,
      display: '30.8',
      ci: [29.2, 32.4],
      delta: '+9.5 vs grok-4',
      category: 'Google',
      series: 2
    },
    {
      name: 'Grok 4',
      value: 21.3,
      display: '21.3',
      ci: [19.8, 22.8],
      delta: '+8.7 vs o3',
      category: 'xAI',
      series: 3
    },
    {
      name: 'o3',
      value: 12.6,
      display: '12.6',
      ci: [11.4, 13.8],
      delta: 'baseline',
      category: 'OpenAI',
      series: 3
    }
  ],
  note: 'CI bars · 95% bootstrap · 1,266 long-horizon web-research questions',
  noteRight: 'research.perplexity.ai · 2026.04',
  footerLeft: 'research.perplexity.ai/articles/browsecomp',
  footerRight: 'Higher is better · CI = 95% bootstrap',
  stamp: 'PPLX · diagram-system v0.1 · comparison archetype · 2026.05'
};
