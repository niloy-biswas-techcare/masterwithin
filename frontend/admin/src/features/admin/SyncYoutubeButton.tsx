"use client";
import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { syncYoutubeAction } from "@/app/actions/media.actions";

export function SyncYoutubeButton() {
  const [isPending, startTransition] = useTransition();

  const sync = () => {
    startTransition(async () => {
      const result = await syncYoutubeAction();
      if (result.ok) {
        const s = result.summary;
        const msg = s
          ? `Synced ${s.channels} channel${s.channels !== 1 ? "s" : ""}: ${s.totalNew} new, ${s.totalUpdated} updated (${s.totalFetched} fetched)`
          : "YouTube sync complete";
        toast.success(msg);
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
      {isPending ? "Syncing…" : "Sync YouTube"}
    </button>
  );
}
