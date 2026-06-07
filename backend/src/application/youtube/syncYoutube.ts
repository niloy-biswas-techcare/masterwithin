import type { Ports, Video, Playlist, AuditLogRepository } from '../../domain';
import {
  fetchChannelVideos as defaultFetchVideos,
  fetchChannelPlaylists as defaultFetchPlaylists,
  type YTVideoItem,
  type YTPlaylistItem,
} from '../content/youtubeApi';
import { resolveCategory } from '../content/autoCategorize';
import { writeAuditLogHelper } from '../audit/writeAuditLog';
import { revalidatePath } from '../revalidate';

export interface SyncYoutubeFetchers {
  fetchChannelVideos?: (channelId: string, apiKey: string, publishedAfter?: string) => Promise<YTVideoItem[]>;
  fetchChannelPlaylists?: (channelId: string, apiKey: string) => Promise<YTPlaylistItem[]>;
  /** Override channel map (channelId → language) for testing without env vars. */
  channelMap?: Record<string, 'en' | 'bn' | 'hi'>;
  apiKey?: string;
}

export interface YoutubeSyncResult {
  channel: string;
  language: 'en' | 'bn' | 'hi';
  fetched: number;
  newCount: number;
  updatedCount: number;
  skippedCount: number;
  errors: string[];
}

export interface SyncYoutubeResult {
  channels: YoutubeSyncResult[];
  totalFetched: number;
  totalNew: number;
  totalUpdated: number;
  errors: string[];
}

export type SyncYoutube = (
  actor?: { uid: string; email: string }
) => Promise<SyncYoutubeResult>;

function buildChannelMap(
  channelEn: string,
  channelBn: string,
  channelHi: string
): Record<string, 'en' | 'bn' | 'hi'> {
  const map: Record<string, 'en' | 'bn' | 'hi'> = {};
  if (channelEn) map[channelEn] = 'en';
  if (channelBn) map[channelBn] = 'bn';
  if (channelHi) map[channelHi] = 'hi';
  return map;
}

