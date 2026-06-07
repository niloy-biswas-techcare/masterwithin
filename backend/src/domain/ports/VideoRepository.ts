import type { Video } from '../entities';

/** Filter/paging options for video listings (§7b, §8c). */
export interface VideoListFilter {
  language?: 'en' | 'bn' | 'hi';
  category?: string;
  /** Defaults to false — Shorts are excluded unless explicitly requested. */
  isShort?: boolean;
  featured?: boolean;
  hidden?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * VideoRepository port (§9).
 *
 * Videos are YouTube-sourced and never hand-created; writes happen only through
 * `upsert` (idempotent by YouTube video ID) plus the curation mutators.
 */
export interface VideoRepository {
  list(filter?: VideoListFilter): Promise<Video[]>;
  count(filter?: VideoListFilter): Promise<number>;
  getById(id: string): Promise<Video | null>;
  upsert(video: Video): Promise<Video>;
  setFeatured(id: string, featured: boolean): Promise<Video>;
  setHidden(id: string, hidden: boolean): Promise<Video>;
  overrideCategory(id: string, category: string): Promise<Video>;
}
