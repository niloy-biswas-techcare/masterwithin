'use client';

import React, { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[error-boundary] Caught error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-content flex flex-col items-center justify-center py-24 px-5 sm:px-8 lg:px-10 text-center">
      <h2 className="font-display text-3xl font-bold text-danger">Something went wrong!</h2>
      <p className="mt-4 text-text/80">A segment-level error occurred in the application.</p>
      <button
        onClick={reset}
        className="mt-8 px-6 py-3 bg-primary text-white font-semibold rounded-md hover:bg-deep transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
