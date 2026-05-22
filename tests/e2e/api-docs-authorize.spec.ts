import { test, expect } from '@playwright/test';
import { ApiDocsPage } from '../pages/api-docs-page';
import { appendToExcel } from '../utils/excel-utils';

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

test.describe('API Docs - Swagger UI Authorization', () => {
  const apiKey = `TestApiKey${Date.now()}`;

  test('Open API Docs, authorize with random key, verify Logout appears', async ({ page }) => {
    test.setTimeout(60_000);

    const runTimestamp = new Date().toISOString();
    let testResult = 'Pass';
    let errorMessage = '';

    try {
      // Step 1: Navigate to the homepage
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');

      // Step 2: Click on "API Documentation (Swagger)" link — opens in a new tab
      const [newPage] = await Promise.all([
        page.context().waitForEvent('page'),
        page.getByRole('link', { name: 'API Documentation (Swagger)' }).click(),
      ]);
      await newPage.waitForLoadState('networkidle');
      await newPage.waitForTimeout(1000);

      // Step 3: Verify the new page is the Swagger UI page
      const apiDocsPage = new ApiDocsPage(newPage);
      await apiDocsPage.expectPageOpened();

      // Step 4: Click on the "Authorize" button
      await apiDocsPage.clickAuthorize();

      // Step 5: Verify auth dialog appears
      await apiDocsPage.expectAuthDialogVisible();

      // Step 6: Enter a random value in the value textbox
      await apiDocsPage.fillAuthValue(apiKey);

      // Step 7: Click "Authorize" button inside the dialog
      await apiDocsPage.clickAuthorizeInDialog();

      // Step 8: Close the dialog
      await apiDocsPage.clickClose();

      // Step 9: Verify "Logout" button is displayed
      await apiDocsPage.expectLogoutVisible();

      testResult = 'Pass';
    } catch (err) {
      testResult = 'Fail';
      errorMessage = err instanceof Error ? err.message : String(err);
      test.info().annotations.push({ type: 'error', description: errorMessage });
      throw err;
    } finally {
      const excelPath = `test-data/api-docs-auth-${Date.now()}.xlsx`;
      appendToExcel(excelPath, {
        RunTimestamp: runTimestamp,
        ApiKey: apiKey,
        TestResult: testResult,
        ErrorMessage: errorMessage || 'N/A',
      }, 'ApiDocsAuth');
    }
  });
});
