import * as React from 'react';
import { cn } from '../lib/cn';

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

// `primary` uses the deep blue fill so white badge text clears AA (§14).
const VARIANTS: Record<BadgeVariant, string> = {
  neutral: 'bg-bg text-text border border-border',
  primary: 'bg-deep text-surface',
  success: 'bg-success text-surface',
  warning: 'bg-warning text-surface',
  danger: 'bg-danger text-surface',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

/** Small status/category label (§11). */
export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-sm font-medium font-body',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
