import type { Contact, ContactRepository, ContactStatus } from '../../domain';
import { supabaseAdmin } from './client';

function toDomain(row: any): Contact {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    message: row.message,
    channel: row.channel ?? 'email',
    status: row.status ?? 'unread',
    repliedAt: row.replied_at ? new Date(row.replied_at).toISOString().replace('.000Z', 'Z') : undefined,
    createdAt: new Date(row.created_at).toISOString().replace('.000Z', 'Z'),
  };
}

export class SupabaseContactRepository implements ContactRepository {
  async create(contact: Omit<Contact, 'id' | 'createdAt' | 'status' | 'repliedAt'>): Promise<Contact> {
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .insert({
        name: contact.name,
        email: contact.email ?? null,
        phone: contact.phone ?? null,
        message: contact.message,
        channel: contact.channel ?? 'email',
        status: 'unread',
      })
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }

  async list(): Promise<Contact[]> {
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toDomain);
  }

  async updateStatus(id: string, status: ContactStatus, repliedAt?: string): Promise<Contact> {
    const update: Record<string, unknown> = { status };
    if (repliedAt) update.replied_at = repliedAt;

    const { data, error } = await supabaseAdmin
      .from('contacts')
      .update(update)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
