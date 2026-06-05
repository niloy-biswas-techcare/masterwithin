import * as React from 'react';
import { cn } from '../lib/cn';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Content placeholder shown while data loads (§11, §18). Decorative: hidden from the
 * accessibility tree. Pulse respects `prefers-reduced-motion` (§4.3).
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-muted/40 motion-reduce:animate-none', className)}
      {...props}
    />
  );
}
