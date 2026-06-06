import Link from "next/link";
import { Plus } from "lucide-react";
import { listEbooks } from "@mw/backend";
import { EbooksTable } from "@/features/admin/EbooksTable";

export const dynamic = "force-dynamic";

export default async function EbooksPage() {
  const ebooks = await listEbooks().catch(() => []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold text-text">eBooks</h1>
        <Link
          href="/ebooks/new"
          className="h-9 px-4 rounded-md bg-deep text-surface text-sm font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary inline-flex items-center gap-2"
        >
          <Plus size={15} aria-hidden="true" />
          Add eBook
        </Link>
      </div>
      <EbooksTable ebooks={ebooks} />
    </div>
  );
}
