'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Fuse from 'fuse.js';
import { CATEGORIES } from '@mw/types';
import { ArticleCard, CategoryCard, EmptyState, Pagination, Spinner } from '@mw/ui';
import * as LucideIcons from 'lucide-react';
import type { Article } from '@mw/types';

// Isomorphic fetcher (§12.5)
async function fetchArticles(): Promise<Article[]> {
  const res = await fetch('/api/search-index');
  if (!res.ok) {
    throw new Error('Failed to fetch search index');
  }
  return res.json();
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BrainCircuit: LucideIcons.BrainCircuit,
  Sparkles: LucideIcons.Sparkles,
  HeartHandshake: LucideIcons.HeartHandshake,
  GraduationCap: LucideIcons.GraduationCap,
  Coins: LucideIcons.Coins,
  Leaf: LucideIcons.Leaf,
  Globe: LucideIcons.Globe,
  Code2: LucideIcons.Code2,
};

export function WisdomClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Search parameters for filters
  const activeCategory = searchParams.get('category') || '';
  const activeTag = searchParams.get('tag') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const initialSearchQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialSearchQuery);

  // Helper to construct and update URL search parameters
  const updateUrlParams = React.useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Sync state with url changes (e.g. going back in history)
  useEffect(() => {
    setSearchQuery(initialSearchQuery);
    setDebouncedQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  // Debounce search query input to avoid lag
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery !== initialSearchQuery) {
        updateUrlParams({ q: searchQuery, page: '1' });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, initialSearchQuery, updateUrlParams]);

  // Query articles list (uses server prefetch cache)
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: fetchArticles,
  });

  // Compile unique tags for tag filter list
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    articles.forEach((art) => {
      art.tags?.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet).sort();
  }, [articles]);

  // Fuse.js setup for client-side search
  const fuse = useMemo(() => {
    return new Fuse(articles, {
      keys: ['title', 'excerpt', 'tags'],
      threshold: 0.35,
    });
  }, [articles]);

  // Filter and Search execution
  const filteredArticles = useMemo(() => {
    let list = articles;

    // 1. Fuzzy Search
    if (debouncedQuery.trim()) {
      list = fuse.search(debouncedQuery).map((res) => res.item);
    }

    // 2. Category Filter
    if (activeCategory) {
      list = list.filter((art) => art.category === activeCategory);
    }

    // 3. Tag Filter
    if (activeTag) {
      list = list.filter((art) => art.tags?.includes(activeTag));
    }

    return list;
  }, [articles, debouncedQuery, activeCategory, activeTag, fuse]);

  // Calculate dynamic article counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach((art) => {
      counts[art.category] = (counts[art.category] || 0) + 1;
    });
    return counts;
  }, [articles]);

  // Pagination bounds
  const limit = 9;
  const totalArticles = filteredArticles.length;
  const totalPages = Math.ceil(totalArticles / limit) || 1;
  
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return filteredArticles.slice(start, start + limit);
  }, [filteredArticles, currentPage, limit]);



  const handleCategoryToggle = (slug: string) => {
    updateUrlParams({
      category: activeCategory === slug ? null : slug,
      page: '1',
    });
  };

  const handleTagToggle = (tag: string) => {
    updateUrlParams({
      tag: activeTag === tag ? null : tag,
      page: '1',
    });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    updateUrlParams({
      q: null,
      category: null,
      tag: null,
      page: '1',
    });
  };

  return (
    <div className="mx-auto max-w-content px-6 py-12 flex flex-col gap-12">
      {/* Page Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Library</span>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-text">Wisdom Library</h1>
        <p className="mt-2 text-text/70 max-w-2xl font-body">
          Explore long-form essays, structured analyses, and research papers organized into our primary domains of inquiry.
        </p>
      </div>

      {/* Category Grid Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {CATEGORIES.map((cat) => {
          const Icon = iconMap[cat.icon];
          const count = categoryCounts[cat.slug] || 0;
          const isSelected = activeCategory === cat.slug;
          
          return (
            <CategoryCard
              key={cat.id}
              category={cat}
              href="#"
              count={count}
              icon={Icon ? <Icon className="h-6 w-6" /> : null}
              className={`cursor-pointer border transition-all duration-300 ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30'
                  : 'border-border/60 bg-surface/40 hover:bg-surface/80 hover:border-border'
              }`}
              anchorProps={{
                onClick: (e) => {
                  e.preventDefault();
                  handleCategoryToggle(cat.slug);
                },
              }}
            />
          );
        })}
      </section>

      {/* Search and Tag Filtering Interface */}
      <section className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Side: Articles List & Search */}
        <div className="flex-1 w-full flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
            <div className="relative flex-1 w-full">
              <LucideIcons.Search className="absolute left-3 top-3 h-4 w-4 text-text/50" />
              <input
                type="text"
                placeholder="Search articles, tags, concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3.5 text-xs text-text/50 hover:text-text"
                >
                  Clear
                </button>
              )}
            </div>

            {(activeCategory || activeTag || searchQuery) && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-primary hover:underline whitespace-nowrap self-end sm:self-center"
              >
                Reset all filters
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner className="h-8 w-8 text-primary" />
            </div>
          ) : paginatedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paginatedArticles.map((art) => (
                <ArticleCard
                  key={art.id}
                  article={art}
                  href={`/wisdom/${art.category}/${art.slug}`}
                  categoryLabel={CATEGORIES.find((c) => c.slug === art.category)?.title}
                  className="h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="The library is quiet here."
              description="Try a different path — adjust your keywords or category filters."
              action={
                <button
                  onClick={clearAllFilters}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/95 transition-colors"
                >
                  Reset Filters
                </button>
              }
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
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

        {/* Right Side: Sidebar Tags filter */}
        <div className="w-full md:w-64 border border-border/60 rounded-xl bg-surface/30 p-6 flex flex-col gap-4">
          <h3 className="font-display font-bold text-sm text-text flex items-center gap-1.5 border-b border-border/40 pb-2">
            <LucideIcons.Tag className="h-4 w-4 text-primary" /> Filter by Tag
          </h3>
          
          {allTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isSelected = activeTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`text-xs px-2.5 py-1 rounded-full transition-all border ${
                      isSelected
                        ? 'bg-primary border-primary text-white font-medium shadow-sm'
                        : 'bg-surface hover:bg-surface-hover border-border/60 text-text/80'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-text/50 italic">No tags available</p>
          )}
        </div>
      </section>
    </div>
  );
}
