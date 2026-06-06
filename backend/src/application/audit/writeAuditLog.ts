import type { AuditLogRepository, AuditLog, AuditAction } from '../../domain';

/**
 * Deeply compare two values to check if they differ.
 */
function isDifferent(a: unknown, b: unknown): boolean {
  if (a === b) return false;
  if (typeof a !== typeof b) return true;
  if (typeof a === 'object' && a !== null && b !== null) {
    return JSON.stringify(a) !== JSON.stringify(b);
  }
  return true;
}

/**
 * Build a structured, append-only diff mapping between two entity states (§17.4, §17.9).
 * Skips metadata keys like 'id', 'createdAt', 'updatedAt', and 'order'.
 */
export function buildDiff(
  oldObj: Record<string, unknown> | null | undefined,
  newObj: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  
  if (!oldObj) {
    // Brand new entity: record all fields as changed from undefined
    for (const key of Object.keys(newObj)) {
      if (key === 'id' || key === 'createdAt' || key === 'updatedAt' || key === 'order') {
        continue;
      }
      diff[key] = { from: undefined, to: newObj[key] };
    }
    return diff;
  }

  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  for (const key of allKeys) {
    if (key === 'id' || key === 'createdAt' || key === 'updatedAt' || key === 'order') {
      continue;
    }
    const oldVal = oldObj[key];
    const newVal = newObj[key];
    if (isDifferent(oldVal, newVal)) {
      diff[key] = { from: oldVal, to: newVal };
    }
  }

  return diff;
}

export interface WriteAuditLogInput {
  actorUid: string;
  actorEmail: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  diff?: Record<string, { from: unknown; to: unknown }>;
}

/**
 * Internal helper to easily write logs within use-cases.
 */
export async function writeAuditLogHelper(
  auditLogs: AuditLogRepository,
  input: WriteAuditLogInput
): Promise<AuditLog> {
  const log: AuditLog = {
    actorUid: input.actorUid,
    actorEmail: input.actorEmail,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId,
    diff: input.diff ?? {},
    at: new Date().toISOString(),
  };
  return auditLogs.append(log);
}

export type WriteAuditLog = (input: WriteAuditLogInput) => Promise<AuditLog>;

/**
 * Exported use-case to write an audit log entry (§17.4).
 */
export function makeWriteAuditLog(auditLogs: AuditLogRepository): WriteAuditLog {
  return async (input) => {
    return writeAuditLogHelper(auditLogs, input);
  };
}
