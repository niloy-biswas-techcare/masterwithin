/**
 * YouTube Data API v3 client — server-side only (§8c).
 * Browser never calls the YouTube API; all ingestion is server-side.
 */

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YTVideoItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  channelId: string;
  durationSeconds: number;
}

export interface YTPlaylistItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelId: string;
  publishedAt: string;
  itemCount: number;
}

export interface YTPlaylistVideoItem {
  videoId: string;
  position: number;
}

/** Converts ISO 8601 duration (PT1H2M3S) to total seconds. */
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || '0', 10);
  const m = parseInt(match[2] || '0', 10);
  const s = parseInt(match[3] || '0', 10);
  return h * 3600 + m * 60 + s;
}

function bestThumbnail(thumbnails: any): string {
  return (
    thumbnails?.maxres?.url ||
    thumbnails?.standard?.url ||
    thumbnails?.high?.url ||
    thumbnails?.medium?.url ||
    thumbnails?.default?.url ||
    ''
  );
}

async function ytFetch(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube API error ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

/**
 * Fetch all videos for a channel incrementally (§8c).
 * Uses the search.list endpoint to find videos published after `publishedAfter`.
 * Fetches video details (duration) in batches of 50.
 */
export async function fetchChannelVideos(
  channelId: string,
  apiKey: string,
  publishedAfter?: string
): Promise<YTVideoItem[]> {
  const results: YTVideoItem[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: 'snippet',
      channelId,
      type: 'video',
      order: 'date',
      maxResults: '50',
      key: apiKey,
    });
    if (publishedAfter) params.set('publishedAfter', publishedAfter);
    if (pageToken) params.set('pageToken', pageToken);

    const data = await ytFetch(`${YT_BASE}/search?${params}`);
    const videoIds: string[] = (data.items || []).map((item: any) => item.id.videoId).filter(Boolean);

    if (videoIds.length > 0) {
      const detailParams = new URLSearchParams({
        part: 'snippet,contentDetails',
        id: videoIds.join(','),
        key: apiKey,
      });
      const details = await ytFetch(`${YT_BASE}/videos?${detailParams}`);

      for (const item of details.items || []) {
        results.push({
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description || '',
          thumbnailUrl: bestThumbnail(item.snippet.thumbnails),
          publishedAt: item.snippet.publishedAt,
          channelId: item.snippet.channelId,
          durationSeconds: parseDuration(item.contentDetails?.duration || 'PT0S'),
        });
      }
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return results;
}

/**
 * Fetch all playlists for a channel (§8c).
 */
export async function fetchChannelPlaylists(
  channelId: string,
  apiKey: string
): Promise<YTPlaylistItem[]> {
  const results: YTPlaylistItem[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails',
      channelId,
      maxResults: '50',
      key: apiKey,
    });
    if (pageToken) params.set('pageToken', pageToken);

    const data = await ytFetch(`${YT_BASE}/playlists?${params}`);

    for (const item of data.items || []) {
      results.push({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description || '',
        thumbnailUrl: bestThumbnail(item.snippet.thumbnails),
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        itemCount: item.contentDetails?.itemCount ?? 0,
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return results;
}

/**
 * Fetch ordered video IDs within a playlist (§8c).
 */
export async function fetchPlaylistItems(
  playlistId: string,
  apiKey: string
): Promise<YTPlaylistVideoItem[]> {
  const results: YTPlaylistVideoItem[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId,
      maxResults: '50',
      key: apiKey,
    });
    if (pageToken) params.set('pageToken', pageToken);

    const data = await ytFetch(`${YT_BASE}/playlistItems?${params}`);

    for (const item of data.items || []) {
      const videoId = item.snippet?.resourceId?.videoId;
      if (videoId) {
        results.push({
          videoId,
          position: item.snippet.position,
        });
      }
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return results.sort((a, b) => a.position - b.position);
}
