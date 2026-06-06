import React from 'react';
import { Skeleton } from '@mw/ui';

/** Instant skeleton for the courses listing — matches the page layout to avoid CLS (§12.6 RC 3). */
export default function Loading() {
  return (
    <div className="mx-auto max-w-280 px-5 sm:px-8 lg:px-10 section-md flex flex-col gap-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>

      {/* Course grid */}
      <section className="flex flex-col gap-8">
        <div className="border-b border-border/40 pb-4 flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-xl border border-border/60 bg-surface/30 p-5"
            >
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
