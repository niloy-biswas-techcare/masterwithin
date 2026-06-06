"use client";
import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { syncNowAction } from "@/app/actions/articles.actions";

export function SyncNowButton() {
  const [isPending, startTransition] = useTransition();

  const sync = () => {
    startTransition(async () => {
      const result = await syncNowAction();
      if (result.ok) {
        toast.success("Sync complete");
      } else {
        toast.error(result.error ?? "Sync failed");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={sync}
      disabled={isPending}
      className="h-9 px-4 rounded-md border border-border text-sm text-text hover:bg-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 inline-flex items-center gap-2"
    >
      <RefreshCw
        size={15}
        aria-hidden="true"
        className={isPending ? "animate-spin" : ""}
      />
      {isPending ? "Syncing…" : "Sync Now"}
    </button>
  );
}
