import type { FreebieRepository, Freebie, AuditLogRepository } from '../../domain';
import { writeAuditLogHelper, buildDiff } from '../audit/writeAuditLog';
import { revalidatePath } from '../revalidate';
import { ValidationError } from '../errors';
import { FreebieSchema } from '@mw/types';

export type UpsertFreebie = (
  actor: { uid: string; email: string },
  freebie: Freebie
) => Promise<Freebie>;

export function makeUpsertFreebie(
  freebies: FreebieRepository,
  auditLogs: AuditLogRepository
): UpsertFreebie {
  return async (actor, freebie) => {
    const parsed = FreebieSchema.safeParse(freebie);
    if (!parsed.success) {
      throw new ValidationError('Invalid freebie data', parsed.error.flatten().fieldErrors);
    }

    const existing = await freebies.getById(freebie.id);
    const updated = await freebies.upsert(parsed.data);

    const diff = buildDiff(existing as any, updated as any);
    await writeAuditLogHelper(auditLogs, {
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: existing ? 'update' : 'create',
      entity: 'freebie',
      entityId: updated.id,
      diff,
    });

    await revalidatePath('/store');

    return updated;
  };
}
