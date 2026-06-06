"use client";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import type { Book } from "@mw/types";
import { DataTable } from "./DataTable";
import { PublishToggle } from "./PublishToggle";
import { upsertBookAction } from "@/app/actions/books.actions";

const columns: ColumnDef<Book>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        href={`/books/${row.original.id}`}
        className="font-medium text-deep hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        {row.original.title}
      </Link>
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
