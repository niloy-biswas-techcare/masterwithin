import type { Ebook, EbookRepository } from '../../domain';
import { supabaseAdmin } from './client';

function toDomain(row: any): Ebook {
  const eb: Ebook = {
    id: row.id,
    title: row.title,
    author: row.author,
    coverImage: row.cover_image,
    description: row.description,
    available: row.available,
    order: row.order,
  };
  if (row.price !== null && row.price !== undefined) {
    eb.price = row.price;
  }
  if (row.play_store_url !== null && row.play_store_url !== undefined) {
    eb.playStoreUrl = row.play_store_url;
  }
  if (row.kindle_url !== null && row.kindle_url !== undefined) {
    eb.kindleUrl = row.kindle_url;
  }
  return eb;
}

function toRow(domain: Ebook): any {
  return {
    id: domain.id,
    title: domain.title,
    author: domain.author,
    price: domain.price ?? null,
    cover_image: domain.coverImage,
    description: domain.description,
    play_store_url: domain.playStoreUrl ?? null,
    kindle_url: domain.kindleUrl ?? null,
    available: domain.available,
    order: domain.order,
  };
}

export class SupabaseEbookRepository implements EbookRepository {
  async list(): Promise<Ebook[]> {
    const { data, error } = await supabaseAdmin
      .from('ebooks')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return (data || []).map(toDomain);
  }

  async getById(id: string): Promise<Ebook | null> {
    const { data, error } = await supabaseAdmin
      .from('ebooks')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? toDomain(data) : null;
  }

  async upsert(ebook: Ebook): Promise<Ebook> {
    const row = toRow(ebook);
    const { data, error } = await supabaseAdmin
      .from('ebooks')
      .upsert(row)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }
}
