import type { ContactRepository, Contact } from '../../domain';

export type ListContacts = () => Promise<Contact[]>;

export function makeListContacts(contacts: ContactRepository): ListContacts {
  return () => contacts.list();
}
