import type { ArticleRepository, Article, AuditLogRepository } from '../../domain';
import { NotFoundError } from '../errors';
import { writeAuditLogHelper } from '../audit/writeAuditLog';
import { revalidatePath } from '../revalidate';

export type OverrideCategory = (
  actor: { uid: string; email: string },
  id: string,
  category: string,
) => Promise<Article>;

export function makeOverrideCategory(
  articles: ArticleRepository,
  auditLogs: AuditLogRepository,
): OverrideCategory {
  return async (actor, id, category) => {
    const existing = await articles.getById(id);
    if (!existing) throw new NotFoundError('Article', id);

    const updated = await articles.overrideCategory(id, category);

    await writeAuditLogHelper(auditLogs, {
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: 'update',
      entity: 'article',
      entityId: id,
      diff: {
        category: { from: existing.category, to: updated.category },
        categoryLocked: { from: existing.categoryLocked, to: updated.categoryLocked },
      },
    });

    await revalidatePath('/wisdom');
    await revalidatePath(`/wisdom/${existing.category}`);
    await revalidatePath(`/wisdom/${updated.category}`);
    await revalidatePath(`/wisdom/${existing.category}/${existing.slug}`);
    await revalidatePath(`/wisdom/${updated.category}/${updated.slug}`);

    return updated;
  };
}
