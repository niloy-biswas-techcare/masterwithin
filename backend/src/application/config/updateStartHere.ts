import type { StartHereRepository, StartHereConfig, AuditLogRepository } from '../../domain';
import { writeAuditLogHelper } from '../audit/writeAuditLog';
import { revalidatePath } from '../revalidate';
import { ValidationError } from '../errors';
import { StartHereConfigSchema } from '@mw/types';

export type UpdateStartHere = (
  actor: { uid: string; email: string },
  config: StartHereConfig
) => Promise<StartHereConfig>;

export function makeUpdateStartHere(
  startHere: StartHereRepository,
  auditLogs: AuditLogRepository
): UpdateStartHere {
  return async (actor, config) => {
    const parsed = StartHereConfigSchema.safeParse(config);
    if (!parsed.success) {
      throw new ValidationError('Invalid Start Here paths data', parsed.error.flatten().fieldErrors);
    }

    const existing = await startHere.get();
    const updated = await startHere.upsert(parsed.data);

    // Diffs for arrays can be generic in audit logs
    const diff = {
      paths: { from: existing, to: updated }
    };
    
    await writeAuditLogHelper(auditLogs, {
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: existing.length > 0 ? 'update' : 'create',
      entity: 'start_here',
      entityId: 'main',
      diff,
    });

    await revalidatePath('/start-here');

    return updated;
  };
}
