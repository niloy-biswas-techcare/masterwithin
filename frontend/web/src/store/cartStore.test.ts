import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useCartStore } from './cartStore';

// Reset Zustand store to a clean state before each test.
beforeEach(() => {
  act(() => {
    useCartStore.setState({ items: [] });
  });
});

describe('cartStore — addItem', () => {
  it('adds a new item with qty 1', () => {
    act(() => {
      useCartStore.getState().addItem({ id: 'book-1', title: 'Book One', price: 299 });
    });
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: 'book-1', qty: 1 });
  });

  it('increments qty instead of duplicating an existing item', () => {
    const add = useCartStore.getState().addItem;
    act(() => {
      add({ id: 'book-1', title: 'Book One', price: 299 });
      add({ id: 'book-1', title: 'Book One', price: 299 });
    });
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].qty).toBe(2);
  });

  it('adds multiple distinct items independently', () => {
    const add = useCartStore.getState().addItem;
    act(() => {
      add({ id: 'book-1', title: 'Book One', price: 299 });
      add({ id: 'book-2', title: 'Book Two', price: 499 });
    });
    expect(useCartStore.getState().items).toHaveLength(2);
  });
});

describe('cartStore — removeItem', () => {
  it('removes the specified item', () => {
    act(() => {
      useCartStore.getState().addItem({ id: 'book-1', title: 'Book One', price: 299 });
      useCartStore.getState().addItem({ id: 'book-2', title: 'Book Two', price: 499 });
      useCartStore.getState().removeItem('book-1');
    });
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('book-2');
  });

  it('is a no-op when the id does not exist', () => {
    act(() => {
      useCartStore.getState().addItem({ id: 'book-1', title: 'Book', price: 100 });
      useCartStore.getState().removeItem('nonexistent');
    });
    expect(useCartStore.getState().items).toHaveLength(1);
  });
});

describe('cartStore — updateQty', () => {
  it('updates qty to the specified value', () => {
    act(() => {
      useCartStore.getState().addItem({ id: 'book-1', title: 'Book', price: 299 });
      useCartStore.getState().updateQty('book-1', 5);
    });
    expect(useCartStore.getState().items[0].qty).toBe(5);
  });

  it('removes the item when qty is set to 0', () => {
    act(() => {
      useCartStore.getState().addItem({ id: 'book-1', title: 'Book', price: 299 });
      useCartStore.getState().updateQty('book-1', 0);
    });
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('removes the item when qty is negative', () => {
    act(() => {
      useCartStore.getState().addItem({ id: 'book-1', title: 'Book', price: 299 });
      useCartStore.getState().updateQty('book-1', -1);
    });
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('cartStore — clearCart', () => {
  it('empties all items', () => {
    act(() => {
      useCartStore.getState().addItem({ id: 'book-1', title: 'Book', price: 299 });
      useCartStore.getState().addItem({ id: 'book-2', title: 'Other', price: 199 });
      useCartStore.getState().clearCart();
    });
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('cartStore — totals', () => {
  beforeEach(() => {
    act(() => {
      const { addItem, updateQty } = useCartStore.getState();
      addItem({ id: 'book-1', title: 'Book One', price: 350 });
      addItem({ id: 'book-2', title: 'Book Two', price: 200 });
      updateQty('book-1', 3); // 350 * 3 = 1050
      updateQty('book-2', 2); // 200 * 2 = 400
    });
  });

  it('totalItems sums quantities across all items', () => {
    expect(useCartStore.getState().totalItems()).toBe(5); // 3 + 2
  });

  it('totalPrice sums price * qty for all items', () => {
    expect(useCartStore.getState().totalPrice()).toBe(1450); // 1050 + 400
  });

  it('totalItems is 0 for an empty cart', () => {
    act(() => { useCartStore.getState().clearCart(); });
    expect(useCartStore.getState().totalItems()).toBe(0);
  });

  it('totalPrice is 0 for an empty cart', () => {
    act(() => { useCartStore.getState().clearCart(); });
    expect(useCartStore.getState().totalPrice()).toBe(0);
  });
});
