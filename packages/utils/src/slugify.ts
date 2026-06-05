/**
 * Convert arbitrary text into a stable, URL-safe kebab-case slug (§24).
 *
 * - lower-cased
 * - accents/diacritics stripped (é → e)
 * - non-alphanumeric runs collapse to a single hyphen
 * - no leading/trailing hyphens
 *
 * Stable: the same input always yields the same output. Article slugs are derived
 * once on ingest and never change (§8).
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFKD') // split accented chars into base + combining mark
    .replace(/[̀-ͯ]/g, '') // strip the combining marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // any run of non-alphanumerics → single hyphen
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}
