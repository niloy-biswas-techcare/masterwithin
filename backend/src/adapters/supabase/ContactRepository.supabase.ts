import type { Contact, ContactRepository } from '../../domain';
import { supabaseAdmin } from './client';

function toDomain(row: any): Contact {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    createdAt: new Date(row.created_at).toISOString().replace('.000Z', 'Z'),
  };
}

function toRow(domain: Omit<Contact, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): any {
  const row: any = {
    name: domain.name,
    email: domain.email,
    message: domain.message,
  };
  if (domain.id) row.id = domain.id;
  if (domain.createdAt) row.created_at = domain.createdAt;
  return row;
}

export class SupabaseContactRepository implements ContactRepository {
  async create(contact: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> {
    const row = toRow(contact);
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .insert(row)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }
}
