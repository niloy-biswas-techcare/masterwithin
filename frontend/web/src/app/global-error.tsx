'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global-error] Fatal crash:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#F7F8FA] text-[#2C3340] antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center py-24 px-5 sm:px-8 lg:px-10 text-center">
          <h2 className="font-display text-4xl font-bold text-[#C0392B]">Critical System Error</h2>
          <p className="mt-4 text-[#3D4858]">The application encountered a critical issue and must reload.</p>
          <button
            onClick={reset}
            className="mt-8 px-6 py-3 bg-[#1E9AE0] text-white font-semibold rounded-md hover:bg-[#1A5C8A] transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
