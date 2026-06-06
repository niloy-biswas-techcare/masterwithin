import type { Freebie, FreebieRepository } from '../../domain';
import { supabaseAdmin } from './client';

function toDomain(row: any): Freebie {
  const f: Freebie = {
    id: row.id,
    title: row.title,
    description: row.description,
    fileUrl: row.file_url,
    order: row.order,
    published: row.published,
  };
  if (row.cover_image !== null && row.cover_image !== undefined) {
    f.coverImage = row.cover_image;
  }
  return f;
}

function toRow(domain: Freebie): any {
  return {
    id: domain.id,
    title: domain.title,
    description: domain.description,
    file_url: domain.fileUrl,
    cover_image: domain.coverImage ?? null,
    order: domain.order,
    published: domain.published,
  };
}

export class SupabaseFreebieRepository implements FreebieRepository {
  async list(): Promise<Freebie[]> {
    const { data, error } = await supabaseAdmin
      .from('freebies')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return (data || []).map(toDomain);
  }

  async getById(id: string): Promise<Freebie | null> {
    const { data, error } = await supabaseAdmin
      .from('freebies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? toDomain(data) : null;
  }

  async upsert(freebie: Freebie): Promise<Freebie> {
    const row = toRow(freebie);
    const { data, error } = await supabaseAdmin
      .from('freebies')
      .upsert(row)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }
}
