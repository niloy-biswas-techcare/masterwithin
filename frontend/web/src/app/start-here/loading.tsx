import React from 'react';
import { Skeleton } from '@mw/ui';

/** Instant skeleton for Start Here — matches the 4-path grid to avoid CLS (§12.6 RC 3). */
export default function Loading() {
  return (
    <div className="mx-auto max-w-280 px-5 sm:px-8 lg:px-10 section-md flex flex-col gap-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>

      {/* Path cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-6 rounded-xl border border-border/60 bg-surface/50 p-8"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-7 w-3/4" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-5 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
