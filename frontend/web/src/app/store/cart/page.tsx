import React from 'react';
import type { Metadata } from 'next';
import { CartPageClient } from './CartPageClient';

export const metadata: Metadata = {
  title: 'Your Cart — Master Within',
  description: 'Review your order and send it via WhatsApp.',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartPageClient />;
}
