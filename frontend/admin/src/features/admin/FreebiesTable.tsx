"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import type { Freebie } from "@mw/types";
import { DataTable } from "./DataTable";
import { PublishToggle } from "./PublishToggle";
import { ConfirmDialog } from "./ConfirmDialog";
import { upsertFreebieAction, deleteFreebieAction } from "@/app/actions/freebies.actions";

function DeleteCell({ freebie }: { freebie: Freebie }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      trigger={
        <button
          className="text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
          aria-label={`Delete ${freebie.title}`}
          disabled={isPending}
        >
          <Trash2 size={16} />
        </button>
      }
      title="Delete Freebie"
      description={`"${freebie.title}" will be permanently removed. This cannot be undone.`}
      confirmLabel="Delete"
      destructive
      onConfirm={() => {
        startTransition(async () => {
          await deleteFreebieAction(freebie.id);
          router.refresh();
        });
      }}
    />
  );
}

const columns: ColumnDef<Freebie>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span className="font-medium text-text">{row.original.title}</span>
    ),
  },
  {
    accessorKey: "fileUrl",
    header: "File",
    cell: ({ getValue }) => getValue<string>() ? (
      <a href={getValue<string>()} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View</a>
    ) : "—",
  },
  {
    accessorKey: "published",
    header: "Published",
    cell: ({ row }) => (
      <PublishToggle
        id={row.original.id}
        published={row.original.published}
        onToggle={async (id, published) =>
          upsertFreebieAction({ ...row.original, id, published })
        }
      />
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Link
          href={`/freebies/${row.original.id}`}
          className="text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
          aria-label={`Edit ${row.original.title}`}
        >
          <Pencil size={16} />
        </Link>
        <DeleteCell freebie={row.original} />
      </div>
    ),
  },
];

export function FreebiesTable({ freebies }: { freebies: Freebie[] }) {
  return <DataTable data={freebies} columns={columns} searchPlaceholder="Search freebies…" />;
}
