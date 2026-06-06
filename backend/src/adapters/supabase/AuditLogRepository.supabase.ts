import type { AuditLog, AuditLogRepository } from '../../domain';
import { supabaseAdmin } from './client';

function toDomain(row: any): AuditLog {
  const log: AuditLog = {
    actorUid: row.actor_uid,
    actorEmail: row.actor_email,
    action: row.action,
    entity: row.entity,
    entityId: row.entity_id,
    diff: row.diff || {},
    at: new Date(row.at).toISOString().replace('.000Z', 'Z'),
  };
  if (row.id) {
    log.id = row.id;
  }
  return log;
}

function toRow(domain: AuditLog): any {
  const row: any = {
    actor_uid: domain.actorUid,
    actor_email: domain.actorEmail,
    action: domain.action,
    entity: domain.entity,
    entity_id: domain.entityId,
    diff: domain.diff,
    at: domain.at,
  };
  if (domain.id) row.id = domain.id;
  return row;
}

export class SupabaseAuditLogRepository implements AuditLogRepository {
  async append(entry: AuditLog): Promise<AuditLog> {
    const row = toRow(entry);
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .insert(row)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }

  async list(limit?: number): Promise<AuditLog[]> {
    let query = supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('at', { ascending: false });

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(toDomain);
  }
}
