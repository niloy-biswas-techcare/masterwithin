import type { Book, BookRepository } from '../../domain';
import { supabaseAdmin } from './client';

function toDomain(row: any): Book {
  const book: Book = {
    id: row.id,
    title: row.title,
    author: row.author,
    price: row.price,
    coverImage: row.cover_image,
    description: row.description,
    available: row.available,
    order: row.order,
  };
  if (row.pages !== null && row.pages !== undefined) {
    book.pages = row.pages;
  }
  return book;
}

function toRow(domain: Book): any {
  return {
    id: domain.id,
    title: domain.title,
    author: domain.author,
    price: domain.price,
    cover_image: domain.coverImage,
    description: domain.description,
    pages: domain.pages ?? null,
    available: domain.available,
    order: domain.order,
  };
}

export class SupabaseBookRepository implements BookRepository {
  async list(): Promise<Book[]> {
    const { data, error } = await supabaseAdmin
      .from('books')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return (data || []).map(toDomain);
  }

  async getById(id: string): Promise<Book | null> {
    const { data, error } = await supabaseAdmin
      .from('books')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? toDomain(data) : null;
  }

  async upsert(book: Book): Promise<Book> {
    const row = toRow(book);
    const { data, error } = await supabaseAdmin
      .from('books')
      .upsert(row)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('books')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
