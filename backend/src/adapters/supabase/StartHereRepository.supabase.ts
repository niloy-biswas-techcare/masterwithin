import type { StartHereConfig, StartHereRepository, StartHerePath } from '../../domain';
import { supabaseAdmin } from './client';

function toDomain(row: any): StartHerePath {
  const path: StartHerePath = {
    id: row.id,
    title: row.title,
    blurb: row.blurb,
    targetTags: row.target_tags || [],
    deeperCtaLabel: row.deeper_cta_label,
    deeperCtaHref: row.deeper_cta_href,
  };
  if (row.target_category !== null && row.target_category !== undefined) {
    path.targetCategory = row.target_category;
  }
  return path;
}

export class SupabaseStartHereRepository implements StartHereRepository {
  async get(): Promise<StartHereConfig> {
    const { data, error } = await supabaseAdmin
      .from('start_here')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;
    return (data || []).map(toDomain);
  }

  async upsert(config: StartHereConfig): Promise<StartHereConfig> {
    // 1. Delete all existing records
    const { error: deleteError } = await supabaseAdmin
      .from('start_here')
      .delete()
      .neq('id', '');

    if (deleteError) throw deleteError;

    // If config is empty, just return empty array
    if (config.length === 0) return [];

    // 2. Insert new records with index as order
    const rows = config.map((path, idx) => ({
      id: path.id,
      title: path.title,
      blurb: path.blurb,
      target_tags: path.targetTags,
      target_category: path.targetCategory ?? null,
      deeper_cta_label: path.deeperCtaLabel,
      deeper_cta_href: path.deeperCtaHref,
      order: idx,
    }));

    const { data, error: insertError } = await supabaseAdmin
      .from('start_here')
      .insert(rows)
      .select('*')
      .order('order', { ascending: true });

    if (insertError) throw insertError;
    return (data || []).map(toDomain);
  }
}
