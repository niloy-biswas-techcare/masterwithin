import { test, expect } from '@playwright/test';

/**
 * E2E: Contact form submission (§20, §7.9).
 *
 * Verifies:
 * - Form renders all required fields with proper labels.
 * - Client/server-side validation prevents empty submission.
 * - Honeypot field is present but invisible to humans.
 * - A valid submission shows a success state (no page reload needed).
 */

test.describe('Contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('contact page has correct title and one h1', async ({ page }) => {
    await expect(page).toHaveTitle(/contact|get in touch/i);
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('form renders Name, Email, and Message fields', async ({ page }) => {
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/message/i)).toBeVisible();
  });

  test('honeypot "website" field is present but hidden', async ({ page }) => {
    const honeypot = page.locator('input[name="website"]');
    await expect(honeypot).toBeAttached();
    // Must not be visible to a human user (aria-hidden, display:none, or visually hidden)
    await expect(honeypot).not.toBeVisible();
  });

  test('shows validation errors when form is submitted empty', async ({ page }) => {
    await page.getByRole('button', { name: /send|submit/i }).click();

    // At least one error should appear
    const errorLocator = page.locator('[role="alert"], [aria-live="polite"]').filter({
      hasNotText: /^$/,
    });
    await expect(errorLocator.first()).toBeVisible({ timeout: 3000 });
  });

  test('rejects an invalid email address', async ({ page }) => {
    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('not-an-email');
    await page.getByLabel(/message/i).fill('Hello World');
    await page.getByRole('button', { name: /send|submit/i }).click();

    const errors = page.locator('[role="alert"], [aria-live="polite"]').filter({
      hasNotText: /^$/,
    });
    await expect(errors.first()).toBeVisible({ timeout: 3000 });
  });

  test('successfully submits the form with valid input', async ({ page }) => {
    await page.getByLabel(/name/i).fill('Souvik Ghosh');
    await page.getByLabel(/email/i).fill('souvik@masterwithin.org');
    await page.getByLabel(/message/i).fill('I have a question about conscious living.');

    await page.getByRole('button', { name: /send|submit/i }).click();

    // Success state: a confirmation message should appear (no redirect required)
    const success = page.locator(
      '[data-testid="contact-success"], [aria-live="assertive"], .text-success',
    );
    await expect(success.or(page.getByText(/thank you|sent|received/i))).toBeVisible({
      timeout: 8000,
    });
  });

  test('contact page has no obvious a11y landmarks violations', async ({ page }) => {
    // Verify the page has semantic nav/main/footer structure
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
});
