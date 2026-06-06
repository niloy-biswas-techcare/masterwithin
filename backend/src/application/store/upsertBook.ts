import type { BookRepository, Book, AuditLogRepository } from '../../domain';
import { writeAuditLogHelper, buildDiff } from '../audit/writeAuditLog';
import { revalidatePath } from '../revalidate';
import { ValidationError } from '../errors';
import { BookSchema } from '@mw/types';

export type UpsertBook = (
  actor: { uid: string; email: string },
  book: Book
) => Promise<Book>;

export function makeUpsertBook(
  books: BookRepository,
  auditLogs: AuditLogRepository
): UpsertBook {
  return async (actor, book) => {
    // Validate schema
    const parsed = BookSchema.safeParse(book);
    if (!parsed.success) {
      throw new ValidationError('Invalid book data', parsed.error.flatten().fieldErrors);
    }

    const existing = await books.getById(book.id);
    const updated = await books.upsert(parsed.data);

    const diff = buildDiff(existing as any, updated as any);
    await writeAuditLogHelper(auditLogs, {
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: existing ? 'update' : 'create',
      entity: 'book',
      entityId: updated.id,
      diff,
    });

    await revalidatePath('/');
    await revalidatePath('/store');

    return updated;
  };
}
