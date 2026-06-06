import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { listFreebies } from "@mw/backend";
import { FreebieForm } from "@/features/admin/FreebieForm";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ id: string }> }

export default async function EditFreebiePage({ params }: Props) {
  const { id } = await params;
  const freebies = await listFreebies().catch(() => []);
  const freebie = freebies.find((f) => f.id === id);
  if (!freebie) notFound();

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/freebies" className="text-muted hover:text-text text-sm flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
          <ChevronLeft size={14} aria-hidden="true" />Freebies
        </Link>
        <span className="text-muted">/</span>
        <span className="text-sm text-text truncate">{freebie.title}</span>
      </div>
      <h1 className="text-2xl font-display font-semibold text-text">Edit Freebie</h1>
      <div className="bg-surface rounded-lg border border-border p-6">
        <FreebieForm freebie={freebie} />
      </div>
    </div>
  );
}
