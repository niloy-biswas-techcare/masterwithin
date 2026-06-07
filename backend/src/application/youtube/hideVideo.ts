import type { VideoRepository, AuditLogRepository, Video } from '../../domain';
import { writeAuditLogHelper } from '../audit/writeAuditLog';

export type HideVideo = (
  id: string,
  hidden: boolean,
  actor: { uid: string; email: string }
) => Promise<Video>;

export function makeHideVideo(
  videos: VideoRepository,
  auditLogs: AuditLogRepository
): HideVideo {
  return async (id, hidden, actor) => {
    const result = await videos.setHidden(id, hidden);
    await writeAuditLogHelper(auditLogs, {
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: 'update',
      entity: 'video',
      entityId: id,
      diff: { hidden: { from: !hidden, to: hidden } },
    });
    return result;
  };
}
