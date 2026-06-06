"use client";
import { useTransition, useRef } from "react";
import { toast } from "sonner";
import { importArticleAction } from "@/app/actions/articles.actions";

export function ImportArticleForm() {
  const ref = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = ref.current?.value.trim();
    if (!url) return;
    startTransition(async () => {
      const result = await importArticleAction(url);
      if (result.ok) { toast.success("Article imported"); if (ref.current) ref.current.value = ""; }
      else toast.error(result.error ?? "Import failed");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        ref={ref}
        type="url"
        placeholder="https://masterwithin.substack.com/p/article-slug"
        aria-label="Substack article URL"
        required
        className="field flex-1"
      />
      <button
        type="submit"
        disabled={isPending}
        className="h-11 px-4 rounded-md bg-deep text-surface text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {isPending ? "Importing…" : "Import"}
      </button>
    </form>
  );
}
