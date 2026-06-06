import { env } from '../../env';
import type { Ports, Article, AuditLogRepository } from '../../domain';
import { parseSubstackRss, normalizeFeedItem, resolveCategory, htmlToText, stableId } from '../content';
import { sanitizeHtml } from '../content/sanitize';
import { buildExcerpt } from '../content/excerpt';
import { writeAuditLogHelper } from '../audit/writeAuditLog';
import { revalidatePath } from '../revalidate';
import { buildDiff } from '../audit/writeAuditLog';
import { slugify } from '@mw/utils';

export type ImportBySubstackUrl = (
  actor: { uid: string; email: string },
  url: string,
  fetcher?: (url: string) => Promise<string>
) => Promise<Article>;

const defaultFetcher = async (url: string): Promise<string> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP fetch failed with status: ${res.status}`);
  return res.text();
};

/**
 * Clean XML entities for scraping fallback.
 */
function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

/**
 * Scrapes metadata and content directly from a Substack post page HTML.
 */
async function scrapeSubstackPage(
  url: string,
  fetchHtml: (url: string) => Promise<string>
) {
  const html = await fetchHtml(url);

  // Extract Title
  const titleMatch =
    html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
    html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i);
  const title = titleMatch ? decodeXml(titleMatch[1]) : '';

  // Extract Excerpt
  const descMatch =
    html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
    html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const excerpt = descMatch ? decodeXml(descMatch[1]) : '';

  // Extract Cover Image
  const imageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  const coverImage = imageMatch ? imageMatch[1] : undefined;

  // Extract Published Date
  const dateMatch = html.match(/<meta\s+property=["']article:published_time["']\s+content=["']([^"']+)["']/i);
  const publishedAt = dateMatch ? dateMatch[1] : new Date().toISOString();

  // Extract Body HTML
  // Substack post body is typically in `<div class="available-content">...` or `<div class="post-content ...">`
  const bodyMatch =
    html.match(/<div\s+class=["']available-content["'][^>]*>([\s\S]*?)<\/div>\s*<div\s+class=["']post-ufc/i) ||
    html.match(/<div\s+class=["']post-content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const bodyHtml = bodyMatch ? bodyMatch[1] : `<p>${excerpt}</p>`;

  // Generate ID and slug
  const id = stableId(url);
  const slug = slugify(title) || id;

  return {
    id,
    title,
    slug,
    rawBodyHtml: bodyHtml,
    tags: [] as string[],
    publishedAt,
    substackUrl: url,
    coverImage,
    excerpt,
  };
}

/**
 * Calculates reading time in minutes based on plain text word count (§8).
 */
function calculateReadingTime(bodyHtml: string): number {
  const text = htmlToText(bodyHtml);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Rewrite images helper.
 */
async function rewriteImages(
  bodyHtml: string,
  coverImage: string | undefined,
  storage: Ports['storage']
): Promise<{ bodyHtml: string; coverImage?: string }> {
  let newCoverImage = coverImage;
  if (coverImage && !coverImage.includes('res.cloudinary.com')) {
    try {
      newCoverImage = await storage.uploadImage(coverImage, { folder: 'articles' });
    } catch (err) {
      console.error(`[backend] Cover rewrite failed for ${coverImage}:`, err);
    }
  }

  let newBodyHtml = bodyHtml;
  const imgRe = /<img\b([^>]*)\bsrc\s*=\s*["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  const srcMap = new Map<string, string>();
  const matches: { full: string; src: string }[] = [];

  while ((match = imgRe.exec(bodyHtml)) !== null) {
    matches.push({ full: match[0], src: match[2] });
  }

  for (const m of matches) {
    if (srcMap.has(m.src)) continue;

    if (!m.src.includes('res.cloudinary.com')) {
      try {
        const cloudinaryUrl = await storage.uploadImage(m.src, { folder: 'articles' });
        srcMap.set(m.src, cloudinaryUrl);
      } catch (err) {
        console.error(`[backend] Inline rewrite failed for ${m.src}:`, err);
        srcMap.set(m.src, m.src);
      }
    } else {
      srcMap.set(m.src, m.src);
    }
  }

  for (const [originalSrc, newSrc] of srcMap.entries()) {
    const escapedSrc = originalSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const replaceRe = new RegExp(`(src\\s*=\\s*["'])${escapedSrc}(["'])`, 'g');
    newBodyHtml = newBodyHtml.replace(replaceRe, `$1${newSrc}$2`);
  }

  return { bodyHtml: newBodyHtml, coverImage: newCoverImage };
}

