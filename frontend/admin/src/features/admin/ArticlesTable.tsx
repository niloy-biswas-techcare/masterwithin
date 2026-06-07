"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import type { Article } from "@mw/types";
import { DataTable } from "./DataTable";
import { PublishToggle } from "./PublishToggle";
import { ConfirmDialog } from "./ConfirmDialog";
import { featureArticleAction, deleteArticleAction } from "@/app/actions/articles.actions";

function DeleteCell({ article }: { article: Article }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      trigger={
        <button
          className="text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
          aria-label={`Delete ${article.title}`}
          disabled={isPending}
        >
          <Trash2 size={16} />
        </button>
      }
      title="Delete Article"
      description={`"${article.title}" will be permanently removed. This cannot be undone.`}
      confirmLabel="Delete"
      destructive
      onConfirm={() => {
        startTransition(async () => {
          await deleteArticleAction(article.id);
          router.refresh();
        });
      }}
    />
  );
}

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
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <DeleteCell article={row.original} />,
  },
];

export function ArticlesTable({ articles }: { articles: Article[] }) {
  return <DataTable data={articles} columns={columns} searchPlaceholder="Search articles…" />;
}
