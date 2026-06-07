import type { ContactRepository } from '../../domain';

export type DeleteContact = (id: string) => Promise<void>;

export function makeDeleteContact(contacts: ContactRepository): DeleteContact {
  return (id) => contacts.delete(id);
}
