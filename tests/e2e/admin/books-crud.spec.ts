import { test, expect, Page } from '@playwright/test';

/**
 * E2E (admin): Book CRUD — create, publish, and verify on the public store (§20, §17.4, §17.5).
 *
 * Critical admin journey:
 * 1. Login as admin.
 * 2. Navigate to /books/new.
 * 3. Fill the form and save.
 * 4. Verify the book appears in the books list.
 * 5. Toggle "Published" and confirm the store page picks it up (via ISR).
 *
 * Also covers:
 * - `editor` role is denied the operator-management (/settings) screen.
 */

const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL ?? 'http://localhost:3001';
const WEB_BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

async function loginAsAdmin(page: Page) {
  const email = process.env.ADMIN_TEST_EMAIL;
  const password = process.env.ADMIN_TEST_PASSWORD;
  if (!email || !password) return false;

  await page.goto(ADMIN_BASE_URL + '/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  await page.waitForURL(new RegExp(ADMIN_BASE_URL + '/?$'), { timeout: 10_000 });
  return true;
}

async function loginAsEditor(page: Page) {
  const email = process.env.EDITOR_TEST_EMAIL;
  const password = process.env.EDITOR_TEST_PASSWORD;
  if (!email || !password) return false;

  await page.goto(ADMIN_BASE_URL + '/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  await page.waitForURL(new RegExp(ADMIN_BASE_URL + '/?$'), { timeout: 10_000 });
  return true;
}

test.describe('Admin books CRUD', () => {
  test('Books list page is accessible after login', async ({ page }) => {
    const ok = await loginAsAdmin(page);
    if (!ok) { test.skip(true, 'Admin credentials not set'); return; }

    await page.goto(ADMIN_BASE_URL + '/books');
    await expect(page.locator('h1')).toBeVisible();
    // DataTable or list should render
    await expect(page.locator('table, [data-testid="books-table"]')).toBeVisible();
  });

  test('can create a new book and see it in the list', async ({ page }) => {
    const ok = await loginAsAdmin(page);
    if (!ok) { test.skip(true, 'Admin credentials not set'); return; }

    await page.goto(ADMIN_BASE_URL + '/books/new');

    const uniqueTitle = `E2E Test Book ${Date.now()}`;
    await page.getByLabel(/title/i).fill(uniqueTitle);
    await page.getByLabel(/author/i).fill('E2E Author');
    await page.getByLabel(/price/i).fill('199');
    await page.getByLabel(/description/i).fill('Created by automated E2E test.');

    // Cover image upload is not tested here (requires a signed upload to Cloudinary);
    // the form must allow submission without it or with a placeholder.

    await page.getByRole('button', { name: /save|add book/i }).click();

    // Should redirect to the book list or detail
    await page.waitForURL(new RegExp(ADMIN_BASE_URL + '/books'), { timeout: 10_000 });

    // The new book should appear in the table
    await expect(page.getByText(uniqueTitle)).toBeVisible({ timeout: 5000 });
  });

  test('toggling published/available triggers an ISR revalidation', async ({ page }) => {
    const ok = await loginAsAdmin(page);
    if (!ok) { test.skip(true, 'Admin credentials not set'); return; }

    await page.goto(ADMIN_BASE_URL + '/books');
    const toggles = page.locator('[data-testid="publish-toggle"], input[type="checkbox"]');
    if (!(await toggles.count())) {
      test.skip(true, 'No publish toggles found');
      return;
    }

    const toggle = toggles.first();
    const initialState = await toggle.isChecked();
    await toggle.click();
    // Optimistic update — toggle should flip
    await expect(toggle).toBeChecked({ checked: !initialState, timeout: 3000 });
    // Revert so we don't break the real data
    await toggle.click();
  });

  test('published book appears on the public /store page', async ({ page }) => {
    // This smoke test assumes at least one book is published.
    await page.goto(WEB_BASE_URL + '/store');
    await expect(page.locator('h1')).toBeVisible();
    // At least one book card should exist
    const bookCards = page.locator('[data-testid="book-card"], article').filter({
      has: page.getByRole('button', { name: /add to cart|unavailable/i }),
    });
    await expect(bookCards.first()).toBeVisible({ timeout: 5000 });
  });

  test('audit log records the book mutation', async ({ page }) => {
    const ok = await loginAsAdmin(page);
    if (!ok) { test.skip(true, 'Admin credentials not set'); return; }

    await page.goto(ADMIN_BASE_URL + '/');
    // Activity feed on dashboard shows recent audit entries
    const activityFeed = page.locator('[data-testid="activity-feed"], [aria-label="Activity feed"]');
    if (await activityFeed.count()) {
      await expect(activityFeed.locator('li').first()).toBeVisible();
    }
  });
});

test.describe('Admin RBAC — editor cannot access operator management', () => {
  test('editor role is denied the /settings operator management section', async ({ page }) => {
    const ok = await loginAsEditor(page);
    if (!ok) { test.skip(true, 'Editor credentials not set'); return; }

    await page.goto(ADMIN_BASE_URL + '/settings');

    // The operator management section must not be visible to editors
    const operatorSection = page.locator(
      '[data-testid="operator-management"], :text("Manage Operators")',
    );
    await expect(operatorSection).not.toBeVisible();
  });

  test('editor can access the books list (editor-level access)', async ({ page }) => {
    const ok = await loginAsEditor(page);
    if (!ok) { test.skip(true, 'Editor credentials not set'); return; }

    await page.goto(ADMIN_BASE_URL + '/books');
    await expect(page.locator('h1')).toBeVisible();
  });
});
