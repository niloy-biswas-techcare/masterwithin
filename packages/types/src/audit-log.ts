import { z } from 'zod';

/** The actions an operator (or the sync job) can perform (§17.9). */
export const AuditAction = z.enum([
  'create',
  'update',
  'delete',
  'sync',
  'role_grant',
  'role_revoke',
]);
export type AuditAction = z.infer<typeof AuditAction>;

/**
 * Append-only record of every admin mutation (§17.4, §17.9). Written server-side
 * only; never client-writable. `diff` is a per-field `{ from, to }` map.
 */
export const AuditLogSchema = z.object({
  id: z.string().optional(),
  actorUid: z.string(),
  actorEmail: z.string().email(),
  action: AuditAction,
  entity: z.string(), // e.g. 'book', 'article', 'site_config'
  entityId: z.string(),
  diff: z.record(z.object({ from: z.unknown(), to: z.unknown() })).default({}),
  at: z.string(), // ISO
});

export type AuditLog = z.infer<typeof AuditLogSchema>;
