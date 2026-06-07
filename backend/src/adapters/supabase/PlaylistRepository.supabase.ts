import type { Playlist, PlaylistRepository, PlaylistListFilter } from '../../domain';
import { supabaseAdmin } from './client';

function toDomain(row: any): Playlist {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    thumbnail: row.thumbnail,
    videoCount: row.video_count,
    channelId: row.channel_id,
    language: row.language,
    publishedAt: new Date(row.published_at).toISOString().replace('.000Z', 'Z'),
    featured: row.featured,
    hidden: row.hidden,
  };
}

function toRow(domain: Playlist): any {
  return {
    id: domain.id,
    title: domain.title,
    description: domain.description,
    thumbnail: domain.thumbnail,
    video_count: domain.videoCount,
    channel_id: domain.channelId,
    language: domain.language,
    published_at: domain.publishedAt,
    featured: domain.featured,
    hidden: domain.hidden,
    updated_at: new Date().toISOString(),
  };
}

export class SupabasePlaylistRepository implements PlaylistRepository {
  async list(filter?: PlaylistListFilter): Promise<Playlist[]> {
    let query = supabaseAdmin
      .from('playlists')
      .select('*')
      .order('published_at', { ascending: false });

    if (filter) {
      if (filter.language) query = query.eq('language', filter.language);
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
      query = query.eq('hidden', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(toDomain);
  }

  async count(filter?: PlaylistListFilter): Promise<number> {
    let query = supabaseAdmin
      .from('playlists')
      .select('*', { count: 'exact', head: true });

    if (filter) {
      if (filter.language) query = query.eq('language', filter.language);
      if (filter.featured !== undefined) query = query.eq('featured', filter.featured);
      if (filter.hidden !== undefined) query = query.eq('hidden', filter.hidden);
      else query = query.eq('hidden', false);
    } else {
      query = query.eq('hidden', false);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }

  async getById(id: string): Promise<Playlist | null> {
    const { data, error } = await supabaseAdmin
      .from('playlists')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? toDomain(data) : null;
  }

  async upsert(playlist: Playlist): Promise<Playlist> {
    const { data, error } = await supabaseAdmin
      .from('playlists')
      .upsert(toRow(playlist))
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }

  async setFeatured(id: string, featured: boolean): Promise<Playlist> {
    const { data, error } = await supabaseAdmin
      .from('playlists')
      .update({ featured, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }

  async setHidden(id: string, hidden: boolean): Promise<Playlist> {
    const { data, error } = await supabaseAdmin
      .from('playlists')
      .update({ hidden, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }

  async updateDescription(id: string, description: string): Promise<Playlist> {
    const { data, error } = await supabaseAdmin
      .from('playlists')
      .update({ description, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }
}
