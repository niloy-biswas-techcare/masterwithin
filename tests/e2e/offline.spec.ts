import { test, expect } from '@playwright/test';

/**
 * E2E: Offline — cached content is still readable after going offline (§20, §12.3).
 *
 * The service worker (Serwist) and IndexedDB persisted TanStack Query cache mean
 * that once a visitor has loaded the site, they can still read articles and
 * navigate between cached pages without a network connection.
 */

test.describe('Offline cache', () => {
  test('wisdom library article is readable after going offline', async ({ page, context }) => {
    // 1. Load the page while online to warm the cache
    await page.goto('/wisdom');
    await page.waitForLoadState('networkidle');

    // Navigate to the first article-depth link to prime the cache
    const articleLinks = page.locator('a[href*="/wisdom/"][href$="-"]');
    const count = await articleLinks.count();
    if (!count) {
      test.skip(true, 'No article links found — content not seeded');
      return;
    }

    const firstArticle = articleLinks.first();
    const href = await firstArticle.getAttribute('href');
    await firstArticle.click();
    await page.waitForLoadState('networkidle');

    // 2. Go offline
    await context.setOffline(true);

    // 3. Reload — the service worker / persisted cache should serve the page
    await page.reload();

    // The article content should still be visible (not a network error page)
    const articleTitle = page.locator('h1');
    await expect(articleTitle).toBeVisible({ timeout: 10_000 });

    // No browser offline error screen
    await expect(page.locator('body')).not.toContainText(/no internet|offline|ERR_INTERNET_DISCONNECTED/i);

    // 4. Restore network
    await context.setOffline(false);
  });

  test('home page is served from cache when offline', async ({ page, context }) => {
    // Warm the app shell
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await context.setOffline(true);
    await page.reload();

    // Core layout must still render
    await expect(page.locator('header')).toBeVisible({ timeout: 10_000 });

    await context.setOffline(false);
  });

  test('cached wisdom listing is still navigable when offline', async ({ page, context }) => {
    await page.goto('/wisdom');
    await page.waitForLoadState('networkidle');

    // Prime one level deeper
    const categoryLink = page.locator('a[href^="/wisdom/"]').first();
    if (await categoryLink.count()) {
      await categoryLink.click();
      await page.waitForLoadState('networkidle');
      await page.goBack();
    }

    await context.setOffline(true);
    await page.reload();

    // At minimum, the page structure should render
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });
    await context.setOffline(false);
  });
});
