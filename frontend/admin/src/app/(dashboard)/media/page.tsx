import { listVideos, getSiteConfig } from "@mw/backend";
import { VideosTable } from "@/features/admin/VideosTable";
import { SyncYoutubeButton } from "@/features/admin/SyncYoutubeButton";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const [{ videos: visible }, { videos: hidden }, siteConfig] = await Promise.all([
    listVideos().catch(() => ({ videos: [], total: 0 })),
    listVideos({ hidden: true }).catch(() => ({ videos: [], total: 0 })),
    getSiteConfig().catch(() => null),
  ]);
  const videos = [...visible, ...hidden];
  const total = videos.length;

  const hasApiKey = !!process.env.YOUTUBE_API_KEY;
  const channels = siteConfig?.youtube?.channels;
  const hasChannels = !!(channels?.en || channels?.bn || channels?.hi);

  const missingConfig = !hasApiKey || !hasChannels;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text">Media — Videos</h1>
          <p className="text-sm text-muted mt-0.5">{total} videos synced from YouTube</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/media/playlists"
            className="h-9 px-4 rounded-md border border-border text-sm text-text hover:bg-bg transition-colors inline-flex items-center"
          >
            Playlists
          </Link>
          <SyncYoutubeButton />
        </div>
      </div>

      {missingConfig && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div className="space-y-1">
            {!hasApiKey && (
              <p>
                <strong>YouTube API key not set.</strong> Add{" "}
                <code className="rounded bg-amber-100 px-1 font-mono text-xs">YOUTUBE_API_KEY</code>{" "}
                to your <code className="rounded bg-amber-100 px-1 font-mono text-xs">.env.local</code> file.
              </p>
            )}
            {!hasChannels && (
              <p>
                <strong>No YouTube channels configured.</strong>{" "}
                <Link href="/settings" className="underline underline-offset-2">
                  Go to Settings
                </Link>{" "}
                and add at least one channel ID (English, Bengali, or Hindi).
              </p>
            )}
          </div>
        </div>
      )}

      <VideosTable videos={videos} />
    </div>
  );
}
