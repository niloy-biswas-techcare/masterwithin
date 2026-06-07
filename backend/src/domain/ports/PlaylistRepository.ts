import type { Playlist } from '../entities';

/** Filter/paging options for playlist listings (§7b, §8c). */
export interface PlaylistListFilter {
  language?: 'en' | 'bn' | 'hi';
  featured?: boolean;
  hidden?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * PlaylistRepository port (§9).
 *
 * Playlists are YouTube-sourced; writes happen only through `upsert` (idempotent by
 * YouTube playlist ID) plus the curation mutators.
 */
export interface PlaylistRepository {
  list(filter?: PlaylistListFilter): Promise<Playlist[]>;
  count(filter?: PlaylistListFilter): Promise<number>;
  getById(id: string): Promise<Playlist | null>;
  upsert(playlist: Playlist): Promise<Playlist>;
  setFeatured(id: string, featured: boolean): Promise<Playlist>;
  setHidden(id: string, hidden: boolean): Promise<Playlist>;
  updateDescription(id: string, description: string): Promise<Playlist>;
}
