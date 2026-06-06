import { listArticles } from "@mw/backend";
import { ArticlesTable } from "@/features/admin/ArticlesTable";
import { SyncNowButton } from "@/features/admin/SyncNowButton";
import { ImportArticleForm } from "@/features/admin/ImportArticleForm";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articles = await listArticles().catch(() => []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text">Articles</h1>
          <p className="text-sm text-muted mt-0.5">{articles.length} articles from Substack</p>
        </div>
        <SyncNowButton />
      </div>

      <div className="bg-surface rounded-lg border border-border p-5">
        <h2 className="text-sm font-medium text-text mb-3">Import single post by URL</h2>
        <ImportArticleForm />
      </div>

      <ArticlesTable articles={articles} />
    </div>
  );
}
