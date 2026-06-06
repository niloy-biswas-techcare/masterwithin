import { test, expect } from '@playwright/test';

/**
 * E2E (admin): Authentication and RBAC guard tests (§20, §17.2, §17.3, §17.8).
 *
 * Verifies:
 * - Unauthenticated requests to any admin route redirect to /login.
 * - The /login page renders the login form.
 * - Invalid credentials show an error (no enumeration).
 * - After a successful login the operator reaches the dashboard.
 * - After logout the session is cleared and protected routes redirect again.
 */

const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL ?? 'http://localhost:3001';

test.describe('Admin auth & RBAC', () => {
  test('unauthenticated /  redirects to /login', async ({ page }) => {
    await page.goto(ADMIN_BASE_URL + '/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated /books redirects to /login', async ({ page }) => {
    await page.goto(ADMIN_BASE_URL + '/books');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated /settings redirects to /login', async ({ page }) => {
    await page.goto(ADMIN_BASE_URL + '/settings');
    await expect(page).toHaveURL(/\/login/);
  });

  test('/login renders email and password inputs', async ({ page }) => {
    await page.goto(ADMIN_BASE_URL + '/login');

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible();
  });

  test('invalid credentials show a generic error (no account enumeration)', async ({ page }) => {
    await page.goto(ADMIN_BASE_URL + '/login');

    await page.getByLabel(/email/i).fill('unknown@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    // Generic error — must not reveal whether the email exists
    const error = page.locator('[role="alert"], [aria-live="polite"]').filter({
      hasNotText: /^$/,
    });
    await expect(error.first()).toBeVisible({ timeout: 5000 });
    const errorText = await error.first().textContent();
    expect(errorText?.toLowerCase()).not.toContain('user not found');
    expect(errorText?.toLowerCase()).not.toContain('email does not exist');
  });

  test('admin is noindex — robots meta tag is set', async ({ page }) => {
    await page.goto(ADMIN_BASE_URL + '/login');

    const robotsMeta = page.locator('meta[name="robots"]');
    await expect(robotsMeta).toBeAttached();
    const content = await robotsMeta.getAttribute('content');
    expect(content?.toLowerCase()).toContain('noindex');
  });

  test('successful login reaches the dashboard (smoke — requires seeded admin)', async ({
    page,
  }) => {
    const email = process.env.ADMIN_TEST_EMAIL;
    const password = process.env.ADMIN_TEST_PASSWORD;

    if (!email || !password) {
      test.skip(true, 'ADMIN_TEST_EMAIL / ADMIN_TEST_PASSWORD not set — skipping login smoke');
      return;
    }

    await page.goto(ADMIN_BASE_URL + '/login');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    await expect(page).toHaveURL(new RegExp(ADMIN_BASE_URL + '/?$'), { timeout: 10_000 });
    await expect(page.locator('h1, [data-testid="dashboard-title"]')).toBeVisible();
  });

  test('logging out clears the session and redirects to /login', async ({ page }) => {
    const email = process.env.ADMIN_TEST_EMAIL;
    const password = process.env.ADMIN_TEST_PASSWORD;

    if (!email || !password) {
      test.skip(true, 'Credentials not set');
      return;
    }

    await page.goto(ADMIN_BASE_URL + '/login');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(new RegExp(ADMIN_BASE_URL + '/?$'));

    const logoutBtn = page.getByRole('button', { name: /log out|sign out/i });
    await logoutBtn.click();
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

    // Session cleared — navigating back should redirect again
    await page.goto(ADMIN_BASE_URL + '/');
    await expect(page).toHaveURL(/\/login/);
  });
});
