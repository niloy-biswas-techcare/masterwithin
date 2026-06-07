import React from 'react';
import { Skeleton } from '@mw/ui';

export default function Loading() {
  return (
    <div className="px-5 sm:px-8 lg:px-10 section-md max-w-content mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-3 max-w-prose">
        <Skeleton className="h-6 w-20 rounded" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
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
