import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { CartDrawer } from './CartDrawer';
import { useCartStore } from '@/store/cartStore';

// Reset cart state before each test
beforeEach(() => {
  act(() => {
    useCartStore.setState({ items: [] });
  });
});

describe('CartDrawer', () => {
  it('renders the trigger element', () => {
    render(<CartDrawer trigger={<button>Cart</button>} />);
    expect(screen.getByRole('button', { name: 'Cart' })).toBeInTheDocument();
  });

  it('opens the drawer when the trigger is clicked', () => {
    render(<CartDrawer trigger={<button>Open Cart</button>} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Cart' }));
    // DrawerContent sets aria title; the dialog should be present
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows the empty-state message when the cart has no items', () => {
    render(<CartDrawer trigger={<button>Cart</button>} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cart' }));
    expect(screen.getByText(/Your shelf is waiting/i)).toBeInTheDocument();
  });

  it('shows the "Browse Store" link in the empty state', () => {
    render(<CartDrawer trigger={<button>Cart</button>} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cart' }));
    expect(screen.getByRole('link', { name: /browse store/i })).toHaveAttribute('href', '/store');
  });

  it('renders each cart item when the cart has items', () => {
    act(() => {
      useCartStore.getState().addItem({ id: 'book-1', title: 'Mastering Life', price: 350 });
      useCartStore.getState().addItem({ id: 'book-2', title: 'Conscious Living', price: 299 });
    });

    render(<CartDrawer trigger={<button>Cart</button>} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cart' }));

    expect(screen.getByText('Mastering Life')).toBeInTheDocument();
    expect(screen.getByText('Conscious Living')).toBeInTheDocument();
  });

  it('displays the cart total price', () => {
    act(() => {
      useCartStore.getState().addItem({ id: 'book-1', title: 'Book', price: 350 });
      useCartStore.getState().updateQty('book-1', 2);
    });

    render(<CartDrawer trigger={<button>Cart</button>} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cart' }));

    expect(screen.getByText('₹700')).toBeInTheDocument(); // 350 * 2
  });

  it('shows item count in the drawer title', () => {
    act(() => {
      useCartStore.getState().addItem({ id: 'book-1', title: 'Book One', price: 100 });
      useCartStore.getState().addItem({ id: 'book-2', title: 'Book Two', price: 200 });
    });

    render(<CartDrawer trigger={<button>Cart</button>} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cart' }));

    // Drawer title shows "Cart (2)"
    expect(screen.getByText(/cart \(2\)/i)).toBeInTheDocument();
  });

  it('removes an item when the delete button is clicked', () => {
    act(() => {
      useCartStore.getState().addItem({ id: 'book-1', title: 'Removable Book', price: 299 });
    });

    render(<CartDrawer trigger={<button>Cart</button>} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cart' }));

    const removeBtn = screen.getByRole('button', { name: /remove removable book/i });
    act(() => { fireEvent.click(removeBtn); });

    expect(screen.queryByText('Removable Book')).not.toBeInTheDocument();
  });

  it('includes a "Review & Order" link to /store/cart when cart is non-empty', () => {
    act(() => {
      useCartStore.getState().addItem({ id: 'book-1', title: 'Book', price: 100 });
    });

    render(<CartDrawer trigger={<button>Cart</button>} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cart' }));

    const link = screen.getByRole('link', { name: /review.*order/i });
    expect(link).toHaveAttribute('href', '/store/cart');
  });

  it('has no a11y violations in empty state', async () => {
    const { container } = render(<CartDrawer trigger={<button>Cart</button>} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cart' }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
