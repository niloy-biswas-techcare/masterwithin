import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getStartHere, listArticles } from '@mw/backend';
import { Card } from '@mw/ui';
import { AnimateOnScroll } from '@/components/shared/AnimateOnScroll';
import { Compass, HelpCircle, Heart, ArrowRight, BookOpen } from 'lucide-react';
import type { StartHereConfig, Article } from '@mw/types';
import { generateSiteMetadata } from '@/lib/seo';

export const revalidate = 3600;

export const metadata: Metadata = generateSiteMetadata({
  title: 'Guided Entry — Find Your Path',
  description:
    'New to Master Within Foundation? Choose your entry path — finding purpose, exploring consciousness, navigating relationships, or beginning a spiritual journey.',
  path: '/start-here',
});

/* Question-form Lora italic headlines per §4a.4.5 and §4a.5 */
const QUESTION_HEADLINES: Record<string, string> = {
  lost:          'I feel lost and need direction',
  meaning:       'I want deeper meaning in my life',
  relationships: 'My relationships are struggling',
  spirituality:  'I want to explore spirituality',
};

export default async function StartHerePage() {
  let config: StartHereConfig = [];
  let articles: Article[] = [];

  try {
    config = await getStartHere();
    articles = await listArticles();
  } catch (err) {
    console.error('[start-here] Failed to fetch data:', err);
  }

  if (!config || config.length === 0) {
    config = [
      {
        id: 'lost',
        title: 'I Feel Lost',
        blurb: 'Focusing on direction, personal duty, and finding your dharma.',
        targetTags: ['purpose', 'direction', 'dharma'],
        deeperCtaLabel: 'Explore Purpose & Meaning',
        deeperCtaHref: '/wisdom?tag=purpose',
      },
      {
        id: 'meaning',
        title: 'I Want Deeper Meaning',
        blurb: 'Exploring classical philosophy, awareness, and the nature of mind.',
        targetTags: ['philosophy', 'consciousness'],
        deeperCtaLabel: 'Explore Consciousness',
        deeperCtaHref: '/wisdom?category=science-of-consciousness',
      },
      {
        id: 'relationships',
        title: 'My Relationships are Struggling',
        blurb: 'Approaching love, marital harmony, and genetics with full awareness.',
        targetTags: ['relationships', 'family', 'compatibility'],
        deeperCtaLabel: 'Explore Relationships',
        deeperCtaHref: '/wisdom?category=conscious-relationships',
      },
      {
        id: 'spirituality',
        title: 'I Want to Explore Spirituality',
        blurb: 'Introductory readings on spiritual principles and our collective ideal.',
        targetTags: ['spirituality', 'philosophy'],
        deeperCtaLabel: 'Read Our Ideal',
        deeperCtaHref: '/our-ideal',
      },
    ];
  }

  const iconMap: Record<string, React.ReactNode> = {
    lost:          <Compass className="h-5 w-5" />,
    meaning:       <HelpCircle className="h-5 w-5" />,
    relationships: <Heart className="h-5 w-5" />,
    spirituality:  <BookOpen className="h-5 w-5" />,
  };

  return (
    <div className="mx-auto max-w-280 px-5 sm:px-8 lg:px-10 section-md flex flex-col gap-12">
      {/* Page Header */}
      <AnimateOnScroll variant="fadeUp">
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
          <span className="mb-2 block text-[11px] font-body font-semibold tracking-widest text-primary uppercase">
            Guided Entry
          </span>
          <h1 className="font-display font-bold tracking-tight text-text" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Where would you like to begin?
          </h1>
          <p className="mt-4 text-text/70 leading-relaxed font-body text-[0.9375rem]">
            Choose the path that resonates with your current state. These collections are curated dynamically from the library.
          </p>
        </div>
      </AnimateOnScroll>

      {/* Grid of paths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {config.map((path, i) => {
          const matchedArticles = articles
            .filter((art) => {
              const matchesTag = path.targetTags.some((tag) => art.tags?.includes(tag));
              const matchesCategory = path.targetCategory ? art.category === path.targetCategory : false;
              return matchesTag || matchesCategory;
            })
            .slice(0, 3);

          /* Question-form headline in Lora italic (§4a.4.5) */
          const questionHeadline = QUESTION_HEADLINES[path.id] ?? path.title;

          return (
            <AnimateOnScroll key={path.id} variant="fadeUp" delay={i * 0.08}>
              <Card className="p-8 flex flex-col justify-between gap-6 hover:shadow-md transition-shadow duration-300 border border-border/60 bg-surface/50 h-full">
                <div className="flex flex-col gap-4">
                  {/* Icon circle (§4a.5) */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 text-primary">
                    {iconMap[path.id] ?? <Compass className="h-5 w-5" />}
                  </div>

                  {/* Question-form headline — Lora italic (§4a.4.5) */}
                  <h2 className="font-display italic font-semibold text-2xl text-text leading-snug">
                    &ldquo;{questionHeadline}&rdquo;
                  </h2>

                  <p className="text-text/70 text-[0.9375rem] leading-relaxed font-body">{path.blurb}</p>

                  {/* Dynamically resolved matching articles */}
                  <div className="mt-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-text/50 mb-3">
                      Suggested Writings
                    </h3>
                    {matchedArticles.length > 0 ? (
                      <ul className="flex flex-col gap-2.5">
                        {matchedArticles.map((art) => (
                          <li key={art.id} className="group">
                            <Link
                              href={`/wisdom/${art.category}/${art.slug}`}
                              className="flex items-start gap-2 text-sm text-text/80 hover:text-primary transition-colors font-body"
                            >
                              <span className="text-primary mt-1 select-none shrink-0">▪</span>
                              <span className="underline group-hover:no-underline">{art.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-text/50 italic">New writings matching this path are being curated.</p>
                    )}
                  </div>
                </div>

                {/* Path CTA — "Begin this path" (§4a.4.5) */}
                <div className="mt-4 border-t border-border/40 pt-6">
                  <Link
                    href={path.deeperCtaHref}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-deep text-white px-5 py-3 min-h-11 font-body font-semibold text-sm transition-colors shadow-sm w-full sm:w-auto"
                  >
                    {path.deeperCtaLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </Card>
            </AnimateOnScroll>
          );
        })}
      </div>
    </div>
  );
}
