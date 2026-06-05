'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';

/**
 * Slide-in drawer/sheet (§11), used for the mobile nav and cart. Built on Radix
 * Dialog, so it inherits the focus trap, ARIA, and Esc handling (§14).
 */
export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

export type DrawerSide = 'left' | 'right';

const SIDE: Record<DrawerSide, string> = {
  left: 'left-0 top-0 h-full w-[min(86vw,22rem)] border-r',
  right: 'right-0 top-0 h-full w-[min(86vw,22rem)] border-l',
};

export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    title: string;
    side?: DrawerSide;
  }
>(({ className, children, title, side = 'right', ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-dark/40 motion-reduce:animate-none" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 flex flex-col border-border bg-surface p-6 shadow-md focus:outline-none',
        SIDE[side],
        className,
      )}
      {...props}
    >
      <DialogPrimitive.Title className="font-display text-xl text-text">
        {title}
      </DialogPrimitive.Title>
      <DialogPrimitive.Close
        aria-label="Close"
        className="absolute right-4 top-4 rounded-sm text-text/70 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </DialogPrimitive.Close>
      <div className="mt-4 flex-1 overflow-y-auto">{children}</div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DrawerContent.displayName = 'DrawerContent';
