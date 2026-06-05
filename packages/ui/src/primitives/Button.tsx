import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

// `deep` (not the lighter `primary`) is the solid fill: white text on it clears WCAG
// AA (≈7.1:1), whereas white on `primary` is only ~3.1:1 (§14).
const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-deep text-surface hover:opacity-90',
  secondary: 'bg-surface text-text border border-border hover:bg-bg',
  ghost: 'bg-transparent text-text hover:bg-bg',
  danger: 'bg-danger text-surface hover:opacity-90',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-base gap-2',
  lg: 'h-12 px-6 text-lg gap-2',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Render as the single child element (e.g. an `<a>`) instead of a `<button>`. */
  asChild?: boolean;
}

/**
 * Accessible button primitive (§11). Token-driven styling only — no hard-coded hex.
 * Focus ring is always visible for keyboard users (§14).
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? 'button')}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-body font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          'disabled:pointer-events-none disabled:opacity-50',
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
