import type { Article, ArticleRepository, ArticleListFilter } from '../../domain';
import { supabaseAdmin } from './client';

function toDomain(row: any): Article {
  const art: Article = {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    tags: row.tags || [],
    excerpt: row.excerpt,
    bodyHtml: row.body_html,
    publishedAt: new Date(row.published_at).toISOString().replace('.000Z', 'Z'),
    readingTime: row.reading_time,
    substackUrl: row.substack_url,
    featured: row.featured,
    categoryLocked: row.category_locked,
  };
  if (row.cover_image !== null && row.cover_image !== undefined) {
    art.coverImage = row.cover_image;
  }
  return art;
}

function toRow(domain: Article): any {
  return {
    id: domain.id,
    title: domain.title,
    slug: domain.slug,
    category: domain.category,
    tags: domain.tags,
    excerpt: domain.excerpt,
    body_html: domain.bodyHtml,
    cover_image: domain.coverImage || null,
    published_at: domain.publishedAt,
    reading_time: domain.readingTime,
    substack_url: domain.substackUrl,
    featured: domain.featured,
    category_locked: domain.categoryLocked,
  };
}

export class SupabaseArticleRepository implements ArticleRepository {
  async list(filter?: ArticleListFilter): Promise<Article[]> {
    let query = supabaseAdmin
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });

    if (filter) {
      if (filter.category) {
        query = query.eq('category', filter.category);
      }
      if (filter.tag) {
        query = query.contains('tags', [filter.tag]);
      }
      if (filter.featured !== undefined) {
        query = query.eq('featured', filter.featured);
      }
      if (filter.page && filter.pageSize) {
        const from = (filter.page - 1) * filter.pageSize;
        const to = filter.page * filter.pageSize - 1;
        query = query.range(from, to);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(toDomain);
  }

  async count(filter?: ArticleListFilter): Promise<number> {
    let query = supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact', head: true });

    if (filter) {
      if (filter.category) {
        query = query.eq('category', filter.category);
      }
      if (filter.tag) {
        query = query.contains('tags', [filter.tag]);
      }
      if (filter.featured !== undefined) {
        query = query.eq('featured', filter.featured);
      }
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  async getBySlug(slug: string): Promise<Article | null> {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data ? toDomain(data) : null;
  }

  async getById(id: string): Promise<Article | null> {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? toDomain(data) : null;
  }

  async upsert(article: Article): Promise<Article> {
    const row = toRow(article);
    const { data, error } = await supabaseAdmin
      .from('articles')
      .upsert(row)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }

  async setFeatured(id: string, featured: boolean): Promise<Article> {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .update({ featured })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }

  async overrideCategory(id: string, category: string): Promise<Article> {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .update({ category, category_locked: true })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
