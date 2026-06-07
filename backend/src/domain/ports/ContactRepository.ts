import type { Contact, ContactStatus } from '../entities';

/**
 * ContactRepository port. Contacts are private — only accessible to admin.
 */
export interface ContactRepository {
  /** Persist a new contact submission. Adapter assigns `id`, `createdAt`, and default `status`. */
  create(contact: Omit<Contact, 'id' | 'createdAt' | 'status' | 'repliedAt'>): Promise<Contact>;

  /** List all contacts, newest first. */
  list(): Promise<Contact[]>;

  /** Update the status (read, replied, forwarded) of a contact. Returns updated record. */
  updateStatus(id: string, status: ContactStatus, repliedAt?: string): Promise<Contact>;

  /** Hard-delete a contact by id. */
  delete(id: string): Promise<void>;
}
