import type { Ebook } from '../entities';

/**
 * EbookRepository port (§9, §16). eBooks are fulfilled via external stores
 * (Google Play Books / Kindle), not the WhatsApp checkout (§7.7).
 */
export interface EbookRepository {
  /** List eBooks by manual `order` weight (ascending). */
  list(): Promise<Ebook[]>;
  /** Fetch one eBook by id, or null. */
  getById(id: string): Promise<Ebook | null>;
  /** Create or update an eBook by id. */
  upsert(ebook: Ebook): Promise<Ebook>;
  /** Delete an eBook by its stable id. */
  delete(id: string): Promise<void>;
}
