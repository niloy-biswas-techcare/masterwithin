import { htmlToText } from './sanitize';

/** Default excerpt length, in characters (§7.2 article cards). */
const DEFAULT_LENGTH = 200;

/**
 * Build a plain-text excerpt from HTML or text (§7.2, §8). Strips tags, collapses
 * whitespace, and truncates at a word boundary with an ellipsis when needed.
 */
export function buildExcerpt(content: string, maxLength = DEFAULT_LENGTH): string {
  const text = htmlToText(content);
  if (text.length <= maxLength) return text;
  const sliced = text.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(' ');
  const cut = lastSpace > maxLength * 0.5 ? sliced.slice(0, lastSpace) : sliced;
  return `${cut.trimEnd()}…`;
}
