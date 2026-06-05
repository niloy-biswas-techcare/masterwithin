import { slugify } from './slugify';

/**
 * Normalize a single tag: lower-cased, kebab-cased (§6). Returns an empty string
 * for input that contains no usable characters.
 */
export function normalizeTag(tag: string): string {
  return slugify(tag);
}

/**
 * Normalize a list of tags: each lower-cased + kebab-cased, empties dropped, and
 * deduplicated while preserving first-seen order (§6). Applied on ingest.
 */
export function normalizeTags(tags: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const tag = normalizeTag(raw);
    if (tag && !seen.has(tag)) {
      seen.add(tag);
      out.push(tag);
    }
  }
  return out;
}
