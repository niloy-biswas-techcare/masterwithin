import { slugify, normalizeTags } from '@mw/utils';
import { stableId } from './stableId';
import { buildExcerpt } from './excerpt';

/**
 * Substack RSS fetch + parse + normalize (§8). Runs **server-side only** — the
 * browser never touches RSS (§8) 🔒. The parser is pure and dependency-free; the
 * network fetch is injected (`FeedFetcher`) so the core stays IO-free and unit-testable.
 */

/** A raw item lifted out of the Substack feed XML. */
export interface SubstackItem {
  guid: string;
  link: string;
  title: string;
  /** Post HTML, straight from the feed — NOT yet sanitized (§8). */
  contentHtml: string;
  /** ISO publish date. */
  publishedAt: string;
  /** Free-form categories/tags declared in the feed. */
  tags: string[];
  /** Raw XML block — used internally to extract cover images from enclosure/media tags. */
  _rawBlock?: string;
}

/** A normalized article draft: stable identity + raw body, ready for sanitize/categorize. */
export interface ArticleDraft {
  id: string;
  title: string;
  slug: string;
  rawBodyHtml: string;
  tags: string[];
  publishedAt: string;
  substackUrl: string;
  coverImage?: string;
  excerpt?: string;
}


/** Server-side fetcher returning the raw feed XML; injected to keep parsing pure. */
export type FeedFetcher = (url: string) => Promise<string>;

/** Unwrap `<![CDATA[ ... ]]>` and decode the handful of XML entities Substack emits. */
function decodeXml(value: string): string {
  const cdata = value.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  const text = cdata ? cdata[1] : value;
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

/** Extract the first `<tag>…</tag>` (optionally namespaced) inner content. */
function pick(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i');
  const m = block.match(re);
  return m ? m[1] : undefined;
}

/** Parse Substack feed XML into raw items. Pure: no IO, no DOM. */
export function parseSubstackRss(xml: string): SubstackItem[] {
  const items: SubstackItem[] = [];
  const itemRe = /<item\b[\s\S]*?<\/item>/gi;
  const blocks = xml.match(itemRe) ?? [];

  for (const block of blocks) {
    const link = decodeXml(pick(block, 'link') ?? '');
    const guidRaw = decodeXml(pick(block, 'guid') ?? '');
    const title = decodeXml(pick(block, 'title') ?? '');
    const content = decodeXml(
      pick(block, 'content:encoded') ?? pick(block, 'description') ?? '',
    );
    const pubDate = decodeXml(pick(block, 'pubDate') ?? '');

    // Substack declares post topics as repeated <category> elements.
    const categories = [...block.matchAll(/<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/gi)]
      .map((m) => decodeXml(m[1]))
      .filter(Boolean);

    const guid = guidRaw || link;
    if (!guid && !link) continue; // an item with no identity is unusable

    const iso = pubDate ? new Date(pubDate).toISOString() : new Date(0).toISOString();

    items.push({
      guid,
      link,
      title,
      contentHtml: content,
      publishedAt: Number.isNaN(Date.parse(pubDate)) && pubDate ? new Date(0).toISOString() : iso,
      tags: categories,
      _rawBlock: block,
    });
  }

  return items;
}

/** Pull the first `<img src>` out of post HTML as a cover-image candidate. */
function firstImage(html: string): string | undefined {
  const m = html.match(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i);
  return m ? m[1] : undefined;
}

/** Pull the cover image URL from enclosure or media tags in the raw RSS block. */
function extractCoverFromBlock(block: string): string | undefined {
  // <enclosure url="..." type="image/..."/>
  const enclosure = block.match(/<enclosure\b[^>]*\burl\s*=\s*["']([^"']+)["'][^>]*type\s*=\s*["']image[^"']*["']/i)
    ?? block.match(/<enclosure\b[^>]*type\s*=\s*["']image[^"']*["'][^>]*\burl\s*=\s*["']([^"']+)["']/i);
  if (enclosure) return enclosure[1];

  // <media:thumbnail url="..."/>
  const mediaThumbnail = block.match(/<media:thumbnail\b[^>]*\burl\s*=\s*["']([^"']+)["']/i);
  if (mediaThumbnail) return mediaThumbnail[1];

  // <media:content url="..." medium="image"/>
  const mediaContent = block.match(/<media:content\b[^>]*\burl\s*=\s*["']([^"']+)["'][^>]*medium\s*=\s*["']image["']/i)
    ?? block.match(/<media:content\b[^>]*medium\s*=\s*["']image["'][^>]*\burl\s*=\s*["']([^"']+)["']/i);
  if (mediaContent) return mediaContent[1];

  return undefined;
}

/**
 * Normalize a raw feed item into an `ArticleDraft`: derive the stable id (hash of
 * guid/link), the immutable slug, normalized tags, and a cover-image candidate (§8).
 * Sanitization and categorization happen downstream in `syncSubstack`.
 */
export function normalizeFeedItem(item: SubstackItem): ArticleDraft {
  const id = stableId(item.guid || item.link);
  const slug = slugify(item.title) || id;
  const coverImage =
    (item._rawBlock ? extractCoverFromBlock(item._rawBlock) : undefined)
    ?? firstImage(item.contentHtml);
  return {
    id,
    title: item.title,
    slug,
    rawBodyHtml: item.contentHtml,
    tags: normalizeTags(item.tags),
    publishedAt: item.publishedAt,
    substackUrl: item.link,
    coverImage,
    excerpt: buildExcerpt(item.contentHtml),
  };
}

/** Fetch + parse + normalize in one step (server-side, §8). */
export async function fetchSubstackDrafts(
  feedUrl: string,
  fetcher: FeedFetcher,
): Promise<ArticleDraft[]> {
  const xml = await fetcher(feedUrl);
  return parseSubstackRss(xml).map(normalizeFeedItem);
}
