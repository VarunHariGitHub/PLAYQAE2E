import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/register-page';
import { HomePage } from '../pages/home-page';

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

test.describe('Register and Logout Sanity', () => {
  const timestamp = Date.now();
  const email = `TestTestTest${timestamp}@gmail.com`;
  const password = 'Test@1234';

  test('Register a new user and logout', async ({ page }) => {
    test.setTimeout(60_000);

    const registerPage = new RegisterPage(page);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await registerPage.clickRegisterLink();

    await registerPage.expectPageOpened();

    await registerPage.register(email, password);

    const homePage = new HomePage(page);
    await homePage.expectPageOpened(email);

    await homePage.clickLogout();

    await expect(page).toHaveURL(/\/login/);
  });
});
