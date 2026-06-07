"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import type { Ebook } from "@mw/types";
import { DataTable } from "./DataTable";
import { PublishToggle } from "./PublishToggle";
import { ConfirmDialog } from "./ConfirmDialog";
import { upsertEbookAction, deleteEbookAction } from "@/app/actions/ebooks.actions";

function DeleteCell({ ebook }: { ebook: Ebook }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      trigger={
        <button
          className="text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
          aria-label={`Delete ${ebook.title}`}
          disabled={isPending}
        >
          <Trash2 size={16} />
        </button>
      }
      title="Delete eBook"
      description={`"${ebook.title}" will be permanently removed. This cannot be undone.`}
      confirmLabel="Delete"
      destructive
      onConfirm={() => {
        startTransition(async () => {
          await deleteEbookAction(ebook.id);
          router.refresh();
        });
      }}
    />
  );
}

const columns: ColumnDef<Ebook>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span className="font-medium text-text">{row.original.title}</span>
    ),
  },
  {
    accessorKey: "price",
    header: "Price (₹)",
    cell: ({ getValue }) => getValue<number>() != null ? `₹${getValue<number>()}` : "—",
  },
  {
    accessorKey: "playStoreUrl",
    header: "Play Store",
    cell: ({ getValue }) => getValue<string>() ? "✓" : "—",
  },
  {
    accessorKey: "kindleUrl",
    header: "Kindle",
    cell: ({ getValue }) => getValue<string>() ? "✓" : "—",
  },
  {
    accessorKey: "available",
    header: "Published",
    cell: ({ row }) => (
      <PublishToggle
        id={row.original.id}
        published={row.original.available}
        onToggle={async (id, published) =>
          upsertEbookAction({ ...row.original, id, available: published })
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
          href={`/ebooks/${row.original.id}`}
          className="text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
          aria-label={`Edit ${row.original.title}`}
        >
          <Pencil size={16} />
        </Link>
        <DeleteCell ebook={row.original} />
      </div>
    ),
  },
];

export function EbooksTable({ ebooks }: { ebooks: Ebook[] }) {
  return <DataTable data={ebooks} columns={columns} searchPlaceholder="Search eBooks…" />;
}
