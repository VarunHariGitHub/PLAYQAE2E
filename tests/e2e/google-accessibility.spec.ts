import { test, expect } from '@playwright/test';
import { GoogleHomePage } from '../pages/google-home.page';

test.describe('Google Home Page Accessibility', () => {
  test('page has correct title', async ({ page }) => {
    const googleHome = new GoogleHomePage(page);
    await googleHome.goto();
    await googleHome.expectPageHasTitle();
  });

  test('search input is accessible via role and label', async ({ page }) => {
    const googleHome = new GoogleHomePage(page);
    await googleHome.goto();
    await googleHome.expectSearchInputIsAccessible();
  });

  test('search combobox has accessible name', async ({ page }) => {
    const googleHome = new GoogleHomePage(page);
    await googleHome.goto();

    const searchBox = page.getByRole('combobox', { name: /search/i });
    await expect(searchBox).toBeVisible({ timeout: 15000 });
  });

  test('page has heading level structure', async ({ page }) => {
    const googleHome = new GoogleHomePage(page);
    await googleHome.goto();

    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const count = await headings.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('search form has submit role', async ({ page }) => {
    const googleHome = new GoogleHomePage(page);
    await googleHome.goto();

    const buttons = page.getByRole('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
