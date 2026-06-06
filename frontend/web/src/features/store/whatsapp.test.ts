import { describe, it, expect } from 'vitest';
import { buildWhatsAppMessage, makeWhatsAppOrderProvider } from './whatsapp';
import type { Order } from '@mw/types';

const sampleOrder: Order = {
  items: [
    { id: 'book-1', title: 'Mastering Life', price: 350, qty: 2 },
    { id: 'book-2', title: 'Conscious Living', price: 299, qty: 1 },
  ],
  customer: {
    name: 'Niloy Das',
    mobile: '9876543210',
    address: {
      line1: 'Flat 3A, Block B',
      line2: 'Salt Lake Sector V',
      city: 'Kolkata',
      state: 'WB',
      pin: '700091',
    },
  },
  total: 999,
  channel: 'whatsapp',
};

describe('buildWhatsAppMessage', () => {
  it('includes the greeting and section headers', () => {
    const msg = buildWhatsAppMessage(sampleOrder);
    expect(msg).toContain('Hello Master Within Foundation');
    expect(msg).toContain('*New Book Order*');
    expect(msg).toContain('*Books Ordered:*');
    expect(msg).toContain('*Delivery Details:*');
  });

  it('lists each item with title, quantity, and line total', () => {
    const msg = buildWhatsAppMessage(sampleOrder);
    expect(msg).toContain('Mastering Life x2');
    expect(msg).toContain('₹700'); // 350 * 2
    expect(msg).toContain('Conscious Living x1');
    expect(msg).toContain('₹299'); // 299 * 1
  });

  it('includes the order total', () => {
    const msg = buildWhatsAppMessage(sampleOrder);
    expect(msg).toContain('₹999');
  });

  it('includes all delivery fields', () => {
    const msg = buildWhatsAppMessage(sampleOrder);
    expect(msg).toContain('Niloy Das');
    expect(msg).toContain('9876543210');
    expect(msg).toContain('Flat 3A');
    expect(msg).toContain('Salt Lake Sector V');
    expect(msg).toContain('Kolkata');
    expect(msg).toContain('WB');
    expect(msg).toContain('700091');
  });

  it('omits line2 from address when not provided', () => {
    const orderNoLine2: Order = {
      ...sampleOrder,
      customer: {
        ...sampleOrder.customer,
        address: { line1: 'House 7', city: 'Mumbai', state: 'MH', pin: '400001' },
      },
    };
    const msg = buildWhatsAppMessage(orderNoLine2);
    // line2 is optional; the comma-joined address should not have a trailing comma artifact
    expect(msg).not.toMatch(/undefined/);
    expect(msg).toContain('House 7, Mumbai, MH, 400001');
  });

  it('handles a single item order correctly', () => {
    const singleItemOrder: Order = {
      ...sampleOrder,
      items: [{ id: 'book-1', title: 'Solo Book', price: 500, qty: 3 }],
      total: 1500,
    };
    const msg = buildWhatsAppMessage(singleItemOrder);
    expect(msg).toContain('Solo Book x3');
    expect(msg).toContain('₹1500'); // 500 * 3
    expect(msg).toContain('₹1500'); // total
  });
});

describe('makeWhatsAppOrderProvider', () => {
  it('returns status "redirected" with a wa.me deep link', async () => {
    const provider = makeWhatsAppOrderProvider('919876543210');
    const result = await provider.submit(sampleOrder);
    expect(result.status).toBe('redirected');
    expect(result.reference).toMatch(/^https:\/\/wa\.me\/919876543210\?text=/);
  });

  it('deep link URL-encodes the message', async () => {
    const provider = makeWhatsAppOrderProvider('919876543210');
    const result = await provider.submit(sampleOrder);
    // Spaces should be encoded (no raw spaces after ?text=)
    const textPart = result.reference!.split('?text=')[1]!;
    expect(textPart).not.toContain(' ');
    // Decode and verify it contains the expected content
    const decoded = decodeURIComponent(textPart);
    expect(decoded).toContain('Mastering Life');
  });

  it('includes the correct WhatsApp number in the URL', async () => {
    const provider = makeWhatsAppOrderProvider('911234567890');
    const result = await provider.submit(sampleOrder);
    expect(result.reference).toContain('wa.me/911234567890');
  });
});