export function makeSyncYoutube(
  ports: Ports,
  auditLogs: AuditLogRepository,
  fetchers?: SyncYoutubeFetchers
): SyncYoutube {
  const fetchVideos = fetchers?.fetchChannelVideos ?? defaultFetchVideos;
  const fetchPlaylists = fetchers?.fetchChannelPlaylists ?? defaultFetchPlaylists;

  return async function syncYoutube(actor) {
    let apiKey = fetchers?.apiKey;
    let channelMap = fetchers?.channelMap;

    if (!apiKey || !channelMap) {
      const { env } = await import('../../env');
      apiKey = apiKey ?? env.YOUTUBE_API_KEY ?? '';

      if (!channelMap) {
        const channelEn = env.YOUTUBE_CHANNEL_EN || '';
        const channelBn = env.YOUTUBE_CHANNEL_BN || '';
        const channelHi = env.YOUTUBE_CHANNEL_HI || '';
        const envMap = buildChannelMap(channelEn, channelBn, channelHi);

        if (Object.keys(envMap).length > 0) {
          channelMap = envMap;
        } else {
          // Fallback: read channel IDs from site_config stored in DB
          const siteConfig = await ports.siteConfig.get().catch(() => null);
          const ch = siteConfig?.youtube?.channels;
          channelMap = ch ? buildChannelMap(ch.en ?? '', ch.bn ?? '', ch.hi ?? '') : {};
        }
      }
    }

    if (!apiKey) {
      console.warn('[syncYoutube] YOUTUBE_API_KEY not configured; skipping sync.');
      return { channels: [], totalFetched: 0, totalNew: 0, totalUpdated: 0, errors: ['YOUTUBE_API_KEY not configured'] };
    }
    const channelResults: YoutubeSyncResult[] = [];
    let totalFetched = 0;
    let totalNew = 0;
    let totalUpdated = 0;
    const topErrors: string[] = [];

    for (const [channelId, language] of Object.entries(channelMap)) {
      if (!channelId) continue;
      const result: YoutubeSyncResult = {
        channel: channelId,
        language,
        fetched: 0,
        newCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        errors: [],
      };

      try {
        // Fetch videos for this channel
        const ytVideos = await fetchVideos(channelId, apiKey);
        result.fetched = ytVideos.length;
        totalFetched += ytVideos.length;

        // Batch-fetch existing records in parallel (25 at a time) to preserve
        // hidden/featured/categoryLocked state without resetting it.
        const BATCH = 25;
        const existingMap = new Map<string, Video>();
        for (let i = 0; i < ytVideos.length; i += BATCH) {
          const batch = ytVideos.slice(i, i + BATCH);
          const results = await Promise.all(batch.map((v) => ports.videos.getById(v.id).catch(() => null)));
          results.forEach((v) => { if (v) existingMap.set(v.id, v); });
        }

        for (const ytV of ytVideos) {
          try {
            const existing = existingMap.get(ytV.id);

            const category = resolveCategory({
              input: { title: ytV.title, bodyHtml: ytV.description },
              existingCategory: existing?.category,
              categoryLocked: existing?.categoryLocked,
            });

            const video: Video = {
              id: ytV.id,
              title: ytV.title,
              description: ytV.description,
              thumbnail: ytV.thumbnailUrl,
              duration: ytV.durationSeconds,
              publishedAt: ytV.publishedAt,
              channelId: ytV.channelId,
              language,
              category,
              categoryLocked: existing?.categoryLocked ?? false,
              playlistIds: existing?.playlistIds ?? [],
              featured: existing?.featured ?? false,
              hidden: existing?.hidden ?? false,
              isShort: ytV.durationSeconds < 60,
              youtubeUrl: `https://www.youtube.com/watch?v=${ytV.id}`,
            };

            await ports.videos.upsert(video);

            if (existing) {
              result.updatedCount++;
              totalUpdated++;
            } else {
              result.newCount++;
              totalNew++;
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            result.errors.push(`Video ${ytV.id}: ${msg}`);
          }
        }

        // Sync playlists for this channel
        const ytPlaylists = await fetchPlaylists(channelId, apiKey);
        const existingPlaylistMap = new Map<string, Playlist>();
        for (let i = 0; i < ytPlaylists.length; i += BATCH) {
          const batch = ytPlaylists.slice(i, i + BATCH);
          const results = await Promise.all(batch.map((p) => ports.playlists.getById(p.id).catch(() => null)));
          results.forEach((p) => { if (p) existingPlaylistMap.set(p.id, p); });
        }

        for (const ytP of ytPlaylists) {
          try {
            const existing = existingPlaylistMap.get(ytP.id);

            const playlist: Playlist = {
              id: ytP.id,
              title: ytP.title,
              description: existing?.description ?? ytP.description,
              thumbnail: ytP.thumbnailUrl,
              videoCount: ytP.itemCount,
              channelId: ytP.channelId,
              language,
              publishedAt: ytP.publishedAt,
              featured: existing?.featured ?? false,
              hidden: existing?.hidden ?? false,
            };

            await ports.playlists.upsert(playlist);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            result.errors.push(`Playlist ${ytP.id}: ${msg}`);
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push(`Channel sync failed: ${msg}`);
        topErrors.push(`[${language}] ${msg}`);
      }

      channelResults.push(result);

      const logEntry = `Sync: ${result.newCount} new, ${result.updatedCount} updated, ${result.skippedCount} skipped from ${channelId}`;
      console.info(`[syncYoutube] ${logEntry}`);
    }

    // Write audit log
    if (actor) {
      await writeAuditLogHelper(auditLogs, {
        actorUid: actor.uid,
        actorEmail: actor.email,
        action: 'youtube_sync',
        entity: 'video',
        entityId: 'all',
        diff: {
          totalNew: { from: undefined, to: totalNew },
          totalUpdated: { from: undefined, to: totalUpdated },
          totalFetched: { from: undefined, to: totalFetched },
        },
      });
    }

    // Trigger ISR revalidation for /media
    await revalidatePath('/media').catch(() => {});

    return { channels: channelResults, totalFetched, totalNew, totalUpdated, errors: topErrors };
  };
}
