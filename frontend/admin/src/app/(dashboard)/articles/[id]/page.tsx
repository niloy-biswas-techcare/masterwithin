import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { listArticles } from "@mw/backend";
import { ArticleCurationForm } from "@/features/admin/ArticleCurationForm";
import { CATEGORIES } from "@mw/types";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ id: string }> }

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const articles = await listArticles().catch(() => []);
  const article = articles.find((a) => a.id === id);
  if (!article) notFound();

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/articles" className="text-muted hover:text-text text-sm flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
          <ChevronLeft size={14} aria-hidden="true" />Articles
        </Link>
        <span className="text-muted">/</span>
        <span className="text-sm text-text truncate max-w-xs">{article.title}</span>
      </div>
      <h1 className="text-2xl font-display font-semibold text-text">Curate Article</h1>
      <p className="text-sm text-muted -mt-3">
        Articles are Substack-sourced — never hand-created here. Feature, recategorize, or edit tags/excerpt.
      </p>
      <div className="bg-surface rounded-lg border border-border p-6">
        <ArticleCurationForm article={article} categories={CATEGORIES} />
      </div>
    </div>
  );
}