export function makeImportBySubstackUrl(
  ports: Ports,
  auditLogs: AuditLogRepository
): ImportBySubstackUrl {
  return async (actor, url, fetcher) => {
    const fetchXml = fetcher || defaultFetcher;

    let draft: {
      id: string;
      title: string;
      slug: string;
      rawBodyHtml: string;
      tags: string[];
      publishedAt: string;
      substackUrl: string;
      coverImage?: string;
      excerpt?: string;
    } | null = null;

    // 1. Try checking feed first
    try {
      const feedUrl = env.SUBSTACK_FEED_URL;
      const xml = await fetchXml(feedUrl);
      const feedItems = parseSubstackRss(xml);
      const matchedItem = feedItems.find(
        (it) => it.link === url || it.guid === url || stableId(it.guid || it.link) === stableId(url)
      );
      if (matchedItem) {
        draft = normalizeFeedItem(matchedItem);
      }
    } catch (feedErr) {
      console.warn(`[backend] Feed check failed during single import, falling back to scrape:`, feedErr);
    }

    // 2. If not found in feed, fallback to direct page scrape
    if (!draft) {
      console.log(`[backend] Article URL not found in RSS feed. Direct scraping page: ${url}`);
      draft = await scrapeSubstackPage(url, fetchXml);
    }

    const existing = await ports.articles.getById(draft.id);

    // Resolve category
    const category = resolveCategory({
      input: { title: draft.title, bodyHtml: draft.rawBodyHtml, tags: draft.tags },
      existingCategory: existing?.category,
      categoryLocked: existing?.categoryLocked,
    });

    // Sanitize body HTML
    const sanitizedBody = sanitizeHtml(draft.rawBodyHtml);

    // Excerpt
    const excerpt = draft.excerpt || buildExcerpt(sanitizedBody);

    // Reading time
    const readingTime = calculateReadingTime(sanitizedBody);

    // Image rewrites
    const { bodyHtml: finalBody, coverImage: finalCover } = await rewriteImages(
      sanitizedBody,
      draft.coverImage,
      ports.storage
    );

    const article: Article = {
      id: draft.id,
      title: draft.title,
      slug: existing?.slug || draft.slug,
      category,
      tags: draft.tags,
      excerpt,
      bodyHtml: finalBody,
      coverImage: finalCover,
      publishedAt: draft.publishedAt,
      readingTime,
      substackUrl: draft.substackUrl,
      featured: existing?.featured ?? false,
      categoryLocked: existing?.categoryLocked ?? false,
    };

    const isNew = !existing;
    const diff = buildDiff(existing as any, article as any);

    if (isNew || Object.keys(diff).length > 0) {
      await ports.articles.upsert(article);

      await writeAuditLogHelper(auditLogs, {
        actorUid: actor.uid,
        actorEmail: actor.email,
        action: isNew ? 'create' : 'update',
        entity: 'article',
        entityId: article.id,
        diff,
      });

      // Trigger revalidations
      await revalidatePath('/');
      await revalidatePath('/wisdom');
      await revalidatePath(`/wisdom/${category}`);
      await revalidatePath(`/wisdom/${category}/${article.slug}`);
      if (existing && existing.category !== category) {
        await revalidatePath(`/wisdom/${existing.category}`);
        await revalidatePath(`/wisdom/${existing.category}/${existing.slug}`);
      }
    }

    return article;
  };
}
