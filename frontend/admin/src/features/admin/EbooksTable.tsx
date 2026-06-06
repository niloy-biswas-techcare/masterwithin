"use client";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import type { Ebook } from "@mw/types";
import { DataTable } from "./DataTable";
import { PublishToggle } from "./PublishToggle";
import { upsertEbookAction } from "@/app/actions/ebooks.actions";

const columns: ColumnDef<Ebook>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link href={`/ebooks/${row.original.id}`} className="font-medium text-deep hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
        {row.original.title}
      </Link>
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
];

export function EbooksTable({ ebooks }: { ebooks: Ebook[] }) {
  return <DataTable data={ebooks} columns={columns} searchPlaceholder="Search eBooks…" />;
}
