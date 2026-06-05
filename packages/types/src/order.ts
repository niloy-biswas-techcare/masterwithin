import { z } from 'zod';
import { CartItemSchema, type CartItem } from './cart';

/** Delivery details collected at checkout (§10.1, §10.3). */
export const CustomerDetailsSchema = z.object({
  name: z.string().min(1),
  mobile: z.string().min(1),
  address: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    pin: z.string().min(1),
  }),
});

export type CustomerDetails = z.infer<typeof CustomerDetailsSchema>;

/**
 * Order — the cart + customer + total at checkout (§10.1). Persistence-only fields
 * (`id`, `channel`, `createdAt`) are written server-side and are optional at
 * construction time (§16, §10.3).
 */
export const OrderSchema = z.object({
  id: z.string().optional(),
  items: z.array(CartItemSchema),
  customer: CustomerDetailsSchema,
  total: z.number().int().nonnegative(), // INR
  channel: z.enum(['whatsapp']).default('whatsapp'),
  createdAt: z.string().optional(), // ISO
});

export type Order = z.infer<typeof OrderSchema>;

/** Result of submitting an order through an `OrderProvider` (§10.1). */
export interface OrderResult {
  status: 'redirected' | 'paid' | 'pending';
  /** WhatsApp deep link, payment id, or order id. */
  reference?: string;
}

/**
 * Strategy boundary: WhatsApp now, Razorpay/Stripe later — same call site (§10.1).
 * Swapping providers never changes the cart or the form.
 */
export interface OrderProvider {
  submit(order: Order): Promise<OrderResult>;
}

export type { CartItem };
