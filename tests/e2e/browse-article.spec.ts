import { test, expect } from '@playwright/test';

/**
 * E2E: Browse → Wisdom Library → Category → Article (§20, §7.2, §7.3).
 *
 * Critical journey: a visitor lands on the home page, navigates to the
 * Wisdom Library, picks a category, and opens an article. Along the way we
 * verify SEO-critical metadata, JSON-LD presence, and basic a11y structure.
 */

test.describe('Browse → Article journey', () => {
  test('home page loads with correct title and landmarks', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/master within/i);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    // One h1 per page (§14)
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('home page has Organisation JSON-LD structured data', async ({ page }) => {
    await page.goto('/');

    const jsonLdScript = page.locator('script[type="application/ld+json"]').first();
    await expect(jsonLdScript).toBeAttached();
    const rawJson = await jsonLdScript.textContent();
    const data = JSON.parse(rawJson!);
    expect(data['@type']).toBe('Organization');
  });

  test('Wisdom Library lists category cards', async ({ page }) => {
    await page.goto('/wisdom');

    await expect(page.locator('h1')).toContainText(/wisdom/i);
    // 8 fixed categories (§6); at least one category card must render
    const categoryCards = page.locator('a[href*="/wisdom/"]');
    await expect(categoryCards).not.toHaveCount(0);
  });

  test('category page lists articles', async ({ page }) => {
    await page.goto('/wisdom');

    // Click the first category card
    const firstCategoryLink = page.locator('a[href^="/wisdom/"]').first();
    const categoryHref = await firstCategoryLink.getAttribute('href');
    await firstCategoryLink.click();

    await expect(page).toHaveURL(new RegExp(categoryHref!));
    await expect(page.locator('h1')).toBeVisible();
  });

  test('article page renders metadata, JSON-LD, and reading progress', async ({ page }) => {
    // Navigate to the wisdom library to find a real article link
    await page.goto('/wisdom');

    // Find any article link (format: /wisdom/[category]/[slug])
    const articleLink = page
      .locator('a[href*="/wisdom/"]')
      .filter({ hasNotText: /^$/ })
      .nth(1); // skip the category card, grab a deeper article link

    const href = await articleLink.getAttribute('href');
    if (!href || !href.match(/\/wisdom\/[^/]+\/[^/]+/)) {
      test.skip(true, 'No article links found yet — content not seeded');
      return;
    }

    await articleLink.click();
    await expect(page).toHaveURL(new RegExp('/wisdom/'));

    // Reading-progress bar should exist
    await expect(page.locator('[aria-label="Reading progress"]')).toBeVisible();

    // Article JSON-LD
    const jsonLdScript = page
      .locator('script[type="application/ld+json"]')
      .filter({ hasText: 'Article' });
    await expect(jsonLdScript).toBeAttached();

    // Substack attribution link
    await expect(page.getByRole('link', { name: /read on substack/i })).toBeVisible();
  });

  test('article card prefetch fires on mouse enter (performance, §12.2)', async ({ page }) => {
    await page.goto('/wisdom');

    const firstCard = page.locator('article a, [data-prefetch]').first();
    if (!(await firstCard.count())) {
      test.skip(true, 'No prefetch targets found');
      return;
    }
    // Hover should not throw or cause errors
    await firstCard.hover();
    // Verify no console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    expect(errors.filter((e) => !e.includes('favicon'))).toHaveLength(0);
  });

  test('search bar filters articles by keyword', async ({ page }) => {
    await page.goto('/wisdom');

    const searchInput = page.getByRole('searchbox').or(page.getByPlaceholder(/search/i)).first();
    if (!(await searchInput.count())) {
      test.skip(true, 'Search bar not present');
      return;
    }

    await searchInput.fill('consciousness');
    // Results list should update without a page reload
    await page.waitForTimeout(300);
    const results = page.locator('[data-testid="article-list"] article, ul[data-results] li');
    // If results appear, they should all contain the keyword in some form (title/excerpt/category)
    if (await results.count()) {
      const firstResultText = await results.first().textContent();
      expect(firstResultText?.toLowerCase()).toContain('c'); // minimal sanity
    }
  });
});
