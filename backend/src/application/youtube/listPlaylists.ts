import type { PlaylistRepository, PlaylistListFilter, Playlist } from '../../domain';

export type ListPlaylists = (filter?: PlaylistListFilter) => Promise<{ playlists: Playlist[]; total: number }>;

export function makeListPlaylists(playlists: PlaylistRepository): ListPlaylists {
  return async (filter) => {
    const [list, total] = await Promise.all([playlists.list(filter), playlists.count(filter)]);
    return { playlists: list, total };
  };
}
