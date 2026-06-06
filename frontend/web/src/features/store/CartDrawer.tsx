'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from '@mw/ui';
import { EmptyState } from '@mw/ui';
import { formatPrice } from '@mw/utils';
import { useCartStore } from '@/store/cartStore';

interface CartDrawerProps {
  trigger: React.ReactNode;
}

/**
 * Slide-in cart drawer triggered from any surface (e.g. Navbar cart icon).
 * Uses the Drawer primitive (Radix Dialog) for focus trapping and ARIA (§11, §14).
 */
export function CartDrawer({ trigger }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent title={`Cart${totalItems > 0 ? ` (${totalItems})` : ''}`} side="right">
        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-10 w-10" />}
            title="Your shelf is waiting."
            description="Browse the bookstore and bring a book home."
            action={
              <DrawerClose asChild>
                <Link
                  href="/store"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-deep transition-colors"
                >
                  Browse Store
                </Link>
              </DrawerClose>
            }
          />
        ) : (
          <div className="flex h-full flex-col gap-4">
            {/* Items */}
            <ul className="flex-1 flex flex-col divide-y divide-border/40 overflow-y-auto -mx-6 px-6">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  {item.coverImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.coverImage}
                      alt=""
                      className="h-14 w-10 rounded object-cover border border-border/40 shrink-0"
                    />
                  ) : (
                    <div className="h-14 w-10 rounded bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-primary/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text leading-snug truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-text/60 mt-0.5">{formatPrice(item.price)}</p>
                  </div>

                  {/* Qty */}
                  <div
                    className="flex items-center gap-1 rounded border border-border/60 bg-bg p-0.5"
                    role="group"
                    aria-label={`Quantity for ${item.title}`}
                  >
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      aria-label="Decrease quantity"
                      className="flex h-6 w-6 items-center justify-center rounded text-text/70 hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-5 text-center text-xs font-bold text-text">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      aria-label="Increase quantity"
                      className="flex h-6 w-6 items-center justify-center rounded text-text/70 hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.title}`}
                    className="flex h-7 w-7 items-center justify-center rounded text-text/40 hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>

            {/* Total + CTA */}
            <div className="border-t border-border/40 pt-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-text">Total</span>
                <span className="font-display text-lg font-bold text-primary">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <DrawerClose asChild>
                <Link
                  href="/store/cart"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-deep transition-colors"
                >
                  Review & Order <ArrowRight className="h-4 w-4" />
                </Link>
              </DrawerClose>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
