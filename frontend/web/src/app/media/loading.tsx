import React from 'react';
import { Skeleton } from '@mw/ui';

export default function Loading() {
  return (
    <div className="px-5 sm:px-8 lg:px-10 section-md flex flex-col gap-16 max-w-content mx-auto">
      {/* Hero */}
      <div className="flex flex-col items-center gap-4 text-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-12 w-96 max-w-full" />
        <Skeleton className="h-5 w-full max-w-lg" />
        <Skeleton className="h-10 w-64" />
      </div>
      {/* Filter bar */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      {/* Video grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[16/9] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
