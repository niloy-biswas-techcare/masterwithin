/**
 * The 8 fixed Wisdom Library categories (§6).
 *
 * This is the canonical taxonomy used by routing, filtering, and the Substack
 * auto-categorizer. `icon` is a Lucide icon name (kept as a string so this package
 * stays free of any React/icon dependency). `keywords` drive auto-categorization
 * on ingest (§8).
 *
 * An article has exactly ONE category but many free-form tags (§6).
 */
export interface Category {
  /** Stable numeric-string id (1..8). */
  id: string;
  /** Immutable kebab-case slug used in URLs. */
  slug: string;
  title: string;
  description: string;
  /** Lucide icon name (resolved to a component in the UI layer). */
  icon: string;
  /** Lower-cased keywords matched against title/body for auto-categorization (§8). */
  keywords: string[];
}

export const CATEGORIES = [
  {
    id: '1',
    slug: 'science-of-consciousness',
    title: 'The Science of Consciousness',
    description:
      'The nature of mind, awareness, and the measurable study of inner experience.',
    icon: 'BrainCircuit',
    keywords: [
      'consciousness',
      'awareness',
      'mind',
      'meditation',
      'attention',
      'perception',
      'neuroscience',
      'self',
      'presence',
    ],
  },
  {
    id: '2',
    slug: 'optimal-living',
    title: 'Optimal Living & Micro-Habits',
    description:
      'Small, compounding practices for daily energy, focus, and a well-ordered life.',
    icon: 'Sparkles',
    keywords: [
      'habit',
      'habits',
      'routine',
      'discipline',
      'productivity',
      'focus',
      'sleep',
      'energy',
      'lifestyle',
      'micro-habit',
    ],
  },
  {
    id: '3',
    slug: 'conscious-relationships',
    title: 'Conscious Relationships & Evolutionary Genetics',
    description:
      'Love, family, and compatibility seen through awareness and our evolutionary nature.',
    icon: 'HeartHandshake',
    keywords: [
      'relationship',
      'relationships',
      'love',
      'marriage',
      'family',
      'compatibility',
      'partner',
      'intimacy',
      'attachment',
      'genetics',
    ],
  },
  {
    id: '4',
    slug: 'self-actualization',
    title: 'Self-Actualization & True Education',
    description:
      'Becoming who you are: growth, learning, and an education that frees the person.',
    icon: 'GraduationCap',
    keywords: [
      'self-actualization',
      'growth',
      'potential',
      'education',
      'learning',
      'purpose',
      'meaning',
      'fulfillment',
      'dharma',
      'identity',
    ],
  },
  {
    id: '5',
    slug: 'holistic-wealth',
    title: 'Holistic Wealth & Purpose-Driven Economics',
    description:
      'Money, work, and value reimagined around purpose, sufficiency, and contribution.',
    icon: 'Coins',
    keywords: [
      'wealth',
      'money',
      'finance',
      'economics',
      'work',
      'career',
      'abundance',
      'value',
      'prosperity',
      'business',
    ],
  },
  {
    id: '6',
    slug: 'bio-vitality',
    title: 'Bio-Vitality & Natural Healing',
    description:
      'The body as a living system: nutrition, movement, and natural paths to vitality.',
    icon: 'Leaf',
    keywords: [
      'health',
      'healing',
      'nutrition',
      'diet',
      'movement',
      'exercise',
      'vitality',
      'body',
      'wellness',
      'natural',
    ],
  },
  {
    id: '7',
    slug: 'systems-of-peace',
    title: 'Systems of Peace & Social Architecture',
    description:
      'Designing families, communities, and societies that make peace the default.',
    icon: 'Globe',
    keywords: [
      'peace',
      'society',
      'community',
      'social',
      'systems',
      'governance',
      'conflict',
      'cooperation',
      'collective',
      'harmony',
    ],
  },
  {
    id: '8',
    slug: 'source-code',
    title: 'The Source Code',
    description:
      'The deepest layer: first principles, spirit, and the ground beneath all the rest.',
    icon: 'Code2',
    keywords: [
      'spirit',
      'spirituality',
      'source',
      'truth',
      'philosophy',
      'metaphysics',
      'reality',
      'being',
      'soul',
      'transcendence',
    ],
  },
] as const satisfies readonly Category[];

/** The slugs of the 8 categories, as a readonly tuple of literal strings. */
export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as readonly string[];

/** Sensible fallback when auto-categorization is ambiguous (§8). */
export const FALLBACK_CATEGORY_SLUG = 'source-code';

/** Look up a category by its slug. */
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
