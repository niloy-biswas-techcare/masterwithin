import type { Article } from '@mw/types';

/**
 * Canonical TanStack Query keys + client fetchers (§12.2, §12.6 RC 2/bullet 4).
 *
 * The same key + fetcher must be used by the server prefetch (`HydrationBoundary`),
 * the navbar intent-warming, and the client reader (`WisdomClient`) so a dehydrated
 * or prefetched entry is a cache **hit** on arrival — never a duplicate fetch.
 */
export const articlesListKey = ['articles'] as const;

/** Lightweight client fetch of the prebuilt search index (§12.4). */
export async function fetchArticlesIndex(): Promise<Article[]> {
  const res = await fetch('/api/search-index');
  if (!res.ok) throw new Error('Failed to fetch search index');
  return res.json();
}
