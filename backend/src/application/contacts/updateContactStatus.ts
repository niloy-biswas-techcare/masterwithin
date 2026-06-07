import type { ContactRepository, Contact, ContactStatus } from '../../domain';

export type UpdateContactStatus = (id: string, status: ContactStatus) => Promise<Contact>;

export function makeUpdateContactStatus(contacts: ContactRepository): UpdateContactStatus {
  return (id, status) => {
    const repliedAt = (status === 'replied' || status === 'forwarded')
      ? new Date().toISOString()
      : undefined;
    return contacts.updateStatus(id, status, repliedAt);
  };
}
