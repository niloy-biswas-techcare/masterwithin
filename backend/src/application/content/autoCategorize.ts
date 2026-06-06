import { CATEGORIES, FALLBACK_CATEGORY_SLUG } from '@mw/types';
import { htmlToText } from './sanitize';

/** What the categorizer reads to score a category. */
export interface CategorizeInput {
  title: string;
  /** Sanitized or raw HTML body; tags are stripped before matching. */
  bodyHtml?: string;
  /** Normalized tags, weighted slightly higher than body matches. */
  tags?: readonly string[];
}

/** Weighting: title and tag hits count for more than body hits. */
const TITLE_WEIGHT = 3;
const TAG_WEIGHT = 2;
const BODY_WEIGHT = 1;

/** Count whole-word occurrences of `keyword` in `haystack` (already lower-cased). */
function countMatches(haystack: string, keyword: string): number {
  if (!keyword) return 0;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`, 'g');
  return (haystack.match(re) ?? []).length;
}

/**
 * Auto-categorize an article by keyword match against the 8 fixed categories (§6, §8).
 * Returns the best-scoring category slug, or the sensible fallback when nothing
 * matches (§8). Pure — depends only on the canonical `CATEGORIES` constant.
 */
export function autoCategorize(input: CategorizeInput): string {
  const title = input.title.toLowerCase();
  const body = input.bodyHtml ? htmlToText(input.bodyHtml).toLowerCase() : '';
  const tags = (input.tags ?? []).join(' ').toLowerCase();

  let bestSlug = FALLBACK_CATEGORY_SLUG;
  let bestScore = 0;

  for (const category of CATEGORIES) {
    let score = 0;
    for (const keyword of category.keywords) {
      const kw = keyword.toLowerCase();
      score += countMatches(title, kw) * TITLE_WEIGHT;
      score += countMatches(tags, kw) * TAG_WEIGHT;
      score += countMatches(body, kw) * BODY_WEIGHT;
    }
    if (score > bestScore) {
      bestScore = score;
      bestSlug = category.slug;
    }
  }

  return bestScore > 0 ? bestSlug : FALLBACK_CATEGORY_SLUG;
}

/**
 * Resolve the category to store for an article, respecting a manual lock (§8).
 * If `categoryLocked` is true, the existing category is preserved untouched; only
 * unlocked articles are (re)categorized by keywords. This is what lets an editor's
 * override survive every future sync (§8, §17.5).
 */
export function resolveCategory(args: {
  input: CategorizeInput;
  existingCategory?: string;
  categoryLocked?: boolean;
}): string {
  if (args.categoryLocked && args.existingCategory) return args.existingCategory;
  return autoCategorize(args.input);
}
