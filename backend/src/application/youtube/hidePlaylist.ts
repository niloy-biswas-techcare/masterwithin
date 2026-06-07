import type { PlaylistRepository, AuditLogRepository, Playlist } from '../../domain';
import { writeAuditLogHelper } from '../audit/writeAuditLog';

export type HidePlaylist = (
  id: string,
  hidden: boolean,
  actor: { uid: string; email: string }
) => Promise<Playlist>;

export function makeHidePlaylist(
  playlists: PlaylistRepository,
  auditLogs: AuditLogRepository
): HidePlaylist {
  return async (id, hidden, actor) => {
    const result = await playlists.setHidden(id, hidden);
    await writeAuditLogHelper(auditLogs, {
      actorUid: actor.uid,
      actorEmail: actor.email,
      action: 'update',
      entity: 'playlist',
      entityId: id,
      diff: { hidden: { from: !hidden, to: hidden } },
    });
    return result;
  };
}
