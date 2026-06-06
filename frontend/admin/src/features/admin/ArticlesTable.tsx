"use client";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import type { Article } from "@mw/types";
import { DataTable } from "./DataTable";
import { PublishToggle } from "./PublishToggle";
import { featureArticleAction } from "@/app/actions/articles.actions";

const columns: ColumnDef<Article>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link href={`/articles/${row.original.id}`} className="font-medium text-deep hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded line-clamp-2 max-w-xs">
        {row.original.title}
      </Link>
    ),
  },
  { accessorKey: "category", header: "Category" },
  {
    accessorKey: "categoryLocked",
    header: "Locked",
    cell: ({ getValue }) => getValue<boolean>() ? "🔒" : "—",
  },
  {
    accessorKey: "publishedAt",
    header: "Published",
    cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString("en-IN"),
  },
  {
    accessorKey: "featured",
    header: "Featured",
    cell: ({ row }) => (
      <PublishToggle
        id={row.original.id}
        published={row.original.featured}
        label={row.original.featured ? "Unfeature" : "Feature"}
        onToggle={async (id, featured) => featureArticleAction(id, featured)}
      />
    ),
  },
];

export function ArticlesTable({ articles }: { articles: Article[] }) {
  return <DataTable data={articles} columns={columns} searchPlaceholder="Search articles…" />;
}
