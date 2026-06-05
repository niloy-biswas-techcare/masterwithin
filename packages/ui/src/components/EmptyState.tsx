import * as React from 'react';
import { cn } from '../lib/cn';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  /** Optional icon/illustration (decorative). */
  icon?: React.ReactNode;
  /** Optional action (e.g. a Button) rendered below the copy. */
  action?: React.ReactNode;
}

/**
 * Designed empty state for lists (search, category, cart) — never a blank page
 * (§11, §18).
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center',
        className,
      )}
      {...props}
    >
      {icon ? (
        <span className="text-muted" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <h3 className="font-display text-xl text-text">{title}</h3>
      {description ? <p className="max-w-md text-base text-text/70">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
