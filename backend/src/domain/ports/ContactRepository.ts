import type { Contact } from '../entities';

/**
 * ContactRepository port (§9, §16). Contact submissions are private (no public
 * read) and written only via the validated server action (§7.9, §16).
 */
export interface ContactRepository {
  /** Persist a contact submission; the adapter assigns `id` and `createdAt`. */
  create(contact: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact>;
}
