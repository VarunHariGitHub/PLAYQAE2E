import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.rediff.com';

test.describe('Rediff Sign In Flow', () => {
  test('Verify Rediff homepage title, navigate to Rediffmail, and verify Sign In locators', async ({ page }) => {
    test.setTimeout(60_000);

    // Step 1: Navigate to Rediff.com and verify title
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(
      'Rediff.com: News | Rediffmail | Stock Quotes | Rediff Gurus'
    );

    // Step 2: Click Rediffmail link in the top navigation
    await page.getByRole('link', { name: 'Rediffmail', exact: true }).click();
    await page.waitForLoadState('networkidle');

    // Step 3: Verify we're on the Rediffmail login page
    await expect(page).toHaveURL(/\/cgi-bin\/login\.cgi/);
    await expect(page).toHaveTitle('Rediffmail - Free Email for Login with Secure Access');

    // Step 4: Verify Sign In locators are present
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get a new Rediffmail ID' })).toBeVisible();
  });
});
