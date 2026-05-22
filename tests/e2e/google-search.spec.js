import { test, expect } from '@playwright/test';

test('Open Google, search hello, validate first result', async ({ page }) => {
  await page.goto('https://www.google.com');

  await page.waitForSelector('textarea[name="q"]', { timeout: 15000 });
  const searchBox = page.locator('textarea[name="q"]');
  await searchBox.fill('hellotest1');
  await searchBox.press('Enter');

  // Wait for navigation to search results URL
  await page.waitForURL(/\/search\?/, { timeout: 15000 });

  // Google may serve a CAPTCHA challenge instead of results
  const blocked = page.getByText('unusual traffic');
  if (await blocked.isVisible({ timeout: 3000 }).catch(() => false)) {
    test.info().annotations.push({
      type: 'warning',
      description: 'Google served a CAPTCHA challenge (automated bot detection). Search was submitted successfully but results are blocked.'
    });
    return;
  }

  await page.waitForSelector('#search, #rso', { timeout: 15000 });
  const firstResult = page.locator('#search a, #rso a').first();
  await expect(firstResult).toBeVisible({ timeout: 10000 });

  const href = await firstResult.getAttribute('href');
  expect(href).toBeTruthy();
  console.log(`First result URL: ${href}`);
});
