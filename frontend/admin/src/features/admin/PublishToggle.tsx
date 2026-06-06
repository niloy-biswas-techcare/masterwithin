"use client";
import { useTransition } from "react";
import { toast } from "sonner";

interface PublishToggleProps {
  id: string;
  published: boolean;
  onToggle: (id: string, published: boolean) => Promise<{ ok: boolean; error?: string }>;
  label?: string;
}

export function PublishToggle({ id, published, onToggle, label }: PublishToggleProps) {
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      const result = await onToggle(id, !published);
      if (result.ok) {
        toast.success(published ? "Unpublished" : "Published");
      } else {
        toast.error(result.error ?? "Failed to update");
      }
    });
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={published}
      aria-label={label ?? (published ? "Unpublish" : "Publish")}
      disabled={isPending}
      onClick={toggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50
        ${published ? "bg-success" : "bg-muted"}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-surface shadow-sm transition-transform
          ${published ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}
