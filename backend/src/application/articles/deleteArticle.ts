import type { ArticleRepository, AuditLogRepository } from '../../domain';
import { writeAuditLogHelper } from '../audit/writeAuditLog';
import { revalidatePath } from '../revalidate';

export type DeleteArticle = (
  actor: { uid: string; email: string },
  id: string
) => Promise<void>;

/**
 * Delete an article by its stable id (§17.5).
 * Writes an audit log and triggers ISR revalidation for affected paths.
 */
export function makeDeleteArticle(
  articles: ArticleRepository,
  auditLogs: AuditLogRepository
): DeleteArticle {
  return async (actor, id) => {
    const existing = await articles.getById(id);
    if (!existing) {
      throw new Error(`Article not found: ${id}`);
    }

    await articles.delete(id);

    await writeAuditLogHelper(auditLogs, {
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: 'delete',
      entity: 'article',
      entityId: id,
      diff: { title: { from: existing.title, to: null } },
    });

    // Revalidate affected paths
    await revalidatePath('/');
    await revalidatePath('/wisdom');
    await revalidatePath(`/wisdom/${existing.category}`);
    await revalidatePath(`/wisdom/${existing.category}/${existing.slug}`);
  };
}
