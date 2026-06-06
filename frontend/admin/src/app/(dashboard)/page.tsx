import { BookOpen, FileText, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { listBooks, listArticles } from "@mw/backend";
import { StatCard } from "@/features/admin/StatCard";
import { ActivityFeed } from "@/features/admin/ActivityFeed";
import { SyncNowButton } from "@/features/admin/SyncNowButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [books, articles] = await Promise.allSettled([
    listBooks(),
    listArticles(),
  ]);

  const bookCount = books.status === "fulfilled" ? books.value.length : 0;
  const articleCount = articles.status === "fulfilled" ? articles.value.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold text-text">Dashboard</h1>
        <div className="flex gap-3">
          <Link
            href="/books/new"
            className="h-9 px-4 rounded-md bg-deep text-surface text-sm font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary inline-flex items-center gap-2"
          >
            <BookOpen size={15} aria-hidden="true" />
            Add Book
          </Link>
          <SyncNowButton />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Books" value={bookCount} icon={BookOpen} description="Physical books in store" />
        <StatCard label="Articles" value={articleCount} icon={FileText} description="Synced from Substack" />
        <StatCard label="Orders" value="—" icon={ShoppingBag} description="View all orders" />
      </div>

      <div className="bg-surface rounded-lg border border-border p-5">
        <h2 className="text-base font-semibold text-text mb-4">Recent Activity</h2>
        <ActivityFeed logs={[]} />
      </div>
    </div>
  );
}
