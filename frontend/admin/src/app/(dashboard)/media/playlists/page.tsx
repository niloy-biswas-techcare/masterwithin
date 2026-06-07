import { listPlaylists } from "@mw/backend";
import { PlaylistsTable } from "@/features/admin/PlaylistsTable";
import { SyncYoutubeButton } from "@/features/admin/SyncYoutubeButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MediaPlaylistsPage() {
  const [{ playlists: visible }, { playlists: hidden }] = await Promise.all([
    listPlaylists().catch(() => ({ playlists: [], total: 0 })),
    listPlaylists({ hidden: true }).catch(() => ({ playlists: [], total: 0 })),
  ]);
  const playlists = [...visible, ...hidden];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text">Media — Playlists</h1>
          <p className="text-sm text-muted mt-0.5">{playlists.length} playlists synced from YouTube</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/media"
            className="h-9 px-4 rounded-md border border-border text-sm text-text hover:bg-bg transition-colors inline-flex items-center"
          >
            Videos
          </Link>
          <SyncYoutubeButton />
        </div>
      </div>

      <PlaylistsTable playlists={playlists} />
    </div>
  );
}
