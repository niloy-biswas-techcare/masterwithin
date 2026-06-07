import type { BookRepository, AuditLogRepository } from '../../domain';
import { writeAuditLogHelper } from '../audit/writeAuditLog';
import { revalidatePath } from '../revalidate';

export type DeleteBook = (
  actor: { uid: string; email: string },
  id: string
) => Promise<void>;

export function makeDeleteBook(
  books: BookRepository,
  auditLogs: AuditLogRepository
): DeleteBook {
  return async (actor, id) => {
    const existing = await books.getById(id);
    if (!existing) throw new Error(`Book not found: ${id}`);

    await books.delete(id);

    await writeAuditLogHelper(auditLogs, {
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: 'delete',
      entity: 'book',
      entityId: id,
      diff: { title: { from: existing.title, to: null } },
    });

    await revalidatePath('/store');
    await revalidatePath('/books');
  };
}
