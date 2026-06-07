import type { VideoRepository, AuditLogRepository, Video } from '../../domain';
import { writeAuditLogHelper } from '../audit/writeAuditLog';

export type OverrideVideoCategory = (
  id: string,
  category: string,
  actor: { uid: string; email: string }
) => Promise<Video>;

export function makeOverrideVideoCategory(
  videos: VideoRepository,
  auditLogs: AuditLogRepository
): OverrideVideoCategory {
  return async (id, category, actor) => {
    const existing = await videos.getById(id);
    const result = await videos.overrideCategory(id, category);
    await writeAuditLogHelper(auditLogs, {
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: 'update',
      entity: 'video',
      entityId: id,
      diff: { category: { from: existing?.category, to: category }, categoryLocked: { from: false, to: true } },
    });
    return result;
  };
}
