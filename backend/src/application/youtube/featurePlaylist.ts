import type { PlaylistRepository, AuditLogRepository, Playlist } from '../../domain';
import { writeAuditLogHelper } from '../audit/writeAuditLog';

export type FeaturePlaylist = (
  id: string,
  featured: boolean,
  actor: { uid: string; email: string }
) => Promise<Playlist>;

export function makeFeaturePlaylist(
  playlists: PlaylistRepository,
  auditLogs: AuditLogRepository
): FeaturePlaylist {
  return async (id, featured, actor) => {
    const result = await playlists.setFeatured(id, featured);
    await writeAuditLogHelper(auditLogs, {
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: 'update',
      entity: 'playlist',
      entityId: id,
      diff: { featured: { from: !featured, to: featured } },
    });
    return result;
  };
}
