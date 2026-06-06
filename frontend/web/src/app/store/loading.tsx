import React from 'react';
import { Skeleton } from '@mw/ui';

/** Instant skeleton for the store — matches the section stack to avoid CLS (§12.6 RC 3). */
export default function Loading() {
  return (
    <div className="mx-auto max-w-280 px-5 sm:px-8 lg:px-10 section-md flex flex-col gap-16">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>

      {/* Sections: books / ebooks / freebies */}
      {Array.from({ length: 2 }).map((_, s) => (
        <section key={s} className="flex flex-col gap-8">
          <Skeleton className="h-7 w-56 border-b border-border/40 pb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-xl border border-border/60 bg-surface/30 p-5"
              >
                <Skeleton className="aspect-[3/4] w-full rounded-md" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
