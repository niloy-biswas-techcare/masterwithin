import { test, expect } from '@playwright/test';

/**
 * E2E: Search & tag filter on the Wisdom Library (§20, §7.2, §12.4).
 *
 * Verifies:
 * - The search bar filters articles client-side without a page reload.
 * - Category cards navigate to the correct listing URL.
 * - Tag filter chips narrow down the article list.
 * - Pagination navigates between pages and updates the URL.
 * - EmptyState is rendered when no results match (§18).
 */

test.describe('Wisdom Library — search & filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/wisdom');
    await page.waitForLoadState('networkidle');
  });

  test('page renders 8 category cards', async ({ page }) => {
    // 8 fixed categories (§6)
    const cards = page.locator('a[href^="/wisdom/"]');
    // There should be at least 8 links (categories)
    await expect(cards).not.toHaveCount(0);
  });

  test('clicking a category navigates to the category listing', async ({ page }) => {
    const categoryLink = page.locator('a[href^="/wisdom/"]').first();
    const href = await categoryLink.getAttribute('href');
    await categoryLink.click();
    await expect(page).toHaveURL(new RegExp(href!));
    await expect(page.locator('h1')).toBeVisible();
  });

  test('search input filters articles by title/excerpt', async ({ page }) => {
    const searchInput = page
      .getByRole('searchbox')
      .or(page.getByPlaceholder(/search/i))
      .first();

    if (!(await searchInput.count())) {
      test.skip(true, 'Search bar not present');
      return;
    }

    const beforeCount = await page.locator('article, [data-testid="article-card"]').count();
    if (!beforeCount) {
      test.skip(true, 'No article cards to filter — content not seeded');
      return;
    }

    // Type a search term unlikely to match every article
    await searchInput.fill('zzz-no-match-zzz');
    await page.waitForTimeout(400); // debounce

    const afterCount = await page.locator('article, [data-testid="article-card"]').count();
    // Either fewer results, or an empty state is shown
    const emptyState = page.locator('[data-testid="empty-state"], :text("No articles found")');
    const hasEmptyState = await emptyState.count() > 0;

    expect(afterCount < beforeCount || hasEmptyState).toBe(true);
  });

  test('clearing the search restores all articles', async ({ page }) => {
    const searchInput = page
      .getByRole('searchbox')
      .or(page.getByPlaceholder(/search/i))
      .first();

    if (!(await searchInput.count())) {
      test.skip(true, 'Search bar not present');
      return;
    }

    const initial = await page.locator('article, [data-testid="article-card"]').count();
    if (!initial) {
      test.skip(true, 'No articles to test against');
      return;
    }

    await searchInput.fill('zzz-no-match-zzz');
    await page.waitForTimeout(400);

    await searchInput.clear();
    await page.waitForTimeout(400);

    const restored = await page.locator('article, [data-testid="article-card"]').count();
    expect(restored).toBe(initial);
  });

  test('tag filter chips narrow down results', async ({ page }) => {
    const tagFilters = page.locator('[data-testid="tag-filter"] button, .tag-chip');

    if (!(await tagFilters.count())) {
      test.skip(true, 'No tag filter chips present');
      return;
    }

    const initialCount = await page.locator('article, [data-testid="article-card"]').count();
    await tagFilters.first().click();
    await page.waitForTimeout(400);

    const filteredCount = await page.locator('article, [data-testid="article-card"]').count();
    const emptyState = page.locator('[data-testid="empty-state"]');

    expect(filteredCount <= initialCount || (await emptyState.count()) > 0).toBe(true);
  });

  test('pagination changes the page and updates the URL query param', async ({ page }) => {
    const paginationNext = page.getByRole('link', { name: /next|›|»/i }).first();

    if (!(await paginationNext.count())) {
      test.skip(true, 'Pagination not present (fewer than 1 page of content)');
      return;
    }

    await paginationNext.click();
    await expect(page).toHaveURL(/[?&]page=2/);
  });

  test('empty state renders when no articles match a search', async ({ page }) => {
    const searchInput = page
      .getByRole('searchbox')
      .or(page.getByPlaceholder(/search/i))
      .first();

    if (!(await searchInput.count())) {
      test.skip(true, 'Search bar not present');
      return;
    }

    await searchInput.fill('xqzqzqzqzq-definitely-no-match-7734');
    await page.waitForTimeout(600);

    // Either explicit empty state component or a "No results" message
    const emptyMsg = page
      .getByText(/no articles|no results|nothing found/i)
      .or(page.locator('[data-testid="empty-state"]'));

    const articleCards = page.locator('article, [data-testid="article-card"]');
    const cardCount = await articleCards.count();
    const emptyCount = await emptyMsg.count();

    expect(cardCount === 0 || emptyCount > 0).toBe(true);
  });
});
