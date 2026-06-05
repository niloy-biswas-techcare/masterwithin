import * as React from 'react';
import { cn } from '../lib/cn';

const SIZES = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' } as const;

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: keyof typeof SIZES;
  /** Accessible label announced to screen readers. */
  label?: string;
}

/**
 * Loading spinner (§11). Exposes `role="status"` + a visually-hidden label so the
 * loading state is announced (§14). Respects `prefers-reduced-motion` (§4.3).
 */
export function Spinner({ className, size = 'md', label = 'Loading', ...props }: SpinnerProps) {
  return (
    <span role="status" aria-live="polite" className={cn('inline-flex', className)} {...props}>
      <span
        className={cn(
          'inline-block animate-spin rounded-full border-2 border-muted border-t-primary motion-reduce:animate-none',
          SIZES[size],
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
