import type { Freebie } from '../entities';

/**
 * FreebieRepository port (§9, §16). Free downloads; the file lives in Supabase
 * Storage and the row stores its download URL (§7.7, §17.7).
 */
export interface FreebieRepository {
  /** List freebies by manual `order` weight (ascending). */
  list(): Promise<Freebie[]>;
  /** Fetch one freebie by id, or null. */
  getById(id: string): Promise<Freebie | null>;
  /** Create or update a freebie by id. */
  upsert(freebie: Freebie): Promise<Freebie>;
  /** Delete a freebie by its stable id. */
  delete(id: string): Promise<void>;
}
