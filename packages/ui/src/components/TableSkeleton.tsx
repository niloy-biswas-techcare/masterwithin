import * as React from 'react';
import { Skeleton } from '../primitives/Skeleton';
import { cn } from '../lib/cn';

interface TableSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  columns?: number;
}

/**
 * Skeleton placeholder matching a DataTable layout.
 * Container uses aria-busy="true" so screen readers know data is loading.
 */
export function TableSkeleton({ rows = 5, columns = 4, className, ...props }: TableSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading table data"
      className={cn('overflow-x-auto rounded-lg border border-border', className)}
      {...props}
    >
      <table className="w-full text-sm" aria-hidden="true">
        <thead>
          <tr className="bg-bg border-b border-border">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b border-border last:border-0">
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="px-4 py-3">
                  <Skeleton
                    className={cn(
                      'h-4',
                      c === 0 ? 'w-40' : c === columns - 1 ? 'w-16' : 'w-24',
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

interface CardSkeletonGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cards?: number;
}

/**
 * Skeleton grid for card-layout pages. 3-up on desktop.
 */
export function CardSkeletonGrid({ cards = 6, className, ...props }: CardSkeletonGridProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading"
      className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}
      {...props}
    >
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border p-4 space-y-3" aria-hidden="true">
          <Skeleton className="h-40 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
