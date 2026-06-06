"use client";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import type { Freebie } from "@mw/types";
import { DataTable } from "./DataTable";
import { PublishToggle } from "./PublishToggle";
import { upsertFreebieAction } from "@/app/actions/freebies.actions";

const columns: ColumnDef<Freebie>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link href={`/freebies/${row.original.id}`} className="font-medium text-deep hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
        {row.original.title}
      </Link>
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
];

export function FreebiesTable({ freebies }: { freebies: Freebie[] }) {
  return <DataTable data={freebies} columns={columns} searchPlaceholder="Search freebies…" />;
}
