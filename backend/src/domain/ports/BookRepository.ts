import type { Book } from '../entities';

/**
 * BookRepository port (§9, §16). Physical books — the primary commerce focus (§7.7).
 * All writes go through the service-role adapter server-side (§16).
 */
export interface BookRepository {
  /** List books by manual `order` weight (ascending). */
  list(): Promise<Book[]>;
  /** Fetch one book by id, or null. */
  getById(id: string): Promise<Book | null>;
  /** Create or update a book by id. */
  upsert(book: Book): Promise<Book>;
  /** Delete a book by its stable id. */
  delete(id: string): Promise<void>;
}
