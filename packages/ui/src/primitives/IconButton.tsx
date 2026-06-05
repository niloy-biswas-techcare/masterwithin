import * as React from 'react';
import { cn } from '../lib/cn';
import type { ButtonVariant } from './Button';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-deep text-surface hover:opacity-90',
  secondary: 'bg-surface text-text border border-border hover:bg-bg',
  ghost: 'bg-transparent text-text hover:bg-bg',
  danger: 'bg-danger text-surface hover:opacity-90',
};

const SIZES = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-12 w-12',
} as const;

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: keyof typeof SIZES;
  /** Required: icon-only buttons must carry an accessible label (§14). */
  'aria-label': string;
}

/**
 * Square, icon-only button (§11). Requires `aria-label` so it is never an unlabeled
 * control for assistive tech (§14).
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'ghost', size = 'md', type, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  ),
);
IconButton.displayName = 'IconButton';
