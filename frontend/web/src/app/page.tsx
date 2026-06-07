import React from 'react';
import Link from 'next/link';
import { getSiteConfig, listArticles, listVideos } from '@mw/backend';
import { SmartArticleCard } from '@/components/shared/SmartCards';
import { VideoCard } from '@mw/ui';
import { AnimateOnScroll } from '@/components/shared/AnimateOnScroll';
import { HeroSection } from '@/features/home/HeroSection';
import { ArrowRight, BookOpen, GraduationCap, ShoppingBag } from 'lucide-react';
import type { Article, SiteConfig, Video } from '@mw/types';

export const revalidate = 3600;

export default async function Home() {
  let articles: Article[] = [];
  let siteConfig: SiteConfig | null = null;
  let featuredVideos: Video[] = [];

  try {
    [articles, siteConfig] = await Promise.all([listArticles(), getSiteConfig()]);
  } catch (err) {
    console.error('[home] Failed to fetch server data:', err);
  }

  try {
    const { videos } = await listVideos({ featured: true });
    featuredVideos = videos.slice(0, 3);
    if (featuredVideos.length === 0) {
      const { videos: recent } = await listVideos();
      featuredVideos = recent.slice(0, 3);
    }
  } catch {
    // Videos not available yet — section renders empty state
  }

  const displayedArticles = articles.length
    ? articles.slice(0, 3)
    : ([
        {
          id: '1', title: 'The Nature of Conscious Awareness',
          excerpt: 'An investigation into the foundational aspects of subjective experience and neuroscience.',
          category: 'science-of-consciousness', tags: ['consciousness', 'mind'],
          publishedAt: new Date().toISOString(), readingTime: 6, bodyHtml: '',
          slug: 'nature-of-conscious-awareness', featured: false, categoryLocked: false,
          substackUrl: 'https://substack.com',
        },
        {
          id: '2', title: 'Compounding Micro-Habits for Clarity',
          excerpt: 'How tiny changes in daily focus, sleep, and physical movement restructure the brain.',
          category: 'optimal-living', tags: ['habits', 'focus'],
          publishedAt: new Date().toISOString(), readingTime: 4, bodyHtml: '',
          slug: 'compounding-micro-habits', featured: false, categoryLocked: false,
          substackUrl: 'https://substack.com',
        },
        {
          id: '3', title: 'The Metaphysics of First Principles',
          excerpt: 'Deconstructing our modern assumptions to align with the core code of ancient philosophy.',
          category: 'source-code', tags: ['philosophy', 'spirit'],
          publishedAt: new Date().toISOString(), readingTime: 8, bodyHtml: '',
          slug: 'metaphysics-of-first-principles', featured: false, categoryLocked: false,
          substackUrl: 'https://substack.com',
        },
      ] as Article[]);

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      {/* 1. Hero — animated client component (§4a.5, §4a.4.2) */}
      <HeroSection />

      {/* 2. Featured Writings — section-md (§4a.1) */}
      <section className="section-md bg-bg border-b border-border/20">
        <div className="mx-auto max-w-280 px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
            <AnimateOnScroll variant="fadeUp">
              <div>
                <span className="block text-[11px] font-body font-semibold tracking-widest text-primary uppercase mb-1">
                  Insights
                </span>
                <h2 className="font-display text-[2rem] font-bold tracking-[-0.01em] text-text leading-[1.2]">
                  Featured Writings
                </h2>
                <p className="mt-2 text-text/70 max-w-md font-body text-[0.9375rem]">
                  Carefully composed essays exploring habits, neuroscience, and first principles.
                </p>
              </div>
            </AnimateOnScroll>
            <Link
              href="/wisdom"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline shrink-0"
            >
              Explore the Library <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayedArticles.map((art, i) => (
              <AnimateOnScroll key={art.id} variant="fadeUp" delay={i * 0.05} className="h-full">
                <SmartArticleCard
                  article={art}
                  href={`/wisdom/${art.category}/${art.slug}`}
                  className="h-full"
                />
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Conversations — section-md (6d.7: VideoCard from backend) */}
      <section className="section-md bg-surface/30 border-b border-border/20">
        <div className="mx-auto max-w-280 px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
            <AnimateOnScroll variant="fadeUp">
              <div>
                <span className="block text-[11px] font-body font-semibold tracking-widest text-primary uppercase mb-1">
                  Conversations
                </span>
                <h2 className="font-display text-[2rem] font-bold tracking-[-0.01em] text-text leading-[1.2]">
                  Spiritual Inquiries
                </h2>
                <p className="mt-2 text-text/70 max-w-md font-body text-[0.9375rem]">
                  Discussions, guided reflections, and research breakdowns on our channel.
                </p>
              </div>
            </AnimateOnScroll>
            <Link
              href="/media"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline shrink-0"
            >
              Explore all talks <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>

          {featuredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredVideos.map((video, i) => (
                <AnimateOnScroll key={video.id} variant="fadeUp" delay={i * 0.05} className="h-full">
                  <VideoCard video={video} href={`/media/${video.id}`} linkComponent={Link} className="h-full" />
                </AnimateOnScroll>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text/50 font-body">
              <p>Talks will appear here after the first YouTube sync.</p>
              <Link href="/media" className="mt-4 inline-block text-primary font-medium hover:underline">
                Browse the Media Library
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 4. Course Teaser — section-md */}
      <section className="section-md bg-bg border-b border-border/20">
        <div className="mx-auto max-w-280 px-5 sm:px-8 lg:px-10">
          <AnimateOnScroll variant="fadeUp">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-r from-primary/5 via-surface to-bg p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="max-w-xl relative z-10">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-widest text-primary uppercase">
                  <GraduationCap className="h-3 w-3" aria-hidden="true" /> Structured Learning
                </span>
                <h2 className="mt-4 font-display text-2xl font-bold text-text sm:text-3xl">
                  Deepen Your Understanding
                </h2>
                <p className="mt-3 text-text/80 leading-relaxed font-body text-[0.9375rem]">
                  Contemplative learning paths curated to take you from foundational self-discipline to deep cosmological inquiry.
                </p>
              </div>
              <Link
                href="/courses"
                className="relative z-10 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 min-h-11 font-body font-semibold text-white hover:bg-deep transition-colors shadow-sm whitespace-nowrap"
              >
                Begin this path <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* 5. Store Teaser — section-md */}
      <section className="section-md bg-surface/30">
        <div className="mx-auto max-w-280 px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <AnimateOnScroll variant="fadeUp" className="max-w-md">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-widest text-primary uppercase">
                  <BookOpen className="h-3 w-3" aria-hidden="true" /> Bookstore
                </span>
                <h2 className="mt-4 font-display text-[2rem] font-bold tracking-[-0.01em] text-text leading-[1.2]">
                  Writings & Free Resources
                </h2>
                <p className="mt-4 text-text/80 leading-relaxed font-body text-[0.9375rem]">
                  Core texts, essays, and free guides designed to structure daily practice and contemplative habits.
                </p>
                <div className="mt-8">
                  <Link
                    href="/store"
                    className="inline-flex items-center gap-2 rounded-lg bg-surface border border-border px-5 py-2.5 text-sm font-semibold text-text hover:bg-primary/5 hover:border-primary/30 transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4 text-primary" aria-hidden="true" /> Browse Bookstore
                  </Link>
                </div>
              </div>
            </AnimateOnScroll>

            <div className="flex items-center justify-center gap-4 md:gap-6 relative">
              {([
                { label: 'Self-Actualization', title: 'The Path Within', rotate: '-6deg', color: 'text-primary', elevated: false },
                { label: 'Consciousness', title: 'Inner Horizons', rotate: '0deg', color: 'text-indigo-500', elevated: true },
                { label: 'Optimal Living', title: 'Daily Code', rotate: '6deg', color: 'text-emerald-500', elevated: false },
              ] as const).map((book) => (
                <AnimateOnScroll key={book.title} variant="scaleUp">
                  <div
                    className={`h-48 w-32 md:h-56 md:w-36 rounded-lg bg-surface border border-border ${book.elevated ? 'shadow-md z-10' : 'shadow-sm'} flex flex-col justify-between p-4 cursor-pointer hover:-translate-y-2 transition-transform duration-300`}
                    style={{ rotate: book.rotate } as React.CSSProperties}
                  >
                    <span className={`text-[10px] uppercase font-semibold font-body ${book.color}`}>{book.label}</span>
                    <span className="font-display font-bold text-text text-sm leading-tight mt-2">{book.title}</span>
                    <span className="text-[9px] text-text/50">Souvik Ghosh</span>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

