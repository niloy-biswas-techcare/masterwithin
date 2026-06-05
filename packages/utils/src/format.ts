/** Average adult reading speed (words per minute) used for reading-time. */
const WORDS_PER_MINUTE = 200;

/**
 * Format an integer INR amount as a price string, e.g. `formatPrice(1299)` → "₹1,299".
 * Prices are integers in INR throughout the system (§10, §16).
 */
export function formatPrice(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Format an ISO date string for human display, e.g. "6 June 2026".
 * Returns the original string unchanged if it isn't a parseable date.
 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * Normalize a date to an ISO 8601 string (used for the machine-readable `datetime`
 * attribute and for storage). Returns the original string if unparseable.
 */
export function toIsoDate(input: string | number | Date): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return String(input);
  return date.toISOString();
}

/**
 * Estimate reading time in whole minutes from plain text or HTML (§4, §8).
 * Strips tags, counts words, and returns at least 1.
 */
export function readingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
