import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/register-page';
import { HomePage } from '../pages/home-page';
import { AddNewEventPage } from '../pages/add-new-event-page';

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

test.describe('Add New Event Flow', () => {
  const timestamp = Date.now();
  const email = `AddNewEventTest${timestamp}@gmail.com`;
  const password = 'Test@1234';

  test('Register, navigate to events, click Add New Event, and verify limit message', async ({ page }) => {
    test.setTimeout(120_000);

    // Step 1: Register a new user
    const registerPage = new RegisterPage(page);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await registerPage.clickRegisterLink();
    await registerPage.expectPageOpened();
    await registerPage.register(email, password);

    // Step 2: Verify we're on the home page (registration succeeded)
    const homePage = new HomePage(page);
    await homePage.expectPageOpened(email);

    // Step 3: Navigate to Events page by clicking the Events tab
    await homePage.clickEventsTab();

    // Step 4: Click "Add New Event" link on the events listing page
    const addNewEventPage = new AddNewEventPage(page);
    await addNewEventPage.clickAddNewEvent();
    await addNewEventPage.expectPageOpened();

    // Step 5: Verify the limit message is displayed
    await addNewEventPage.expectLimitMessageVisible();

    // Step 6: Logout
    await homePage.clickLogout();

    // Step 7: Verify redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });
});
