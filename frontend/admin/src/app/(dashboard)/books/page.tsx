import Link from "next/link";
import { Plus } from "lucide-react";
import { listBooks } from "@mw/backend";
import { BooksTable } from "@/features/admin/BooksTable";

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const books = await listBooks().catch(() => []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold text-text">Books</h1>
        <Link
          href="/books/new"
          className="h-9 px-4 rounded-md bg-deep text-surface text-sm font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary inline-flex items-center gap-2"
        >
          <Plus size={15} aria-hidden="true" />
          Add Book
        </Link>
      </div>
      <BooksTable books={books} />
    </div>
  );
}
