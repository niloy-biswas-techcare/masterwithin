import React from 'react';
import type { Metadata } from 'next';
import { ConfirmationClient } from './ConfirmationClient';

export const metadata: Metadata = {
  title: 'Order Sent — Master Within',
  description: 'Your order has been sent via WhatsApp. We will confirm and arrange delivery.',
  robots: { index: false, follow: false },
};

export default function OrderConfirmationPage() {
  return <ConfirmationClient />;
}
