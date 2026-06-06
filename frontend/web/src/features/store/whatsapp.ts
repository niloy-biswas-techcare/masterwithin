import type { Order, OrderProvider, OrderResult } from '@mw/types';

export function buildWhatsAppMessage(order: Order): string {
  const lines = order.items
    .map((it, i) => `${i + 1}. ${it.title} x${it.qty} — ₹${it.price * it.qty}`)
    .join('\n');
  const a = order.customer.address;
  const address = [a.line1, a.line2, a.city, a.state, a.pin].filter(Boolean).join(', ');

  return `Hello Master Within Foundation! 🙏

📦 *New Book Order*

*Books Ordered:*
${lines}

*Total: ₹${order.total}*

*Delivery Details:*
Name: ${order.customer.name}
Mobile: ${order.customer.mobile}
Address: ${address}

Please confirm availability and courier details. Thank you!`;
}

export function makeWhatsAppOrderProvider(whatsappNumber: string): OrderProvider {
  return {
    async submit(order: Order): Promise<OrderResult> {
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage(order))}`;
      return { status: 'redirected', reference: url };
    },
  };
}
