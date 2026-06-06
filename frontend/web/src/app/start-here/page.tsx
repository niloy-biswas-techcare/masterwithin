import React from 'react';
import Link from 'next/link';
import { getStartHere, listArticles } from '@mw/backend';
import { Card } from '@mw/ui';
import { Compass, HelpCircle, Heart, ArrowRight, BookOpen } from 'lucide-react';
import type { StartHereConfig, Article } from '@mw/types';

export const revalidate = 3600; // Cache for 1 hour (ISR)

export default async function StartHerePage() {
  let config: StartHereConfig = [];
  let articles: Article[] = [];

  try {
    config = await getStartHere();
    articles = await listArticles();
  } catch (err) {
    console.error('[start-here] Failed to fetch data on start-here page:', err);
  }

  // Fallbacks if database is empty/offline
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
        deeperCtaLabel: 'Read Our Creed',
        deeperCtaHref: '/our-ideal',
      },
    ];
  }

  const iconMap: Record<string, React.ReactNode> = {
    lost: <Compass className="h-6 w-6 text-primary" />,
    meaning: <HelpCircle className="h-6 w-6 text-amber-500" />,
    relationships: <Heart className="h-6 w-6 text-rose-500" />,
    spirituality: <BookOpen className="h-6 w-6 text-indigo-500" />,
  };

  return (
    <div className="mx-auto max-w-content px-6 py-12 flex flex-col gap-12">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wider text-primary uppercase">
          Orientation
        </span>
        <h1 className="font-display text-4xl font-bold tracking-tight text-text sm:text-5xl">
          Start Here
        </h1>
        <p className="mt-4 text-text/80 leading-relaxed font-body">
          If you are visiting for the first time, choose the path that resonates with your current state of life. These collections are curated dynamically from our library.
        </p>
      </div>

      {/* Grid of paths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {config.map((path) => {
          // Resolve matching articles dynamically based on tags and category matching (§7.4)
          const matchedArticles = articles
            .filter((art) => {
              const matchesTag = path.targetTags.some((tag) => art.tags?.includes(tag));
              const matchesCategory = path.targetCategory ? art.category === path.targetCategory : false;
              return matchesTag || matchesCategory;
            })
            .slice(0, 3); // Display top 3 articles

          return (
            <Card key={path.id} className="p-8 flex flex-col justify-between gap-6 hover:shadow-md transition-all duration-300 border border-border/60 bg-surface/30">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-surface border border-border/60">
                    {iconMap[path.id] || <Compass className="h-6 w-6 text-primary" />}
                  </div>
                  <h2 className="font-display text-2xl font-bold text-text">{path.title}</h2>
                </div>
                
                <p className="text-text/80 text-base leading-relaxed font-body">{path.blurb}</p>

                {/* Dynamically resolved matching articles */}
                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text/50 mb-3">Suggested Readings</h3>
                  {matchedArticles.length > 0 ? (
                    <ul className="flex flex-col gap-2.5">
                      {matchedArticles.map((art) => (
                        <li key={art.id} className="group">
                          <Link
                            href={`/wisdom/${art.category}/${art.slug}`}
                            className="flex items-start gap-2 text-sm text-text/95 hover:text-primary transition-colors font-body"
                          >
                            <span className="text-primary mt-1 select-none">▪</span>
                            <span className="underline group-hover:no-underline">{art.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-text/50 italic">New readings matching this path are being processed.</p>
                  )}
                </div>
              </div>

              {/* Path CTA */}
              <div className="mt-6 border-t border-border/40 pt-6">
                <Link
                  href={path.deeperCtaHref}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/95 text-white px-5 py-3 font-semibold text-sm transition-colors shadow-sm w-full sm:w-auto"
                >
                  {path.deeperCtaLabel} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
