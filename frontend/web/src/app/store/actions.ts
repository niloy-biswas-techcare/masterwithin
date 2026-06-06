'use server';

import { placeOrder } from '@mw/backend';
import { CustomerDetailsSchema } from '@mw/types';
import { makeWhatsAppOrderProvider } from '@/features/store/whatsapp';
import { env } from '@/lib/env';
import { z } from 'zod';

export interface OrderActionState {
  success?: boolean;
  whatsappUrl?: string;
  error?: string;
  errors?: {
    name?: string;
    mobile?: string;
    line1?: string;
    city?: string;
    state?: string;
    pin?: string;
  };
}

const RawCartItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number().int().nonnegative(),
  qty: z.number().int().positive(),
  coverImage: z.string().url().optional(),
});

export async function submitOrderAction(
  _prev: OrderActionState | null,
  formData: FormData,
): Promise<OrderActionState> {
  // 1. Parse cart from hidden JSON field (sent by client)
  const cartJson = formData.get('cart') as string | null;
  const cartParsed = z.array(RawCartItemSchema).safeParse(
    (() => {
      try {
        return JSON.parse(cartJson ?? '[]');
      } catch {
        return [];
      }
    })(),
  );

  if (!cartParsed.success || cartParsed.data.length === 0) {
    return { error: 'Your cart is empty or could not be read. Please refresh and try again.' };
  }

  const cartItems = cartParsed.data;

  // 2. Validate customer details
  const customerRaw = {
    name: formData.get('name') as string,
    mobile: formData.get('mobile') as string,
    address: {
      line1: formData.get('address.line1') as string,
      line2: (formData.get('address.line2') as string) || undefined,
      city: formData.get('address.city') as string,
      state: formData.get('address.state') as string,
      pin: formData.get('address.pin') as string,
    },
  };

  const customerParsed = CustomerDetailsSchema.safeParse(customerRaw);
  if (!customerParsed.success) {
    const errors: OrderActionState['errors'] = {};
    for (const issue of customerParsed.error.issues) {
      const path = issue.path.join('.');
      if (path === 'name') errors.name = issue.message;
      else if (path === 'mobile') errors.mobile = issue.message;
      else if (path === 'address.line1') errors.line1 = issue.message;
      else if (path === 'address.city') errors.city = issue.message;
      else if (path === 'address.state') errors.state = issue.message;
      else if (path === 'address.pin') errors.pin = issue.message;
    }
    return { errors };
  }

  const customer = customerParsed.data;

  // 3. Call placeOrder use-case — re-reads authoritative prices, persists (§10.4)
  let savedOrder;
  try {
    savedOrder = await placeOrder({
      items: cartItems,
      customer,
      total: cartItems.reduce((sum, it) => sum + it.price * it.qty, 0),
      channel: 'whatsapp',
    });
  } catch (err: unknown) {
    console.error('[submitOrderAction] placeOrder failed:', err);
    return {
      error: err instanceof Error ? err.message : 'Could not process your order. Please try again.',
    };
  }

  // 4. Build WhatsApp deep link server-side from WHATSAPP_NUMBER (§10.2) 🔒
  const whatsappNumber = env.WHATSAPP_NUMBER ?? '';
  const provider = makeWhatsAppOrderProvider(whatsappNumber);
  const result = await provider.submit(savedOrder);

  return { success: true, whatsappUrl: result.reference };
}
