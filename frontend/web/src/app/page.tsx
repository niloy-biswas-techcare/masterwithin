import React from 'react';
import Link from 'next/link';
import { getSiteConfig, listArticles } from '@mw/backend';
import { ArticleCard } from '@mw/ui';
import { LiteYouTube } from '@/components/shared/LiteYouTube';
import { ArrowRight, BookOpen, Compass, GraduationCap, ShoppingBag } from 'lucide-react';
import type { Article, SiteConfig } from '@mw/types';

// Page is static/ISR and revalidates dynamically (§12.3)
export const revalidate = 3600;

export default async function Home() {
  let articles: Article[] = [];
  let siteConfig: SiteConfig | null = null;

  try {
    // Fetch site data server-side
    articles = await listArticles();
    siteConfig = await getSiteConfig();
  } catch (err) {
    console.error('[home] Failed to fetch server data on home page:', err);
  }

  // Fallbacks if database is empty/offline
  const featuredVideoIds = siteConfig?.youtube?.featuredVideoIds?.length
    ? siteConfig.youtube.featuredVideoIds
    : ['dQw4w9WgXcQ', 'tVzXRx9612s', 'KxQ_B7Jd-10'];

  const displayedArticles = articles.length
    ? articles.slice(0, 3)
    : [
        {
          id: '1',
          title: 'The Nature of Conscious Awareness',
          excerpt: 'An investigation into the foundational aspects of subjective experience and neuroscience.',
          category: 'science-of-consciousness',
          tags: ['consciousness', 'mind'],
          publishedAt: new Date().toISOString(),
          readingTime: 6,
          bodyHtml: '',
          slug: 'nature-of-conscious-awareness',
          featured: false,
          categoryLocked: false,
          substackUrl: 'https://substack.com',
        },
        {
          id: '2',
          title: 'Compounding Micro-Habits for Clarity',
          excerpt: 'How tiny changes in daily focus, sleep, and physical movement restructure the brain.',
          category: 'optimal-living',
          tags: ['habits', 'focus'],
          publishedAt: new Date().toISOString(),
          readingTime: 4,
          bodyHtml: '',
          slug: 'compounding-micro-habits',
          featured: false,
          categoryLocked: false,
          substackUrl: 'https://substack.com',
        },
        {
          id: '3',
          title: 'The Metaphysics of First Principles',
          excerpt: 'Deconstructing our modern assumptions to align with the core code of ancient philosophy.',
          category: 'source-code',
          tags: ['philosophy', 'spirit'],
          publishedAt: new Date().toISOString(),
          readingTime: 8,
          bodyHtml: '',
          slug: 'metaphysics-of-first-principles',
          featured: false,
          categoryLocked: false,
          substackUrl: 'https://substack.com',
        },
      ] as Article[];

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface/50 to-bg py-24 md:py-32 border-b border-border/20">
        {/* Subtle grid pattern background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary)_0.5%,_transparent_15%)] opacity-30 dark:opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,_var(--color-border)_1px,_transparent_1px),_linear-gradient(to_bottom,_var(--color-border)_1px,_transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.03] dark:opacity-[0.06] pointer-events-none" />

        <div className="mx-auto max-w-content px-6 text-center relative z-10 flex flex-col items-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wider text-primary uppercase">
            <Compass className="h-3 w-3" /> Digital Sanctuary
          </span>
          <h1 className="max-w-3xl font-display text-4xl font-bold tracking-tight text-text sm:text-5xl md:text-6xl leading-[1.15]">
            Mastery is not in controlling others, but in returning to the <span className="text-primary">Source Within.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-text/85 leading-relaxed font-body">
            A contemplative school and digital sanctuary dedicated to self-actualization, systems of peace, and deep human consciousness.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link
              href="/wisdom"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/95 transition-colors shadow-sm"
            >
              Explore the Library <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/start-here"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 font-semibold text-text hover:bg-surface/90 hover:border-border/80 transition-colors"
            >
              Start Here <Compass className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Featured Articles */}
      <section className="py-20 bg-bg border-b border-border/20">
        <div className="mx-auto max-w-content px-6">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Insights</span>
              <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
                Featured Writings
              </h2>
              <p className="mt-2 text-text/70 max-w-md font-body">
                Carefully composed essays exploring habits, neuroscience, and first principles.
              </p>
            </div>
            <Link
              href="/wisdom"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              View all library entries <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayedArticles.map((art) => (
              <ArticleCard
                key={art.id}
                article={art}
                href={`/wisdom/${art.category}/${art.slug}`}
                className="h-full hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. YouTube section */}
      <section className="py-20 bg-surface/30 border-b border-border/20">
        <div className="mx-auto max-w-content px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Media</span>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Spiritual Inquiries
            </h2>
            <p className="mt-3 text-text/70 font-body">
              Listen to discussions, guided meditations, and research breakdowns on our channel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredVideoIds.slice(0, 3).map((vidId, i) => (
              <div key={vidId} className="flex flex-col gap-3">
                <LiteYouTube videoId={vidId} title={`Inquiry Episode ${i + 1}`} />
                <span className="text-xs text-text/60 px-1 font-body">Featured Video Inquiry #{i + 1}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href={siteConfig?.socials?.youtube || 'https://youtube.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text hover:bg-surface/85 transition-colors"
            >
              <Youtube className="h-4 w-4 text-red-500 fill-current" /> Visit YouTube Channel
            </a>
          </div>
        </div>
      </section>

      {/* 4. Course Teaser */}
      <section className="py-20 bg-bg border-b border-border/20">
        <div className="mx-auto max-w-content px-6">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-primary/5 via-surface to-bg p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-xl relative z-10">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <GraduationCap className="h-3 w-3" /> Structured Learning
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold text-text sm:text-3xl">
                Deepen Your Understanding
              </h2>
              <p className="mt-3 text-text/80 leading-relaxed font-body text-base">
                Interactive, contemplative learning paths curated to take you from foundational self-discipline to deep cosmological inquiry.
              </p>
            </div>
            <Link
              href="/courses"
              className="relative z-10 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/95 transition-colors shadow-sm whitespace-nowrap"
            >
              Explore Courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Store Teaser */}
      <section className="py-20 bg-surface/30">
        <div className="mx-auto max-w-content px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <BookOpen className="h-3 w-3" /> Bookstore
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
                Books & Free Resources
              </h2>
              <p className="mt-4 text-text/80 leading-relaxed font-body">
                Read core texts, essays, and download free guides designed to structure daily practice and contemplative habits.
              </p>
              <div className="mt-8">
                <Link
                  href="/store"
                  className="inline-flex items-center gap-2 rounded-lg bg-surface border border-border px-5 py-2.5 text-sm font-semibold text-text hover:bg-surface/85 transition-colors"
                >
                  <ShoppingBag className="h-4 w-4 text-primary" /> Browse Bookstore
                </Link>
              </div>
            </div>

            {/* Visual covers stack representation */}
            <div className="flex items-center justify-center gap-4 md:gap-6 relative">
              <div className="h-48 w-32 md:h-56 md:w-36 rounded-lg bg-surface border border-border shadow-sm flex flex-col justify-between p-4 rotate-[-6deg] hover:rotate-0 transition-transform duration-300 cursor-pointer">
                <span className="text-[10px] uppercase font-semibold text-primary font-sans">Self-Actualization</span>
                <span className="font-display font-bold text-text text-sm leading-tight mt-2">The Path Within</span>
                <span className="text-[9px] text-text/50">Souvik Ghosh</span>
              </div>
              <div className="h-48 w-32 md:h-56 md:w-36 rounded-lg bg-surface border border-border shadow-md flex flex-col justify-between p-4 z-10 hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                <span className="text-[10px] uppercase font-semibold text-indigo-500 font-sans">Consciousness</span>
                <span className="font-display font-bold text-text text-sm leading-tight mt-2">Inner Horizons</span>
                <span className="text-[9px] text-text/50">Souvik Ghosh</span>
              </div>
              <div className="h-48 w-32 md:h-56 md:w-36 rounded-lg bg-surface border border-border shadow-sm flex flex-col justify-between p-4 rotate-[6deg] hover:rotate-0 transition-transform duration-300 cursor-pointer">
                <span className="text-[10px] uppercase font-semibold text-emerald-500 font-sans">Optimal Living</span>
                <span className="font-display font-bold text-text text-sm leading-tight mt-2">Daily Code</span>
                <span className="text-[9px] text-text/50">Souvik Ghosh</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Minimal stub for Youtube icon since we use standard Lucide icons
function Youtube({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9" />
    </svg>
  );
}
