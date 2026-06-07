import type { Article, Video, Playlist } from '@mw/types';

export async function fetchArticles(): Promise<Article[]> {
  const res = await fetch('/api/search-index');
  if (!res.ok) throw new Error('Failed to fetch articles');
  return res.json();
}

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

// Video / Playlist query keys (§8c, §12.2)
export const videosListKey = ['videos'] as const;
export const videoKey = (id: string) => ['video', id] as const;
export const playlistsListKey = ['playlists'] as const;
export const playlistKey = (id: string) => ['playlist', id] as const;

export async function fetchVideos(): Promise<{ videos: Video[]; total: number }> {
  const res = await fetch('/api/videos');
  if (!res.ok) throw new Error('Failed to fetch videos');
  return res.json();
}

export async function fetchPlaylists(): Promise<{ playlists: Playlist[]; total: number }> {
  const res = await fetch('/api/playlists');
  if (!res.ok) throw new Error('Failed to fetch playlists');
  return res.json();
}
