import type { VideoRepository, Video } from '../../domain';
import { NotFoundError } from '../errors';

export type GetVideo = (id: string) => Promise<Video>;

export function makeGetVideo(videos: VideoRepository): GetVideo {
  return async (id) => {
    const video = await videos.getById(id);
    if (!video) throw new NotFoundError(`Video not found: ${id}`);
    return video;
  };
}
