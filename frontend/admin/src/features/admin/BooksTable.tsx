"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import type { Book } from "@mw/types";
import { DataTable } from "./DataTable";
import { PublishToggle } from "./PublishToggle";
import { ConfirmDialog } from "./ConfirmDialog";
import { upsertBookAction, deleteBookAction } from "@/app/actions/books.actions";

function DeleteCell({ book }: { book: Book }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      trigger={
        <button
          className="text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
          aria-label={`Delete ${book.title}`}
          disabled={isPending}
        >
          <Trash2 size={16} />
        </button>
      }
      title="Delete Book"
      description={`"${book.title}" will be permanently removed. This cannot be undone.`}
      confirmLabel="Delete"
      destructive
      onConfirm={() => {
        startTransition(async () => {
          await deleteBookAction(book.id);
          router.refresh();
        });
      }}
    />
  );
}

const columns: ColumnDef<Book>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span className="font-medium text-text">{row.original.title}</span>
    ),
  },
  { accessorKey: "author", header: "Author" },
  {
    accessorKey: "price",
    header: "Price (₹)",
    cell: ({ getValue }) => `₹${getValue<number>()}`,
  },
  {
    accessorKey: "available",
    header: "Published",
    cell: ({ row }) => (
      <PublishToggle
        id={row.original.id}
        published={row.original.available}
        onToggle={async (id, published) => {
          const result = await upsertBookAction({ ...row.original, id, available: published });
          return result;
        }}
      />
    ),
  },
  { accessorKey: "order", header: "Order" },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Link
          href={`/books/${row.original.id}`}
          className="text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
          aria-label={`Edit ${row.original.title}`}
        >
          <Pencil size={16} />
        </Link>
        <DeleteCell book={row.original} />
      </div>
    ),
  },
];

export function BooksTable({ books }: { books: Book[] }) {
  return (
    <DataTable
      data={books}
      columns={columns}
      searchPlaceholder="Search books…"
    />
  );
}
