import { env } from '../../env';
import type { Ports, Article, AuditLogRepository } from '../../domain';
import { parseSubstackRss, normalizeFeedItem, resolveCategory, htmlToText } from '../content';
import { sanitizeHtml } from '../content/sanitize';
import { buildExcerpt } from '../content/excerpt';
import { writeAuditLogHelper } from '../audit/writeAuditLog';
import { revalidatePath } from '../revalidate';
import { buildDiff } from '../audit/writeAuditLog';

export interface SyncResult {
  fetched: number;
  newCount: number;
  updatedCount: number;
  skippedCount: number;
  deletedCount: number;
  errors: string[];
}

export type SyncSubstack = (
  actor?: { uid: string; email: string },
  customFeedUrl?: string,
  fetcher?: (url: string) => Promise<string>
) => Promise<SyncResult>;

/**
 * Calculate reading time in minutes based on plain text word count (§8).
 */
function calculateReadingTime(bodyHtml: string): number {
  const text = htmlToText(bodyHtml);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200)); // 200 WPM average
}

/**
 * Rewrite cover and inline HTML images to Cloudinary.
 */
async function rewriteImages(
  bodyHtml: string,
  coverImage: string | undefined,
  storage: Ports['storage']
): Promise<{ bodyHtml: string; coverImage?: string }> {
  // 1. Rewrite cover image
  let newCoverImage = coverImage;
  if (coverImage && !coverImage.includes('res.cloudinary.com')) {
    try {
      newCoverImage = await storage.uploadImage(coverImage, { folder: 'articles' });
    } catch (err) {
      console.error(`[backend] Cover image rewrite failed for ${coverImage}:`, err);
    }
  }

  // 2. Rewrite HTML body images
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
        console.error(`[backend] Inline image rewrite failed for ${m.src}:`, err);
        srcMap.set(m.src, m.src); // fallback to original
      }
    } else {
      srcMap.set(m.src, m.src);
    }
  }

  // Replace sources in HTML
  for (const [originalSrc, newSrc] of srcMap.entries()) {
    const escapedSrc = originalSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const replaceRe = new RegExp(`(src\\s*=\\s*["'])${escapedSrc}(["'])`, 'g');
    newBodyHtml = newBodyHtml.replace(replaceRe, `$1${newSrc}$2`);
  }

  return { bodyHtml: newBodyHtml, coverImage: newCoverImage };
}

const defaultFetcher = async (url: string): Promise<string> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP fetch failed with status: ${res.status}`);
  return res.text();
};

export function makeSyncSubstack(
  ports: Ports,
  auditLogs: AuditLogRepository
): SyncSubstack {
  return async (actor, customFeedUrl, fetcher) => {
    const feedUrl = customFeedUrl || env.SUBSTACK_FEED_URL;
    const fetchXml = fetcher || defaultFetcher;
    const systemActor = actor || { uid: 'system', email: env.ADMIN_BOOTSTRAP_EMAIL };

    const result: SyncResult = {
      fetched: 0,
      newCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      deletedCount: 0,
      errors: [],
    };

    try {
      console.log(`[backend] Syncing Substack RSS feed from: ${feedUrl}`);
      const xml = await fetchXml(feedUrl);
      const feedItems = parseSubstackRss(xml);
      result.fetched = feedItems.length;

      const affectedCategories = new Set<string>();
      const feedIds = new Set<string>();

      for (const item of feedItems) {
        try {
          const draft = normalizeFeedItem(item);
          feedIds.add(draft.id);
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
          const excerpt = buildExcerpt(sanitizedBody);

          // Reading time
          const readingTime = calculateReadingTime(sanitizedBody);

          // Image rewrites to Cloudinary
          const { bodyHtml: finalBody, coverImage: finalCover } = await rewriteImages(
            sanitizedBody,
            draft.coverImage,
            ports.storage
          );

          const article: Article = {
            id: draft.id,
            title: draft.title,
            slug: existing?.slug || draft.slug, // keep slug immutable after first ingest
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

          if (!existing) {
            // New Article
            await ports.articles.upsert(article);
            result.newCount++;
            affectedCategories.add(category);
            
            await writeAuditLogHelper(auditLogs, {
              actorUid: systemActor.uid,
              actorEmail: systemActor.email,
              action: 'create',
              entity: 'article',
              entityId: article.id,
              diff: buildDiff(null, article as any),
            });
          } else {
            // Check if updated by diffing
            const diff = buildDiff(existing as any, article as any);
            if (Object.keys(diff).length > 0) {
              await ports.articles.upsert(article);
              result.updatedCount++;
              affectedCategories.add(category);
              affectedCategories.add(existing.category);
              
              await writeAuditLogHelper(auditLogs, {
                actorUid: systemActor.uid,
                actorEmail: systemActor.email,
                action: 'sync',
                entity: 'article',
                entityId: article.id,
                diff,
              });
            } else {
              result.skippedCount++;
            }
          }
        } catch (itemErr: any) {
          console.error(`[backend] Failed syncing feed item "${item.title}":`, itemErr);
          result.errors.push(`Item "${item.title}": ${itemErr.message || itemErr}`);
        }
      }

      // Mirror-delete: remove articles in DB that are no longer in the Substack RSS feed.
      // This makes our article set identical to Substack (§8b).
      const allExisting = await ports.articles.list();
      for (const existing of allExisting) {
        if (!feedIds.has(existing.id)) {
          await ports.articles.delete(existing.id);
          result.deletedCount++;
          affectedCategories.add(existing.category);

          await writeAuditLogHelper(auditLogs, {
            actorUid: systemActor.uid,
            actorEmail: systemActor.email,
            action: 'delete',
            entity: 'article',
            entityId: existing.id,
            diff: { title: { from: existing.title, to: null } },
          });

          console.log(`[backend] Mirror-deleted article "${existing.title}" (${existing.id}) — no longer in RSS feed`);
        }
      }

      // Revalidate affected categories if changes occurred
      if (result.newCount > 0 || result.updatedCount > 0 || result.deletedCount > 0) {
        await revalidatePath('/');
        await revalidatePath('/wisdom');
        for (const cat of affectedCategories) {
          await revalidatePath(`/wisdom/${cat}`);
        }
      }

    } catch (err: any) {
      console.error(`[backend] Sync failed:`, err);
      result.errors.push(`Sync error: ${err.message || err}`);
    }

    return result;
  };
}
