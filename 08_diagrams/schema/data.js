window.PPLX_PRODUCT_SURFACE = {
  kicker: 'Perplexity · Product surface',
  title: 'One question, four surfaces',
  hub: {
    id: 'core',
    name: 'Perplexity Answer Engine',
    meta: 'Shared retrieval, ranking, generation',
    deck: 'Every surface answers from the same engine. The shape of the answer is what changes.',
    accent: true
  },
  leaves: [
    {
      id: 'comet',
      pos: 'N',
      name: 'Comet',
      meta: 'Browser',
      sub: 'Agentic browsing with site-aware actions.',
      edgeLabel: 'browses'
    },
    {
      id: 'search',
      pos: 'E',
      name: 'Search',
      meta: 'Web · Mobile',
      sub: 'Cited answers across web, image, video, academic.',
      edgeLabel: 'answers'
    },
    {
      id: 'computer',
      pos: 'S',
      name: 'Computer',
      meta: 'Agent surface',
      sub: 'Multi-step tasks across connected apps and the web.',
      edgeLabel: 'acts'
    },
    {
      id: 'api',
      pos: 'W',
      name: 'API · Sonar',
      meta: 'Developers',
      sub: 'Same retrieval + reasoning available to any app.',
      edgeLabel: 'serves'
    }
  ],
  footerLeft: 'perplexity.ai · product surfaces · may 2026',
  footerRight: 'One engine · four shapes',
  stamp: 'PPLX · diagram-system v0.2 · schema archetype · 2026.05'
};
