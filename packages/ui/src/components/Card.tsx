import * as React from 'react';
import { cn } from '../lib/cn';

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

/** Base surface card (§11). The structural primitive other *Card components build on. */
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-surface shadow-sm',
        className,
      )}
      {...props}
    />
  );
}
