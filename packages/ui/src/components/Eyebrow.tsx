import * as React from 'react';
import { cn } from '../lib/cn';

export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * Eyebrow label above section titles (§4a.2).
 * 11px, DM Sans 600, tracking-[0.1em], text-primary, all-caps.
 */
export function Eyebrow({ className, children, ...props }: EyebrowProps) {
  return (
    <span
      className={cn(
        'block text-[11px] font-body font-semibold tracking-[0.1em] text-primary uppercase',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
