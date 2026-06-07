'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Fuse from 'fuse.js';
import * as LucideIcons from 'lucide-react';
import { VideoCard, PlaylistCard, EmptyState, Eyebrow, Container } from '@mw/ui';
import { videosListKey, playlistsListKey, fetchVideos, fetchPlaylists } from '@/lib/queries';
import { motionTokens } from '@/lib/motion';

const PAGE_SIZE = 9;

type Language = 'all' | 'en' | 'bn' | 'hi';
type ContentType = 'all' | 'journeys' | 'talks' | 'shorts';

const LANGUAGE_TABS: { value: Language; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'en', label: 'English' },
  { value: 'bn', label: 'বাংলা' },
  { value: 'hi', label: 'हिंदी' },
];

const CONTENT_TABS: { value: ContentType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'journeys', label: 'Journeys' },
  { value: 'talks', label: 'Talks' },
  { value: 'shorts', label: 'Brief Reflections' },
];

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: motionTokens.standard, ease: motionTokens.easeOut as [number, number, number, number] },
  },
};

// ─── Pagination helpers ───────────────────────────────────────────────────────

function getPageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  if (current > 3) pages.push('…');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

interface MediaPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  buildHref: (page: number) => string;
  onPageChange: (page: number) => void;
}

function MediaPagination({ currentPage, totalPages, totalItems, buildHref, onPageChange }: MediaPaginationProps) {
  if (totalPages <= 1) return null;
  const from = (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, totalItems);
  const pages = getPageRange(currentPage, totalPages);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-4 pt-6"
    >
      <p className="text-sm text-text/45 font-body">
        Showing{' '}
        <span className="text-text/65 font-medium">{from}–{to}</span>
        {' '}of{' '}
        <span className="text-text/65 font-medium">{totalItems}</span>
        {' '}talks
      </p>

      <nav aria-label="Video pagination" className="flex items-center gap-1 flex-wrap justify-center">
        {/* Previous */}
        {currentPage > 1 ? (
          <Link
            href={buildHref(currentPage - 1)}
            onClick={(e) => { e.preventDefault(); onPageChange(currentPage - 1); }}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border/60 text-sm font-body text-text/55 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
            aria-label="Previous page"
          >
            <LucideIcons.ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </Link>
        ) : (
          <span className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border/30 text-sm font-body text-text/25 cursor-not-allowed select-none">
            <LucideIcons.ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </span>
        )}

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-1.5 py-2 text-text/30 text-sm select-none">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(p as number)}
              onClick={(e) => { e.preventDefault(); onPageChange(p as number); }}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg px-2.5 text-sm font-body border transition-all ${
                p === currentPage
                  ? 'bg-primary text-surface border-primary font-semibold shadow-sm pointer-events-none'
                  : 'border-border/60 text-text/60 hover:border-primary/40 hover:text-primary hover:bg-primary/5'
              }`}
            >
              {p}
            </Link>
          )
        )}

        {/* Next */}
        {currentPage < totalPages ? (
          <Link
            href={buildHref(currentPage + 1)}
            onClick={(e) => { e.preventDefault(); onPageChange(currentPage + 1); }}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border/60 text-sm font-body text-text/55 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
            aria-label="Next page"
          >
            Next
            <LucideIcons.ChevronRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border/30 text-sm font-body text-text/25 cursor-not-allowed select-none">
            Next
            <LucideIcons.ChevronRight className="h-3.5 w-3.5" />
          </span>
        )}
      </nav>
    </motion.div>
  );
}

// ─── Main client component ────────────────────────────────────────────────────

export function MediaClient() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const initialQ    = searchParams.get('q') || '';
  const [searchQuery,    setSearchQuery]    = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);

  const language    = (searchParams.get('lang') || 'all') as Language;
  const contentType = (searchParams.get('type') || 'all') as ContentType;
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const updateUrlParams = useCallback(
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

  const buildPageHref = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page === 1) params.delete('page');
      else params.set('page', String(page));
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [searchParams, pathname],
  );

  // Sync search input when URL ?q changes externally
  useEffect(() => {
    setSearchQuery(initialQ);
    setDebouncedQuery(initialQ);
  }, [initialQ]);

  // Debounce search → update URL, reset page
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery !== initialQ)
        updateUrlParams({ q: searchQuery || null, page: null });
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, initialQ, updateUrlParams]);

  const setLanguage = (val: Language) =>
    updateUrlParams({ lang: val === 'all' ? null : val, page: null });

  const setContentType = (val: ContentType) =>
    updateUrlParams({ type: val === 'all' ? null : val, page: null });

  const clearAllFilters = () => {
    setSearchQuery('');
    updateUrlParams({ q: null, lang: null, type: null, page: null });
  };

  const goToPage = useCallback(
    (page: number) => {
      updateUrlParams({ page: page === 1 ? null : String(page) });
      // Scroll to the talks section header after navigation settles
      setTimeout(() => {
        document.getElementById('talks-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    },
    [updateUrlParams],
  );

  const { data: videosData } = useQuery({
    queryKey: videosListKey,
    queryFn: fetchVideos,
  });

  const { data: playlistsData } = useQuery({
    queryKey: playlistsListKey,
    queryFn: fetchPlaylists,
  });

  const allVideos    = videosData?.videos    ?? [];
  const allPlaylists = playlistsData?.playlists ?? [];

  // Fuse instances
  const videoFuse = useMemo(
    () => new Fuse(allVideos, { keys: ['title', 'description', 'category'], threshold: 0.35 }),
    [allVideos],
  );
  const playlistFuse = useMemo(
    () => new Fuse(allPlaylists, { keys: ['title', 'description'], threshold: 0.35 }),
    [allPlaylists],
  );

  const isShortFilter = contentType === 'shorts' ? true : contentType === 'talks' ? false : undefined;
  const langFilter    = language === 'all' ? undefined : language;

  const filteredVideos = useMemo(() => {
    let list = debouncedQuery.trim()
      ? videoFuse.search(debouncedQuery).map((r) => r.item)
      : allVideos;
    list = list.filter((v) => {
      const langMatch  = !langFilter || v.language === langFilter;
      const shortMatch = isShortFilter === undefined ? !v.isShort : v.isShort === isShortFilter;
      return langMatch && shortMatch;
    });
    return list;
  }, [allVideos, debouncedQuery, videoFuse, langFilter, isShortFilter]);

  const filteredPlaylists = useMemo(() => {
    let list = debouncedQuery.trim()
      ? playlistFuse.search(debouncedQuery).map((r) => r.item)
      : allPlaylists;
    list = list.filter((p) => !langFilter || p.language === langFilter);
    return list;
  }, [allPlaylists, debouncedQuery, playlistFuse, langFilter]);

  // Pagination
  const totalVideoPages  = Math.ceil(filteredVideos.length / PAGE_SIZE);
  const safeCurrentPage  = Math.min(currentPage, Math.max(1, totalVideoPages));
  const paginatedVideos  = filteredVideos.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  const showPlaylists    = contentType === 'all' || contentType === 'journeys';
  const showVideos       = contentType === 'all' || contentType === 'talks' || contentType === 'shorts';
  const featuredPlaylists = filteredPlaylists.filter((p) => p.featured);
  const displayPlaylists  = featuredPlaylists.length > 0 ? featuredPlaylists : filteredPlaylists.slice(0, 3);

  const hasFilters = !!(debouncedQuery.trim() || language !== 'all' || contentType !== 'all');
  const totalResults =
    (showPlaylists ? displayPlaylists.length : 0) +
    (showVideos ? filteredVideos.length : 0);

  return (
    <>
      {/* Hero */}
      <section className="pt-16 pb-10 md:pt-20 md:pb-12 bg-gradient-to-b from-primary/5 to-bg relative overflow-hidden">
        <Container variant="content" className="flex flex-col items-center text-center gap-5">
          <Eyebrow>Spoken Wisdom</Eyebrow>
          <motion.h1
            className="font-display font-bold text-[clamp(2.25rem,5vw,3.75rem)] leading-tight text-text tracking-[-0.02em]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.deliberate, ease: motionTokens.easeOut as [number, number, number, number] }}
          >
            Wisdom in Every Language
          </motion.h1>
          <motion.p
            className="max-w-xl text-text/70 font-body leading-relaxed text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.deliberate, delay: 0.1, ease: motionTokens.easeOut as [number, number, number, number] }}
          >
            Spoken explorations of consciousness, meaning, and inner growth — available in English, Bengali, and Hindi.
          </motion.p>

          {/* Search input */}
          <motion.div
            className="mt-2 w-full max-w-xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.deliberate, delay: 0.18, ease: motionTokens.easeOut as [number, number, number, number] }}
          >
            <div className="relative group">
              <LucideIcons.Search
                className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text/35 transition-colors group-focus-within:text-primary"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search talks, journeys, topics…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border/70 bg-surface/90 shadow-sm backdrop-blur-sm pl-11 pr-12 py-3.5 text-sm text-text placeholder:text-text/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                aria-label="Search the media library"
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

          <motion.p
            className="text-sm text-text/50 font-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: motionTokens.standard, delay: 0.25 }}
          >
            {allVideos.length} talks · {allPlaylists.length} journeys · 3 channels
          </motion.p>
        </Container>
      </section>

      {/* Sticky filter bar */}
      <div className="sticky top-[64px] z-20 bg-bg/95 backdrop-blur-sm border-b border-border/60">
        <Container variant="content" className="py-3 flex flex-col gap-2.5">
          {/* Language filter */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {LANGUAGE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setLanguage(tab.value)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-body font-medium border transition-colors ${
                  language === tab.value
                    ? 'bg-primary text-surface border-primary shadow-sm ring-1 ring-primary'
                    : 'border-border/60 text-text/70 hover:border-primary/40 hover:text-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content type filter */}
          <div className="flex gap-1.5 flex-wrap">
            {CONTENT_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setContentType(tab.value)}
                className={`px-3 py-1 rounded-md text-sm font-body border transition-colors ${
                  contentType === tab.value
                    ? 'bg-primary/10 text-primary border-primary/30 font-medium'
                    : 'border-border text-text/60 hover:text-primary hover:border-primary/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Container>
      </div>

      <Container variant="content" className="pt-8 pb-16 flex flex-col gap-12">

        {/* Active filter context header */}
        <AnimatePresence mode="wait">
          {hasFilters && (
            <motion.div
              key="results-header"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border/20"
            >
              <div>
                {debouncedQuery.trim() ? (
                  <>
                    <span className="block text-[11px] font-body font-semibold tracking-widest text-primary uppercase mb-1.5">
                      Search
                    </span>
                    <h2 className="font-display text-2xl font-bold text-text">
                      &ldquo;{debouncedQuery}&rdquo;
                    </h2>
                  </>
                ) : (
                  <span className="block text-[11px] font-body font-semibold tracking-widest text-primary uppercase mb-1.5">
                    Filtered
                  </span>
                )}
                <p className="mt-1.5 text-xs text-text/40 font-body">
                  {totalResults} {totalResults === 1 ? 'result' : 'results'} found
                </p>
              </div>

              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-surface px-3.5 py-2 text-xs font-semibold text-text/55 hover:border-primary/40 hover:text-primary transition-all self-start sm:self-auto shrink-0"
              >
                <LucideIcons.X className="h-3 w-3" />
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Featured Journeys */}
        {showPlaylists && displayPlaylists.length > 0 && (
          <section aria-labelledby="journeys-heading">
            <Eyebrow>Guided Journeys</Eyebrow>
            <h2 id="journeys-heading" className="font-display font-bold text-2xl text-text mt-2 mb-6">
              Structured Paths of Inquiry
            </h2>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={gridVariants}
              initial="hidden"
              animate="visible"
            >
              {displayPlaylists.map((pl) => (
                <motion.div key={pl.id} variants={cardVariants} className="h-full">
                  <PlaylistCard playlist={pl} href={`/media/playlists/${pl.id}`} linkComponent={Link} className="h-full" />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* Latest Talks */}
        {showVideos && (
          <section aria-labelledby="talks-heading">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <Eyebrow>Latest Talks</Eyebrow>
                <h2 id="talks-heading" className="font-display font-bold text-2xl text-text mt-2">
                  {contentType === 'shorts' ? 'Brief Reflections' : 'Spoken Wisdom'}
                </h2>
              </div>
              {filteredVideos.length > 0 && (
                <span className="text-sm text-text/40 font-body shrink-0 pb-0.5">
                  {filteredVideos.length} {filteredVideos.length === 1 ? 'talk' : 'talks'}
                </span>
              )}
            </div>

            {filteredVideos.length === 0 ? (
              <EmptyState
                title="No talks match your search."
                description="Try different keywords or clear the filters to explore all content."
              />
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`grid-${language}-${contentType}-${debouncedQuery}-${safeCurrentPage}`}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={gridVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {paginatedVideos.map((video) => (
                      <motion.div key={video.id} variants={cardVariants} className="h-full">
                        <VideoCard video={video} href={`/media/${video.id}`} linkComponent={Link} className="h-full" />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                <MediaPagination
                  currentPage={safeCurrentPage}
                  totalPages={totalVideoPages}
                  totalItems={filteredVideos.length}
                  buildHref={buildPageHref}
                  onPageChange={goToPage}
                />
              </>
            )}
          </section>
        )}

        {/* Empty state when everything is filtered out */}
        {hasFilters && !showPlaylists && filteredVideos.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <EmptyState
              title="The library is quiet here."
              description="Try a different keyword or adjust the language and content filters."
            />
          </motion.div>
        )}

        {/* Bottom CTA */}
        <div className="flex flex-col items-center text-center gap-4 pt-6 border-t border-border">
          <p className="font-display italic text-text/70 max-w-lg">
            "The spoken word opens the door; the written word deepens the room."
          </p>
          <Link
            href="/wisdom"
            className="text-primary font-body font-medium hover:underline"
          >
            Explore the written library →
          </Link>
        </div>
      </Container>
    </>
  );
}
