import React from 'react';
import { Skeleton } from '@mw/ui';

/** Instant skeleton for an article — mirrors the banner + prose column to avoid CLS (§12.6 RC 3). */
export default function Loading() {
  return (
    <article className="w-full bg-bg">
      {/* Banner / cover header */}
      <div className="relative border-b border-border/20 bg-surface/30 py-16 md:py-24">
        <div className="mx-auto max-w-280 px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-3xl flex flex-col gap-6">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-4/5" />
            <div className="flex flex-wrap items-center gap-4 border-t border-border/40 pt-4">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="mx-auto max-w-280 px-5 sm:px-8 lg:px-10 py-12 md:py-16">
        <div className="mx-auto max-w-3xl flex flex-col gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className={i % 4 === 3 ? 'h-5 w-2/3' : 'h-5 w-full'} />
          ))}
        </div>
      </div>
    </article>
  );
}
