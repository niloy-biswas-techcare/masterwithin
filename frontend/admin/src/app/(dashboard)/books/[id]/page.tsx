import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { listBooks } from "@mw/backend";
import { BookForm } from "@/features/admin/BookForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBookPage({ params }: Props) {
  const { id } = await params;
  const books = await listBooks().catch(() => []);
  const book = books.find((b) => b.id === id);
  if (!book) notFound();

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/books"
          className="text-muted hover:text-text text-sm flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Books
        </Link>
        <span className="text-muted">/</span>
        <span className="text-sm text-text truncate">{book.title}</span>
      </div>
      <h1 className="text-2xl font-display font-semibold text-text">Edit Book</h1>
      <div className="bg-surface rounded-lg border border-border p-6">
        <BookForm book={book} />
      </div>
    </div>
  );
}
