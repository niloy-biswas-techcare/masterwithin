import type { VideoRepository, AuditLogRepository, Video } from '../../domain';
import { writeAuditLogHelper } from '../audit/writeAuditLog';

export type FeatureVideo = (
  id: string,
  featured: boolean,
  actor: { uid: string; email: string }
) => Promise<Video>;

export function makeFeatureVideo(
  videos: VideoRepository,
  auditLogs: AuditLogRepository
): FeatureVideo {
  return async (id, featured, actor) => {
    const result = await videos.setFeatured(id, featured);
    await writeAuditLogHelper(auditLogs, {
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: 'update',
      entity: 'video',
      entityId: id,
      diff: { featured: { from: !featured, to: featured } },
    });
    return result;
  };
}
