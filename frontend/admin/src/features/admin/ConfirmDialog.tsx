"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

interface ConfirmDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  destructive = false,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!isPending) setOpen(v); }}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-surface rounded-lg border border-border shadow-md p-6 focus:outline-none data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in-0"
          onEscapeKeyDown={(e) => { if (isPending) e.preventDefault(); }}
          onInteractOutside={(e) => { if (isPending) e.preventDefault(); }}
        >
          <div className="flex items-start justify-between mb-3">
            <Dialog.Title className="text-base font-semibold text-text">
              {title}
            </Dialog.Title>
            <button
              onClick={() => { if (!isPending) setOpen(false); }}
              disabled={isPending}
              className="text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded disabled:opacity-40"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <Dialog.Description className="text-sm text-muted mb-6">
            {description}
          </Dialog.Description>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="h-9 px-4 rounded-md border border-border text-sm text-text hover:bg-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isPending}
              aria-disabled={isPending}
              aria-label={isPending ? "Loading" : undefined}
              className={`h-9 px-4 rounded-md text-sm text-surface font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-opacity disabled:opacity-70 inline-flex items-center gap-2 ${
                destructive ? "bg-danger hover:opacity-90" : "bg-deep hover:opacity-90"
              }`}
            >
              {isPending && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface/30 border-t-surface" aria-hidden="true" />
              )}
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
