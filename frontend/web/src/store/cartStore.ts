import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@mw/types';

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          return existing
            ? { items: s.items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i)) }
            : { items: [...s.items, { ...item, qty: 1 }] };
        }),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      updateQty: (id, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.id !== id)
              : s.items.map((i) => (i.id === id ? { ...i, qty } : i)),
        })),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((n, i) => n + i.qty, 0),
      totalPrice: () => get().items.reduce((n, i) => n + i.price * i.qty, 0),
    }),
    { name: 'mw-cart', version: 1 },
  ),
);
