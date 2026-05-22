import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/register-page';
import { HomePage } from '../pages/home-page';
import { AdminEventsPage } from '../pages/admin-events-page';
import { BookingsPage } from '../pages/bookings-page';

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

test.describe('Admin Events CRUD Flow', () => {
  const timestamp = Date.now();
  const email = `AdminTest${timestamp}@gmail.com`;
  const password = 'Test@1234';
  const eventTitle = `CRUD Test Event ${timestamp}`;
  const updatedTitle = `CRUD Updated ${timestamp}`;
  const eventData = {
    title: eventTitle,
    description: 'Auto-generated test event for CRUD validation',
    category: 'Workshop',
    city: 'Test City',
    venue: 'Test Venue',
    dateTime: '2026-07-15T14:00',
    price: '250',
    totalSeats: '100',
  };
  const updatedEventData = {
    title: updatedTitle,
    description: 'Updated description for CRUD test',
    category: 'Conference',
    city: 'Updated City',
    venue: 'Updated Venue',
    dateTime: '2026-08-20T09:30',
    price: '350',
    totalSeats: '75',
  };

  test('Complete admin events CRUD flow', async ({ page }) => {
    test.setTimeout(120_000);

    // Step 1: Register a new user
    const registerPage = new RegisterPage(page);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await registerPage.clickRegisterLink();
    await registerPage.expectPageOpened();
    await registerPage.register(email, password);

    // Verify we're on the home page (registration succeeded)
    const homePage = new HomePage(page);
    await homePage.expectPageOpened(email);

    // Step 2: Navigate to Admin Events page
    const adminPage = new AdminEventsPage(page);
    await adminPage.goto();
    await adminPage.expectPageOpened();

    // Step 3: CREATE — Fill form and submit new event
    await adminPage.fillEventForm(eventData);
    await adminPage.clickSubmit();

    // Step 4: Verify event appears in the table
    await adminPage.expectEventInTable(eventTitle);

    // Step 5: UPDATE — Click Edit, verify form is pre-filled
    await adminPage.clickEditForEvent(eventTitle);
    const prefilledTitle = await adminPage.getEventTitleValue();
    expect(prefilledTitle).toBe(eventTitle);
    expect(await adminPage.isEditMode()).toBe(true);

    // Step 6: Modify event details and submit update
    await adminPage.fillEventForm(updatedEventData);
    await adminPage.clickSubmit();

    // Step 7: Verify updated event appears; old title is gone
    await adminPage.expectEventInTable(updatedTitle);
    await adminPage.expectEventNotInTable(eventTitle);

    // Step 8: DELETE — Click Delete and confirm
    await adminPage.clickDeleteForEvent(updatedTitle);
    await adminPage.confirmDelete();

    // Step 9: Verify event is removed from the table
    await adminPage.expectEventNotInTable(updatedTitle);

    // Step 10: Logout
    const bookingsPage = new BookingsPage(page);
    await bookingsPage.clickLogout();

    // Step 11: Verify login page appears
    await expect(page).toHaveURL(/\/login/);
  });
});
