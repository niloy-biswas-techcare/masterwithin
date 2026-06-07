import type { PlaylistRepository, Playlist } from '../../domain';
import { NotFoundError } from '../errors';

export type GetPlaylist = (id: string) => Promise<Playlist>;

export function makeGetPlaylist(playlists: PlaylistRepository): GetPlaylist {
  return async (id) => {
    const playlist = await playlists.getById(id);
    if (!playlist) throw new NotFoundError(`Playlist not found: ${id}`);
    return playlist;
  };
}
