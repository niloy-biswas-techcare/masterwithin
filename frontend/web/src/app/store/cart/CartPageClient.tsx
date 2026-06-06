'use client';

import React, { useActionState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  MessageCircle,
  AlertTriangle,
  Loader2,
  QrCode,
} from 'lucide-react';
import { EmptyState } from '@mw/ui';
import { Button } from '@mw/ui';
import { formatPrice } from '@mw/utils';
import { useCartStore } from '@/store/cartStore';
import { submitOrderAction, type OrderActionState } from '../actions';

function InputField({
  id,
  name,
  label,
  placeholder,
  required,
  type = 'text',
  error,
  disabled,
}: {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-text">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={!!error}
        className={`w-full rounded-lg border bg-surface px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary ${
          error
            ? 'border-danger/80 focus:border-danger'
            : 'border-border/60 focus:border-primary'
        } disabled:opacity-50`}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function CartPageClient() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalItems = useCartStore((s) => s.totalItems());
  const totalPrice = useCartStore((s) => s.totalPrice());

  const [state, formAction, isPending] = useActionState<OrderActionState | null, FormData>(
    submitOrderAction,
    null,
  );

  // On successful order: open WhatsApp, clear cart, redirect to confirmation
  const handledRef = useRef(false);
  useEffect(() => {
    if (state?.success && state.whatsappUrl && !handledRef.current) {
      handledRef.current = true;
      window.open(state.whatsappUrl, '_blank', 'noopener,noreferrer');
      clearCart();
      router.push('/store/order/confirmation');
    }
  }, [state, clearCart, router]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-content px-6 py-16">
        <EmptyState
          icon={<ShoppingBag className="h-12 w-12" />}
          title="Your shelf is waiting."
          description="Browse the bookstore and bring a book home."
          action={
            <Link
              href="/store"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-deep transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Store
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      {/* Page title */}
      <div className="mb-8 flex items-center gap-3">
        <Link
          href="/store"
          className="flex items-center gap-1.5 text-sm text-text/60 hover:text-primary transition-colors"
          aria-label="Back to store"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Store</span>
        </Link>
        <span className="text-text/30">/</span>
        <h1 className="font-display text-2xl font-bold text-text">
          Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        {/* Left: cart items + order form */}
        <form id="order-form" action={formAction} className="flex flex-col gap-8">
          {/* Hidden cart payload (JSON) passed to server action */}
          <input type="hidden" name="cart" value={JSON.stringify(items)} />

          {/* Cart items */}
          <section aria-label="Cart items">
            <ul className="divide-y divide-border/40 rounded-xl border border-border/60 bg-surface overflow-hidden">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                  {/* Cover thumbnail */}
                  {item.coverImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.coverImage}
                      alt=""
                      className="h-16 w-12 rounded object-cover border border-border/40 shrink-0"
                    />
                  ) : (
                    <div className="h-16 w-12 rounded bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-primary/50" />
                    </div>
                  )}

                  {/* Title + price */}
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-text text-sm leading-snug truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-text/60 mt-0.5">{formatPrice(item.price)} each</p>
                  </div>

                  {/* Qty controls */}
                  <div
                    className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-bg p-1"
                    role="group"
                    aria-label={`Quantity for ${item.title}`}
                  >
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      aria-label="Decrease quantity"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-text/70 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
                      disabled={isPending}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[1.5rem] text-center text-sm font-semibold text-text">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      aria-label="Increase quantity"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-text/70 hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
                      disabled={isPending}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Line total */}
                  <p className="w-20 text-right font-display text-sm font-bold text-text">
                    {formatPrice(item.price * item.qty)}
                  </p>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.title} from cart`}
                    className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-text/40 hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-40"
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Delivery details (OrderForm) */}
          <section aria-labelledby="delivery-heading">
            <h2 id="delivery-heading" className="font-display text-xl font-bold text-text mb-5">
              Delivery Details
            </h2>

            {/* Global error */}
            {state?.error && (
              <div
                className="mb-5 flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger"
                role="alert"
              >
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{state.error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                id="name"
                name="name"
                label="Full Name"
                placeholder="Souvik Ghosh"
                required
                error={state?.errors?.name}
                disabled={isPending}
              />
              <InputField
                id="mobile"
                name="mobile"
                label="Mobile Number"
                placeholder="9876543210"
                required
                type="tel"
                error={state?.errors?.mobile}
                disabled={isPending}
              />
              <div className="sm:col-span-2">
                <InputField
                  id="address.line1"
                  name="address.line1"
                  label="Address Line 1"
                  placeholder="House / Flat No., Street Name"
                  required
                  error={state?.errors?.line1}
                  disabled={isPending}
                />
              </div>
              <div className="sm:col-span-2">
                <InputField
                  id="address.line2"
                  name="address.line2"
                  label="Address Line 2"
                  placeholder="Landmark, Area (optional)"
                  disabled={isPending}
                />
              </div>
              <InputField
                id="address.city"
                name="address.city"
                label="City"
                placeholder="Kolkata"
                required
                error={state?.errors?.city}
                disabled={isPending}
              />
              <InputField
                id="address.state"
                name="address.state"
                label="State"
                placeholder="West Bengal"
                required
                error={state?.errors?.state}
                disabled={isPending}
              />
              <InputField
                id="address.pin"
                name="address.pin"
                label="PIN Code"
                placeholder="700001"
                required
                error={state?.errors?.pin}
                disabled={isPending}
              />
            </div>
          </section>

          {/* Submit — visible on mobile below form, sticky on desktop in sidebar */}
          <div className="lg:hidden">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 text-base"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5" />
                  Send Order via WhatsApp
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Right: order summary + submit (desktop) */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-24 self-start">
          <div className="rounded-xl border border-border/60 bg-surface p-6 flex flex-col gap-4">
            <h2 className="font-display text-lg font-bold text-text">Order Summary</h2>

            <ul className="flex flex-col gap-2 text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between text-text/80">
                  <span className="truncate mr-2">
                    {item.title} × {item.qty}
                  </span>
                  <span className="font-semibold shrink-0">{formatPrice(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-border/40 pt-3 flex justify-between items-center">
              <span className="font-display font-bold text-text">Total</span>
              <span className="font-display text-xl font-bold text-primary">
                {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Desktop submit button — targets #order-form via the form attribute */}
            <button
              type="submit"
              form="order-form"
              disabled={isPending}
              className="hidden lg:flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-deep transition-colors disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4" />
                  Send Order via WhatsApp
                </>
              )}
            </button>
          </div>

          {/* Payment note (§10.3) */}
          <div className="rounded-xl border border-border/40 bg-surface/60 p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-text">
              <QrCode className="h-4 w-4 text-primary shrink-0" />
              <span>How to pay</span>
            </div>
            <p className="text-xs text-text/70 leading-relaxed">
              After sending the WhatsApp order, payment can be made via{' '}
              <strong className="text-text/90">QR code / Bank Transfer / GPay / PhonePe</strong> to
              the details we share after confirmation.
            </p>
            <p className="text-xs text-text/60 leading-relaxed">
              We will confirm availability and courier details before payment.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
