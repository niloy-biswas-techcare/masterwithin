import type { AuditLog } from '../entities';

/**
 * AuditLogRepository port (§9, §16). Append-only record of every admin mutation —
 * never updated, never deleted, never client-readable (§17.4, §17.9).
 */
export interface AuditLogRepository {
  /** Append one audit entry; the adapter assigns `id`. */
  append(entry: AuditLog): Promise<AuditLog>;
  /** List recent entries newest-first (powers the dashboard activity feed, §17.5). */
  list(limit?: number): Promise<AuditLog[]>;
}
