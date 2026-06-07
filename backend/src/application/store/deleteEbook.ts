import type { EbookRepository, AuditLogRepository } from '../../domain';
import { writeAuditLogHelper } from '../audit/writeAuditLog';
import { revalidatePath } from '../revalidate';

export type DeleteEbook = (
  actor: { uid: string; email: string },
  id: string
) => Promise<void>;

export function makeDeleteEbook(
  ebooks: EbookRepository,
  auditLogs: AuditLogRepository
): DeleteEbook {
  return async (actor, id) => {
    const existing = await ebooks.getById(id);
    if (!existing) throw new Error(`Ebook not found: ${id}`);

    await ebooks.delete(id);

    await writeAuditLogHelper(auditLogs, {
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: 'delete',
      entity: 'ebook',
      entityId: id,
      diff: { title: { from: existing.title, to: null } },
    });

    await revalidatePath('/store');
    await revalidatePath('/ebooks');
  };
}
