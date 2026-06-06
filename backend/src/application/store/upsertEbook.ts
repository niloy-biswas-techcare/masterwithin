import type { EbookRepository, Ebook, AuditLogRepository } from '../../domain';
import { writeAuditLogHelper, buildDiff } from '../audit/writeAuditLog';
import { revalidatePath } from '../revalidate';
import { ValidationError } from '../errors';
import { EbookSchema } from '@mw/types';

export type UpsertEbook = (
  actor: { uid: string; email: string },
  ebook: Ebook
) => Promise<Ebook>;

export function makeUpsertEbook(
  ebooks: EbookRepository,
  auditLogs: AuditLogRepository
): UpsertEbook {
  return async (actor, ebook) => {
    const parsed = EbookSchema.safeParse(ebook);
    if (!parsed.success) {
      throw new ValidationError('Invalid eBook data', parsed.error.flatten().fieldErrors);
    }

    const existing = await ebooks.getById(ebook.id);
    const updated = await ebooks.upsert(parsed.data);

    const diff = buildDiff(existing as any, updated as any);
    await writeAuditLogHelper(auditLogs, {
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: existing ? 'update' : 'create',
      entity: 'ebook',
      entityId: updated.id,
      diff,
    });

    await revalidatePath('/store');

    return updated;
  };
}
