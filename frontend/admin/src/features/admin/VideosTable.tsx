"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, EyeOff } from "lucide-react";
import type { Video } from "@mw/types";
import { DataTable } from "./DataTable";
import { PublishToggle } from "./PublishToggle";
import {
  featureVideoAction,
  hideVideoAction,
} from "@/app/actions/media.actions";

const LANG_LABEL: Record<string, string> = { en: "EN", bn: "BN", hi: "HI" };

function HideCell({ video }: { video: Video }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-label={video.hidden ? "Unhide video" : "Hide video"}
      onClick={() =>
        startTransition(async () => {
          await hideVideoAction(video.id, !video.hidden);
          router.refresh();
        })
      }
      className="text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1 disabled:opacity-40"
    >
      {video.hidden ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );
}

const columns: ColumnDef<Video>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <a
        href={row.original.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-deep hover:underline line-clamp-2 max-w-xs block"
      >
        {row.original.title}
      </a>
    ),
  },
  {
    accessorKey: "language",
    header: "Lang",
    cell: ({ getValue }) => LANG_LABEL[getValue<string>()] ?? getValue<string>(),
  },
  { accessorKey: "category", header: "Category" },
  {
    accessorKey: "categoryLocked",
    header: "Locked",
    cell: ({ getValue }) => (getValue<boolean>() ? "🔒" : "—"),
  },
  {
    accessorKey: "isShort",
    header: "Short",
    cell: ({ getValue }) => (getValue<boolean>() ? "⚡" : "—"),
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
        onToggle={async (id, featured) => featureVideoAction(id, featured)}
      />
    ),
  },
  {
    id: "hide",
    header: "Hidden",
    cell: ({ row }) => <HideCell video={row.original} />,
  },
];

export function VideosTable({ videos }: { videos: Video[] }) {
  return (
    <DataTable
      data={videos}
      columns={columns}
      searchPlaceholder="Search videos…"
    />
  );
}
