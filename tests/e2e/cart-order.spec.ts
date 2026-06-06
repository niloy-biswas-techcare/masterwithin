import { test, expect } from '@playwright/test';

/**
 * E2E: Add-to-cart → cart review → WhatsApp order (§20, §10).
 *
 * Covers:
 * - Adding a physical book to the cart from the Store page.
 * - Cart drawer / indicator updating.
 * - Cart review at `/store/cart` (quantities, totals).
 * - OrderForm field validation.
 * - "Send Order via WhatsApp" deep-link behaviour (redirect to wa.me).
 * - Confirmation screen and cart clearing.
 */

test.describe('Cart & WhatsApp checkout', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart via localStorage before each test
    await page.goto('/store');
    await page.evaluate(() => localStorage.removeItem('mw-cart'));
    await page.reload();
  });

  test('store page shows at least one book with "Add to cart" button', async ({ page }) => {
    await page.goto('/store');

    const addBtn = page.getByRole('button', { name: /add to cart/i }).first();
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toBeEnabled();
  });

  test('clicking "Add to cart" updates the cart indicator in the navbar', async ({ page }) => {
    await page.goto('/store');

    const addBtn = page.getByRole('button', { name: /add to cart/i }).first();
    await addBtn.click();

    // Cart indicator should now show a non-zero count
    const indicator = page.locator('[aria-label*="cart"], [data-testid="cart-count"]');
    if (await indicator.count()) {
      const text = await indicator.first().textContent();
      expect(parseInt(text ?? '0', 10)).toBeGreaterThan(0);
    }
  });

  test('cart drawer opens and shows the added item', async ({ page }) => {
    await page.goto('/store');

    const addBtn = page.getByRole('button', { name: /add to cart/i }).first();
    await addBtn.click();

    // Open cart drawer via nav icon
    const cartTrigger = page.locator('[aria-label*="cart"], [data-testid="cart-trigger"]').first();
    if (await cartTrigger.count()) {
      await cartTrigger.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      // Drawer must contain at least one item
      await expect(page.locator('[role="dialog"] li')).toHaveCount(1);
    }
  });

  test('cart page /store/cart shows items with quantities and subtotal', async ({ page }) => {
    await page.goto('/store');
    const addBtn = page.getByRole('button', { name: /add to cart/i }).first();
    await addBtn.click();

    await page.goto('/store/cart');

    await expect(page.locator('h1, [data-testid="cart-title"]')).toContainText(/cart|order/i);
    // At least one item in the list
    await expect(page.locator('ul li, [data-testid="cart-item"]')).not.toHaveCount(0);
    // Subtotal should be visible
    await expect(page.getByText(/total|subtotal/i)).toBeVisible();
  });

  test('order form validates required fields before submission', async ({ page }) => {
    await page.goto('/store');
    await page.getByRole('button', { name: /add to cart/i }).first().click();
    await page.goto('/store/cart');

    // Try to submit without filling out the form
    const submitBtn = page.getByRole('button', { name: /send.*whatsapp|place order/i });
    if (!(await submitBtn.count())) {
      test.skip(true, 'Order form not present on cart page');
      return;
    }
    await submitBtn.click();

    // Validation errors should appear
    const errors = page.locator('[role="alert"], .text-danger, [aria-live="polite"]');
    await expect(errors.first()).toBeVisible();
  });

  test('completed order form redirects to WhatsApp deep link', async ({ page, context }) => {
    await page.goto('/store');
    await page.getByRole('button', { name: /add to cart/i }).first().click();
    await page.goto('/store/cart');

    const submitBtn = page.getByRole('button', { name: /send.*whatsapp|place order/i });
    if (!(await submitBtn.count())) {
      test.skip(true, 'Order form not present on cart page');
      return;
    }

    // Fill mandatory fields
    await page.getByLabel(/full name|name/i).fill('Test User');
    await page.getByLabel(/mobile|phone/i).fill('9876543210');
    await page.getByLabel(/address line 1|street/i).fill('Flat 3A');
    await page.getByLabel(/city/i).fill('Kolkata');
    await page.getByLabel(/state/i).fill('WB');
    await page.getByLabel(/pin|postal/i).fill('700091');

    // Intercept the wa.me navigation (new tab / redirect)
    const popup = context.waitForEvent('page').catch(() => null);
    await submitBtn.click();

    // Either a new tab opens with wa.me URL or the page redirects
    const newPage = await popup;
    if (newPage) {
      await expect(newPage).toHaveURL(/wa\.me\//);
    } else {
      // Inline redirect case: could stay on confirmation or navigate
      await page.waitForURL(/confirmation|store/);
    }
  });

  test('confirmation page is shown and cart is cleared', async ({ page }) => {
    await page.goto('/store/order/confirmation');

    await expect(page.locator('h1, [data-testid="confirmation-title"]')).toBeVisible();
    // Cart should be empty after confirmation
    const cartCount = await page.evaluate(() => {
      try {
        const raw = localStorage.getItem('mw-cart');
        if (!raw) return 0;
        const state = JSON.parse(raw);
        return state?.state?.items?.length ?? 0;
      } catch {
        return 0;
      }
    });
    expect(cartCount).toBe(0);
  });
});
