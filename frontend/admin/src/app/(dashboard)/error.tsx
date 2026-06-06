"use client";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[40vh] text-center"
      role="alert"
    >
      <AlertTriangle size={40} className="text-danger mb-4" aria-hidden="true" />
      <h2 className="text-xl font-semibold text-text mb-2">Something went wrong</h2>
      <p className="text-sm text-muted mb-6 max-w-sm">
        {error.message ?? "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="h-9 px-4 rounded-md bg-deep text-surface text-sm font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Try again
      </button>
    </div>
  );
}
