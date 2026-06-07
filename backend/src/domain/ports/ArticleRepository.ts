import type { Article } from '../entities';

/** Filter/paging options for article listings (§7.2, §12.2). */
export interface ArticleListFilter {
  /** Restrict to a single category slug. */
  category?: string;
  /** Restrict to articles carrying this (normalized) tag. */
  tag?: string;
  /** Only featured articles (home page, §7.1). */
  featured?: boolean;
  /** 1-based page number for indexable pagination (§7.2). */
  page?: number;
  /** Page size; when omitted the adapter returns all matches. */
  pageSize?: number;
}

/**
 * ArticleRepository port (§9).
 *
 * Articles are Substack-sourced and never hand-created (§8, §17.5): writes happen
 * only through `upsert` (idempotent by stable `id`) plus the curation mutators.
 */
export interface ArticleRepository {
  /** List articles newest-first, optionally filtered/paged. */
  list(filter?: ArticleListFilter): Promise<Article[]>;
  /** Total count matching a filter (for pagination math). */
  count(filter?: ArticleListFilter): Promise<number>;
  /** Fetch one article by its immutable slug, or null. */
  getBySlug(slug: string): Promise<Article | null>;
  /** Fetch one article by its stable id, or null. */
  getById(id: string): Promise<Article | null>;
  /** Idempotent upsert by stable `id` (safe to re-run on every sync, §8). */
  upsert(article: Article): Promise<Article>;
  /** Toggle the `featured` flag (curation, §17.5). */
  setFeatured(id: string, featured: boolean): Promise<Article>;
  /** Set the category and lock it against future syncs (`categoryLocked = true`, §8). */
  overrideCategory(id: string, category: string): Promise<Article>;
  /** Delete an article by its stable id. */
  delete(id: string): Promise<void>;
}
