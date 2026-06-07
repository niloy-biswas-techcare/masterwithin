import React from 'react';
import { Skeleton } from '@mw/ui';

export default function Loading() {
  return (
    <div className="px-5 sm:px-8 lg:px-10 section-md max-w-content mx-auto flex flex-col gap-8">
      <Skeleton className="aspect-[16/9] w-full rounded-lg" />
      <div className="flex flex-col gap-3 max-w-prose">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded" />
          <Skeleton className="h-6 w-28 rounded" />
        </div>
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
