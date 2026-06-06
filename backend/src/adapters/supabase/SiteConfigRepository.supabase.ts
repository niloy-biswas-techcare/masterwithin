import type { SiteConfig, SiteConfigRepository } from '../../domain';
import { supabaseAdmin } from './client';

function toDomain(row: any): SiteConfig {
  const conf: SiteConfig = {
    id: row.id,
    whatsappNumber: row.whatsapp_number,
    socials: row.socials || {},
    youtube: row.youtube || {},
    featured: row.featured || {},
  };
  if (row.updated_at) {
    conf.updatedAt = new Date(row.updated_at).toISOString().replace('.000Z', 'Z');
  }
  if (row.updated_by !== null && row.updated_by !== undefined) {
    conf.updatedBy = row.updated_by;
  }
  return conf;
}

function toRow(domain: SiteConfig): any {
  return {
    id: domain.id,
    whatsapp_number: domain.whatsappNumber,
    socials: domain.socials,
    youtube: domain.youtube,
    featured: domain.featured,
    updated_at: domain.updatedAt ?? null,
    updated_by: domain.updatedBy ?? null,
  };
}

export class SupabaseSiteConfigRepository implements SiteConfigRepository {
  async get(): Promise<SiteConfig | null> {
    const { data, error } = await supabaseAdmin
      .from('site_config')
      .select('*')
      .eq('id', 'main')
      .maybeSingle();

    if (error) throw error;
    return data ? toDomain(data) : null;
  }

  async upsert(config: SiteConfig): Promise<SiteConfig> {
    const row = toRow(config);
    const { data, error } = await supabaseAdmin
      .from('site_config')
      .upsert(row)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }
}
