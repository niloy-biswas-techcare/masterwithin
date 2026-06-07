import type { FreebieRepository, AuditLogRepository } from '../../domain';
import { writeAuditLogHelper } from '../audit/writeAuditLog';
import { revalidatePath } from '../revalidate';

export type DeleteFreebie = (
  actor: { uid: string; email: string },
  id: string
) => Promise<void>;

export function makeDeleteFreebie(
  freebies: FreebieRepository,
  auditLogs: AuditLogRepository
): DeleteFreebie {
  return async (actor, id) => {
    const existing = await freebies.getById(id);
    if (!existing) throw new Error(`Freebie not found: ${id}`);

    await freebies.delete(id);

    await writeAuditLogHelper(auditLogs, {
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: 'delete',
      entity: 'freebie',
      entityId: id,
      diff: { title: { from: existing.title, to: null } },
    });

    await revalidatePath('/store');
    await revalidatePath('/freebies');
  };
}
