"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, EyeOff } from "lucide-react";
import type { Playlist } from "@mw/types";
import { DataTable } from "./DataTable";
import { PublishToggle } from "./PublishToggle";
import {
  featurePlaylistAction,
  hidePlaylistAction,
} from "@/app/actions/media.actions";

const LANG_LABEL: Record<string, string> = { en: "EN", bn: "BN", hi: "HI" };

function HideCell({ playlist }: { playlist: Playlist }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-label={playlist.hidden ? "Unhide playlist" : "Hide playlist"}
      onClick={() =>
        startTransition(async () => {
          await hidePlaylistAction(playlist.id, !playlist.hidden);
          router.refresh();
        })
      }
      className="text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1 disabled:opacity-40"
    >
      {playlist.hidden ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );
}

const columns: ColumnDef<Playlist>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span className="font-medium text-deep line-clamp-2 max-w-xs block">
        {row.original.title}
      </span>
    ),
  },
  {
    accessorKey: "language",
    header: "Lang",
    cell: ({ getValue }) => LANG_LABEL[getValue<string>()] ?? getValue<string>(),
  },
  {
    accessorKey: "videoCount",
    header: "Videos",
    cell: ({ getValue }) => getValue<number>(),
  },
  {
    accessorKey: "publishedAt",
    header: "Published",
    cell: ({ getValue }) =>
      new Date(getValue<string>()).toLocaleDateString("en-IN"),
  },
  {
    accessorKey: "featured",
    header: "Featured",
    cell: ({ row }) => (
      <PublishToggle
        id={row.original.id}
        published={row.original.featured}
        label={row.original.featured ? "Unfeature" : "Feature"}
        onToggle={async (id, featured) => featurePlaylistAction(id, featured)}
      />
    ),
  },
  {
    id: "hide",
    header: "Hidden",
    cell: ({ row }) => <HideCell playlist={row.original} />,
  },
];

export function PlaylistsTable({ playlists }: { playlists: Playlist[] }) {
  return (
    <DataTable
      data={playlists}
      columns={columns}
      searchPlaceholder="Search playlists…"
    />
  );
}
