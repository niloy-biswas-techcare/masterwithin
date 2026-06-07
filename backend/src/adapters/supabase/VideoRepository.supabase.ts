import type { Video, VideoRepository, VideoListFilter } from '../../domain';
import { supabaseAdmin } from './client';

function toDomain(row: any): Video {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    thumbnail: row.thumbnail,
    duration: row.duration,
    publishedAt: new Date(row.published_at).toISOString().replace('.000Z', 'Z'),
    channelId: row.channel_id,
    language: row.language,
    category: row.category,
    categoryLocked: row.category_locked,
    playlistIds: row.playlist_ids ?? [],
    featured: row.featured,
    hidden: row.hidden,
    isShort: row.is_short,
    youtubeUrl: row.youtube_url,
  };
}

function toRow(domain: Video): any {
  return {
    id: domain.id,
    title: domain.title,
    description: domain.description,
    thumbnail: domain.thumbnail,
    duration: domain.duration,
    published_at: domain.publishedAt,
    channel_id: domain.channelId,
    language: domain.language,
    category: domain.category,
    category_locked: domain.categoryLocked,
    playlist_ids: domain.playlistIds,
    featured: domain.featured,
    hidden: domain.hidden,
    is_short: domain.isShort,
    youtube_url: domain.youtubeUrl,
    updated_at: new Date().toISOString(),
  };
}

export class SupabaseVideoRepository implements VideoRepository {
  async list(filter?: VideoListFilter): Promise<Video[]> {
    let query = supabaseAdmin
      .from('videos')
      .select('*')
      .order('published_at', { ascending: false });

    if (filter) {
      if (filter.language) query = query.eq('language', filter.language);
      if (filter.category) query = query.eq('category', filter.category);
      if (filter.isShort !== undefined) {
        query = query.eq('is_short', filter.isShort);
      } else {
        query = query.eq('is_short', false);
      }
      if (filter.featured !== undefined) query = query.eq('featured', filter.featured);
      if (filter.hidden !== undefined) {
        query = query.eq('hidden', filter.hidden);
      } else {
        query = query.eq('hidden', false);
      }
      if (filter.page && filter.pageSize) {
        const from = (filter.page - 1) * filter.pageSize;
        query = query.range(from, filter.page * filter.pageSize - 1);
      }
    } else {
      query = query.eq('is_short', false).eq('hidden', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(toDomain);
  }

  async count(filter?: VideoListFilter): Promise<number> {
    let query = supabaseAdmin
      .from('videos')
      .select('*', { count: 'exact', head: true });

    if (filter) {
      if (filter.language) query = query.eq('language', filter.language);
      if (filter.category) query = query.eq('category', filter.category);
      if (filter.isShort !== undefined) query = query.eq('is_short', filter.isShort);
      else query = query.eq('is_short', false);
      if (filter.featured !== undefined) query = query.eq('featured', filter.featured);
      if (filter.hidden !== undefined) query = query.eq('hidden', filter.hidden);
      else query = query.eq('hidden', false);
    } else {
      query = query.eq('is_short', false).eq('hidden', false);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  async getById(id: string): Promise<Video | null> {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? toDomain(data) : null;
  }

  async upsert(video: Video): Promise<Video> {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .upsert(toRow(video))
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }

  async setFeatured(id: string, featured: boolean): Promise<Video> {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .update({ featured, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }

  async setHidden(id: string, hidden: boolean): Promise<Video> {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .update({ hidden, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }

  async overrideCategory(id: string, category: string): Promise<Video> {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .update({ category, category_locked: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }
}
