import type { VideoRepository, VideoListFilter, Video } from '../../domain';

export type ListVideos = (filter?: VideoListFilter) => Promise<{ videos: Video[]; total: number }>;

export function makeListVideos(videos: VideoRepository): ListVideos {
  return async (filter) => {
    const [list, total] = await Promise.all([videos.list(filter), videos.count(filter)]);
    return { videos: list, total };
  };
}
