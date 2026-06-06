import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { EbookForm } from "@/features/admin/EbookForm";

export const dynamic = "force-dynamic";

export default function NewEbookPage() {
  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/ebooks" className="text-muted hover:text-text text-sm flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
          <ChevronLeft size={14} aria-hidden="true" />eBooks
        </Link>
        <span className="text-muted">/</span>
        <span className="text-sm text-text">New eBook</span>
      </div>
      <h1 className="text-2xl font-display font-semibold text-text">Add eBook</h1>
      <div className="bg-surface rounded-lg border border-border p-6">
        <EbookForm />
      </div>
    </div>
  );
}
