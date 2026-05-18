import { test, expect } from '@playwright/test';

test('Open Google, search hello, validate first result', async ({ page }) => {
  await page.goto('https://www.google.com');

  await page.waitForSelector('textarea[name="q"]', { timeout: 15000 });
  const searchBox = page.locator('textarea[name="q"]');
  await searchBox.fill('hello');
  await searchBox.press('Enter');

  await page.waitForSelector('#search', { timeout: 15000 });

  const firstResult = page.locator('#search a').first();
  await expect(firstResult).toBeVisible({ timeout: 10000 });

  const href = await firstResult.getAttribute('href');
  expect(href).toBeTruthy();
  console.log(`First result URL: ${href}`);
});
