'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  MessageCircle,
  QrCode,
  Banknote,
  Smartphone,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

const PAYMENT_METHODS = [
  { icon: QrCode, label: 'QR Code', desc: 'Scan & pay instantly' },
  { icon: Banknote, label: 'Bank Transfer', desc: 'NEFT / IMPS / RTGS' },
  { icon: Smartphone, label: 'GPay / PhonePe', desc: 'UPI apps' },
];

export function ConfirmationClient() {
  const clearCart = useCartStore((s) => s.clearCart);

  // Clear the cart on mount — order was sent
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="mx-auto max-w-xl px-5 sm:px-8 lg:px-10 py-16 md:py-24 flex flex-col items-center gap-10 text-center">
      {/* Success icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 border border-success/30">
        <CheckCircle2 className="h-10 w-10 text-success" aria-hidden="true" />
      </div>

      {/* Heading */}
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-3xl font-bold text-text">Order Sent!</h1>
        <p className="text-text/70 leading-relaxed">
          Your order has been sent to our WhatsApp. We will confirm availability, share payment
          details, and arrange delivery shortly.
        </p>
      </div>

      {/* WhatsApp note */}
      <div className="w-full rounded-xl border border-border/60 bg-surface p-6 flex flex-col gap-3">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-text">
          <MessageCircle className="h-5 w-5 text-success" />
          <span>What happens next?</span>
        </div>
        <ol className="flex flex-col gap-2 text-sm text-text/70 text-left list-decimal list-inside">
          <li>We receive your WhatsApp message with the order details.</li>
          <li>We confirm stock availability and share the courier estimate.</li>
          <li>You make payment using one of the methods below.</li>
          <li>We dispatch the book(s) and share the tracking info.</li>
        </ol>
      </div>

      {/* Payment methods */}
      <div className="w-full flex flex-col gap-4">
        <p className="text-sm font-semibold text-text">
          Payment options (shared after WhatsApp confirmation)
        </p>
        <div className="grid grid-cols-3 gap-3">
          {PAYMENT_METHODS.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-surface p-4"
            >
              <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="text-xs font-bold text-text">{label}</span>
              <span className="text-[10px] text-text/60 leading-tight">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link
          href="/store"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border/60 bg-surface hover:bg-bg px-5 py-3 text-sm font-semibold text-text transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Link>
        <Link
          href="/wisdom"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-deep px-5 py-3 text-sm font-semibold text-white transition-colors"
        >
          <BookOpen className="h-4 w-4" /> Explore Wisdom Library
        </Link>
      </div>
    </div>
  );
}
