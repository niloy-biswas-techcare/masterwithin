import { z } from 'zod';

/**
 * CartItem — a line in the cart (§10.4). Persisted in `localStorage` via Zustand.
 * `price` here is for display; the authoritative price is re-read from the backend
 * at order construction (§10.4).
 */
export const CartItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number().int().nonnegative(), // INR, integer
  qty: z.number().int().positive(),
  coverImage: z.string().url().optional(),
});

export type CartItem = z.infer<typeof CartItemSchema>;
