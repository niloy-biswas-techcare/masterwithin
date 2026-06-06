import type { ArticleRepository, Article, AuditLogRepository } from '../../domain';
import { NotFoundError } from '../errors';
import { writeAuditLogHelper } from '../audit/writeAuditLog';
import { revalidatePath } from '../revalidate';

export type FeatureArticle = (
  actor: { uid: string; email: string },
  id: string,
  featured: boolean,
) => Promise<Article>;

export function makeFeatureArticle(
  articles: ArticleRepository,
  auditLogs: AuditLogRepository,
): FeatureArticle {
  return async (actor, id, featured) => {
    const existing = await articles.getById(id);
    if (!existing) throw new NotFoundError('Article', id);

    const updated = await articles.setFeatured(id, featured);

    await writeAuditLogHelper(auditLogs, {
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: 'update',
      entity: 'article',
      entityId: id,
      diff: {
        featured: { from: existing.featured, to: updated.featured },
      },
    });

    await revalidatePath('/');
    await revalidatePath('/wisdom');
    await revalidatePath(`/wisdom/${updated.category}`);
    await revalidatePath(`/wisdom/${updated.category}/${updated.slug}`);

    return updated;
  };
}
