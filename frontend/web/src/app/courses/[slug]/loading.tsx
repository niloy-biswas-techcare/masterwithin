import React from 'react';
import { Skeleton } from '@mw/ui';

/** Instant skeleton for a course detail page — matches the detail + sidebar grid (§12.6 RC 3). */
export default function Loading() {
  return (
    <div className="mx-auto max-w-content px-5 sm:px-8 lg:px-10 py-12 flex flex-col gap-10">
      {/* Breadcrumbs */}
      <Skeleton className="h-4 w-56" />

      {/* Title block */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>

      {/* Detail + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={i % 3 === 2 ? 'h-5 w-2/3' : 'h-5 w-full'} />
          ))}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        </div>
        <div className="border border-border/60 rounded-2xl bg-surface/40 p-8 flex flex-col gap-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
