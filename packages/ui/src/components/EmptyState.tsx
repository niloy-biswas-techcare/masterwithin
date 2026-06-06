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
 * Contemplative empty state (§4a.4.5, §11, §18). Uses the philosophical vocabulary
 * from the micro-copy spec. Never blank.
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
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface/50 px-8 py-14 text-center',
        className,
      )}
      {...props}
    >
      {icon ? (
        <span className="text-muted mb-1" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <h3 className="font-display text-xl text-text">{title}</h3>
      {description ? (
        <p className="max-w-md text-[0.9375rem] text-text/60 leading-relaxed font-body italic">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
