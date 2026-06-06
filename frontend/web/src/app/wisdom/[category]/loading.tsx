import React from 'react';
import { Skeleton } from '@mw/ui';

/** Instant skeleton for category listings — matches the page layout to avoid CLS (§12.6 RC 3). */
export default function Loading() {
  return (
    <div className="mx-auto max-w-280 px-5 sm:px-8 lg:px-10 section-md flex flex-col gap-8">
      {/* Breadcrumbs */}
      <Skeleton className="h-4 w-48" />

      {/* Header */}
      <div className="border-b border-border/40 pb-8 flex flex-col gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>

      {/* Article grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function ArticleCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/40 bg-surface/30">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-5">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
