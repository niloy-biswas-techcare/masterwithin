'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Fuse from 'fuse.js';
import { CATEGORIES } from '@mw/types';
import { ArticleCard, EmptyState, Pagination, Spinner } from '@mw/ui';
import * as LucideIcons from 'lucide-react';
import type { Article } from '@mw/types';
import { motionTokens } from '@/lib/motion';

async function fetchArticles(): Promise<Article[]> {
  const res = await fetch('/api/search-index');
  if (!res.ok) throw new Error('Failed to fetch search index');
  return res.json();
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BrainCircuit:   LucideIcons.BrainCircuit,
  Sparkles:       LucideIcons.Sparkles,
  HeartHandshake: LucideIcons.HeartHandshake,
  GraduationCap:  LucideIcons.GraduationCap,
  Coins:          LucideIcons.Coins,
  Leaf:           LucideIcons.Leaf,
  Globe:          LucideIcons.Globe,
  Code2:          LucideIcons.Code2,
};

/** Short label for tabs: trim "The" prefix and stop before " & ". */
function shortLabel(title: string): string {
  return title.split(' & ')[0].replace(/^The /, '');
}

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export function WisdomClient() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const activeCategory     = searchParams.get('category') || '';
  const currentPage        = parseInt(searchParams.get('page') || '1', 10);
  const initialSearchQuery = searchParams.get('q') || '';

  const [searchQuery,    setSearchQuery]    = useState(initialSearchQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialSearchQuery);

  const tabsRef        = useRef<HTMLDivElement>(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, [checkScroll]);

  const scrollTabs = (dir: 'left' | 'right') => {
    tabsRef.current?.scrollBy({ left: dir === 'right' ? 160 : -160, behavior: 'smooth' });
  };

  const updateUrlParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === '') params.delete(key);
        else params.set(key, val);
      });
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
    setDebouncedQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery !== initialSearchQuery)
        updateUrlParams({ q: searchQuery, page: '1' });
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, initialSearchQuery, updateUrlParams]);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn:  fetchArticles,
  });

  const fuse = useMemo(
    () => new Fuse(articles, { keys: ['title', 'excerpt', 'tags'], threshold: 0.35 }),
    [articles],
  );

  const filteredArticles = useMemo(() => {
    let list = articles;
    if (debouncedQuery.trim()) list = fuse.search(debouncedQuery).map((r) => r.item);
    if (activeCategory)        list = list.filter((a) => a.category === activeCategory);
    return list;
  }, [articles, debouncedQuery, activeCategory, fuse]);

  const limit         = 9;
  const totalArticles = filteredArticles.length;
  const totalPages    = Math.ceil(totalArticles / limit) || 1;

  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return filteredArticles.slice(start, start + limit);
  }, [filteredArticles, currentPage]);

  const handleCategoryToggle = (slug: string) =>
    updateUrlParams({ category: activeCategory === slug ? null : slug, page: '1' });

  const clearAllFilters = () => {
    setSearchQuery('');
    updateUrlParams({ q: null, category: null, page: '1' });
  };

  const activeCategoryData = CATEGORIES.find((c) => c.slug === activeCategory);
  const hasFilters         = !!(activeCategory || debouncedQuery.trim());

  return (
    <div className="min-h-screen">

      {/* ─────────────────────────────────────────────
          HERO — gradient + search
      ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 50% 0%, color-mix(in srgb, var(--color-primary) 11%, transparent), transparent 68%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.028]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-primary) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative mx-auto max-w-280 px-5 sm:px-8 lg:px-10 pt-20 pb-14 sm:pt-28 sm:pb-18">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
            className="flex flex-col items-center text-center"
          >
            {/* Eyebrow */}
            <motion.span
              variants={motionTokens.fadeUp}
              transition={{ duration: motionTokens.deliberate, ease: motionTokens.easeOut }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary"
            >
              <LucideIcons.BookOpen className="h-3 w-3" aria-hidden="true" />
              Library
            </motion.span>

            {/* H1 */}
            <motion.h1
              variants={motionTokens.fadeUp}
              transition={{ duration: motionTokens.deliberate, ease: motionTokens.easeOut }}
              className="font-display font-bold text-text leading-[1.08] tracking-tight"
              style={{ fontSize: 'clamp(2.75rem, 5vw, 4.5rem)' }}
            >
              Wisdom Library
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={motionTokens.fadeUp}
              transition={{ duration: motionTokens.deliberate, ease: motionTokens.easeOut }}
              className="mt-5 max-w-lg text-[1.0625rem] text-text/60 leading-relaxed"
            >
              Long-form essays and structured analyses across eight domains of human
              inquiry — each piece an invitation to think more deeply.
            </motion.p>

            {/* Search */}
            <motion.div
              variants={motionTokens.fadeUp}
              transition={{ duration: motionTokens.deliberate, ease: motionTokens.easeOut }}
              className="mt-8 w-full max-w-xl"
            >
              <div className="relative group">
                <LucideIcons.Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text/35 transition-colors group-focus-within:text-primary"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search writings, topics, concepts…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border/70 bg-surface/90 shadow-sm backdrop-blur-sm pl-11 pr-12 py-3.5 text-sm text-text placeholder:text-text/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  aria-label="Search the Wisdom Library"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      key="clear"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md text-text/40 hover:bg-muted/50 hover:text-text transition-colors"
                      aria-label="Clear search"
                    >
                      <LucideIcons.X className="h-3.5 w-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Stats */}
            {!isLoading && articles.length > 0 && (
              <motion.p
                variants={motionTokens.fadeIn}
                transition={{ duration: motionTokens.contemplative, delay: 0.35, ease: motionTokens.easeOut }}
                className="mt-4 text-[12px] text-text/35 font-body"
              >
                {articles.length} writings · {CATEGORIES.length} domains of inquiry
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          CATEGORY TABS — sticky underline-style nav
          Framer Motion layoutId slides the indicator
      ───────────────────────────────────────────── */}
      <div className="sticky top-[64px] z-20 bg-bg/95 backdrop-blur-sm">
        <div className="mx-auto max-w-280 px-5 sm:px-8 lg:px-10 relative">

          {/* Left fade + chevron */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.div
                key="fade-left"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 flex items-center pl-0"
                aria-hidden="true"
              >
                <div className="h-full w-16 bg-linear-to-r from-bg/95 to-transparent" />
                <motion.button
                  onClick={() => scrollTabs('left')}
                  className="pointer-events-auto absolute left-1 flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-surface/90 text-text/50 shadow-sm hover:border-primary/40 hover:text-primary transition-colors backdrop-blur-sm"
                  aria-label="Scroll tabs left"
                  whileTap={{ scale: 0.9 }}
                >
                  <LucideIcons.ChevronLeft className="h-3.5 w-3.5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right fade + chevron */}
          <AnimatePresence>
            {canScrollRight && (
              <motion.div
                key="fade-right"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 flex items-center justify-end pr-0"
                aria-hidden="true"
              >
                <div className="h-full w-16 bg-linear-to-l from-bg/95 to-transparent" />
                <motion.button
                  onClick={() => scrollTabs('right')}
                  className="pointer-events-auto absolute right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-surface/90 text-text/50 shadow-sm hover:border-primary/40 hover:text-primary transition-colors backdrop-blur-sm"
                  aria-label="Scroll tabs right"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ repeat: Infinity, repeatDelay: 2.5, duration: 0.5, ease: 'easeInOut' }}
                  whileTap={{ scale: 0.9 }}
                >
                  <LucideIcons.ChevronRight className="h-3.5 w-3.5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Filter by domain"
            className="flex overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* "All" tab */}
            <button
              role="tab"
              aria-selected={!activeCategory}
              onClick={() => updateUrlParams({ category: null, page: '1' })}
              className={[
                'relative flex shrink-0 items-center gap-1.5 py-4 pr-7 text-[13px] font-medium transition-colors duration-150 whitespace-nowrap',
                !activeCategory
                  ? 'text-primary'
                  : 'text-text/40 hover:text-text/70',
              ].join(' ')}
            >
              <LucideIcons.LayoutGrid className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              All writings
              {!activeCategory && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-7 h-0.5 rounded-t-full bg-primary"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* Per-category tabs */}
            {CATEGORIES.map((cat) => {
              const Icon       = iconMap[cat.icon];
              const isSelected = activeCategory === cat.slug;

              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleCategoryToggle(cat.slug)}
                  className={[
                    'relative flex shrink-0 items-center gap-1.5 py-4 pr-7 text-[13px] font-medium transition-colors duration-150 whitespace-nowrap',
                    isSelected
                      ? 'text-primary'
                      : 'text-text/40 hover:text-text/70',
                  ].join(' ')}
                >
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                  {shortLabel(cat.title)}
                  {isSelected && (
                    <motion.span
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-7 h-0.5 rounded-t-full bg-primary"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {/* Full-width divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border/30" aria-hidden="true" />
      </div>

      {/* ─────────────────────────────────────────────
          CONTENT — results header + article grid
      ───────────────────────────────────────────── */}
      <div className="mx-auto max-w-280 px-5 sm:px-8 lg:px-10 py-12 lg:py-16">

        {/* Active-filter context header */}
        <AnimatePresence mode="wait">
          {hasFilters && (
            <motion.div
              key="results-header"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-border/20"
            >
              <div>
                {activeCategoryData ? (
                  <>
                    <span className="block text-[11px] font-body font-semibold tracking-widest text-primary uppercase mb-1.5">
                      Domain
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-text leading-tight">
                      {activeCategoryData.title}
                    </h2>
                    <p className="mt-2 text-sm text-text/50 max-w-md leading-relaxed">
                      {activeCategoryData.description}
                    </p>
                  </>
                ) : (
                  <>
                    <span className="block text-[11px] font-body font-semibold tracking-widest text-primary uppercase mb-1.5">
                      Search
                    </span>
                    <h2 className="font-display text-2xl font-bold text-text">
                      &ldquo;{debouncedQuery}&rdquo;
                    </h2>
                  </>
                )}
                <p className="mt-2 text-xs text-text/40 font-body">
                  {totalArticles} {totalArticles === 1 ? 'writing' : 'writings'} found
                </p>
              </div>

              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-surface px-3.5 py-2 text-xs font-semibold text-text/55 hover:border-primary/40 hover:text-primary transition-all self-start sm:self-auto shrink-0"
              >
                <LucideIcons.X className="h-3 w-3" />
                Clear filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Article grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="text-sm text-text/40 font-body">Gathering writings…</p>
          </div>
        ) : paginatedArticles.length > 0 ? (
          <motion.div
            key={`grid-${activeCategory}-${debouncedQuery}-${currentPage}`}
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {paginatedArticles.map((art) => (
              <motion.div key={art.id} variants={cardVariants}>
                <ArticleCard
                  article={art}
                  href={`/wisdom/${art.category}/${art.slug}`}
                  categoryLabel={CATEGORIES.find((c) => c.slug === art.category)?.title}
                  className="h-full"
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <EmptyState
              title="The library is quiet here."
              description="Try a different path — adjust your keywords or explore another domain."
              action={
                <button
                  onClick={clearAllFilters}
                  className="rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-deep transition-colors"
                >
                  Explore the Library
                </button>
              }
            />
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-14 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              hrefForPage={(page) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', page.toString());
                return `${pathname}?${params.toString()}`;
              }}
            />
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────
          BOTTOM CTA — visible only when unfiltered
      ───────────────────────────────────────────── */}
      {!hasFilters && !isLoading && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: motionTokens.contemplative }}
          className="border-t border-border/30 bg-primary/3"
        >
          <div className="mx-auto max-w-280 px-5 sm:px-8 lg:px-10 py-16 text-center">
            <p className="font-display italic text-text/55 text-lg max-w-xl mx-auto leading-relaxed">
              &ldquo;If you&apos;ve ever felt that the answers must go deeper than what
              you&apos;ve been given — you&apos;re in the right place.&rdquo;
            </p>
            <a
              href="/start-here"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-deep transition-colors shadow-sm"
            >
              <LucideIcons.Compass className="h-4 w-4" aria-hidden="true" />
              Find your guided entry
            </a>
          </div>
        </motion.section>
      )}
    </div>
  );
}
