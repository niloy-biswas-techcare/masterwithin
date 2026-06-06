import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { listEbooks } from "@mw/backend";
import { EbookForm } from "@/features/admin/EbookForm";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ id: string }> }

export default async function EditEbookPage({ params }: Props) {
  const { id } = await params;
  const ebooks = await listEbooks().catch(() => []);
  const ebook = ebooks.find((e) => e.id === id);
  if (!ebook) notFound();

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/ebooks" className="text-muted hover:text-text text-sm flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
          <ChevronLeft size={14} aria-hidden="true" />eBooks
        </Link>
        <span className="text-muted">/</span>
        <span className="text-sm text-text truncate">{ebook.title}</span>
      </div>
      <h1 className="text-2xl font-display font-semibold text-text">Edit eBook</h1>
      <div className="bg-surface rounded-lg border border-border p-6">
        <EbookForm ebook={ebook} />
      </div>
    </div>
  );
}
