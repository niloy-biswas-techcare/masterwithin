import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:   'bg-primary text-white shadow-sm hover:bg-deep',
  secondary: 'border border-border bg-surface text-text hover:bg-primary/5 hover:border-primary/30',
  ghost:     'text-primary bg-transparent hover:bg-primary/8',
  danger:    'bg-danger text-white hover:opacity-90',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-[0.9375rem] gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Render as the single child element (e.g. an `<a>`) instead of a `<button>`. */
  asChild?: boolean;
}

/**
 * Accessible button primitive (§11, §4a.5). Token-driven styling only.
 * primary hover uses bg-deep (true dark blue, not opacity). All variants rounded-lg.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? 'button')}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-body font-medium transition-colors',
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
