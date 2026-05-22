import { test } from '@playwright/test';
import { RegisterPage } from '../pages/register-page';
import { HomePage } from '../pages/home-page';
import { appendToExcel } from '../utils/excel-utils';

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

test.describe('Email Export to Excel', () => {
  const timestamp = Date.now();
  const email = `TestTestTest${timestamp}@gmail.com`;
  const password = 'Test@1234';
  const fullName = 'Mark Waugh';

  test('Register user and export email to Excel', async ({ page }) => {
    test.setTimeout(120_000);

    const registerPage = new RegisterPage(page);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await registerPage.clickRegisterLink();

    await registerPage.expectPageOpened();

    await registerPage.register(email, password);

    const homePage = new HomePage(page);
    await homePage.expectPageOpened(email);

    const excelPath = `test-data/registered-emails-${Date.now()}.xlsx`;
    appendToExcel(excelPath, {
      Timestamp: new Date().toISOString(),
      Email: email,
      FullName: fullName,
    });
  });
});
