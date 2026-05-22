import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/register-page';
import { HomePage } from '../pages/home-page';
import { EventsPage } from '../pages/events-page';
import { EventDetailPage } from '../pages/event-detail-page';
import { BookingsPage } from '../pages/bookings-page';
import { BookingDetailPage } from '../pages/booking-detail-page';
import { appendToExcel } from '../utils/excel-utils';

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

test.describe('Event Booking E2E Flow', () => {
  const timestamp = Date.now();
  const email = `TestTestTest${timestamp}@gmail.com`;
  const password = 'Test@1234';
  const fullName = 'Mark Waugh';
  const phone = '7778889992';
  const eventName = 'Hollywood Monsoon Night — Los Angeles';
  const expectedLocation = 'Dome, NSCI SVP Stadium, Worli, Los Angeles';
  const expectedDescription = 'An unforgettable evening of live music performed by A-list playback singers under the open Mumbai sky. Featuring chart-toppers from the last three decades with a stunning light show and pyrotechnics.';

  test('Complete E2E booking flow', async ({ page }) => {
    test.setTimeout(120_000);

    const runTimestamp = new Date().toISOString();
    let ticketCount = 0;
    let totalPrice = '';
    let bookingRef = '';
    let cancelled = false;
    let testResult = 'Pass';
    let errorMessage = '';

    try {
      // Step 1: Navigate to login page and click Register
      const registerPage = new RegisterPage(page);
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      await registerPage.clickRegisterLink();

      // Step 2: Verify Register page opens
      await registerPage.expectPageOpened();

      // Step 3-4: Fill registration and create account
      await registerPage.register(email, password);

      // Step 5: Verify Home Page opens
      const homePage = new HomePage(page);
      await homePage.expectPageOpened(email);

      // Step 6: Click on Events Tab
      await homePage.clickEventsTab();

      // Step 7: Get all events and find Hollywood Monsoon Night
      const eventsPage = new EventsPage(page);
      await eventsPage.expectPageOpened();

      const eventNames = await eventsPage.getEventNames();
      expect(eventNames).toContain(eventName);

      // Step 8: Validate location
      await eventsPage.scrollToEvent(eventName);
      await eventsPage.expectLocationForEvent(eventName, expectedLocation);

      // Step 9-10: Click Book Now and wait for detail page
      await eventsPage.clickBookNowForEvent(eventName);

      const eventDetailPage = new EventDetailPage(page);
      await eventDetailPage.expectPageOpened();
      await eventDetailPage.expectEventNameVisible(eventName);

      // Step 11: Validate available seats
      await eventDetailPage.expectAvailableSeats();

      // Step 12: Validate description
      await eventDetailPage.expectDescriptionVisible();

      // Step 13: Select 2 tickets
      const initialCount = await eventDetailPage.getTicketCount();
      const clicksNeeded = Math.max(0, 2 - initialCount);
      if (clicksNeeded > 0) {
        await eventDetailPage.increaseTickets(clicksNeeded);
      }
      ticketCount = await eventDetailPage.getTicketCount();
      expect(ticketCount).toBe(2);

      // Step 14: Validate price is $5000 for 2 tickets
      totalPrice = await eventDetailPage.getTotalPrice();
      expect(totalPrice).toContain('5,000');

      // Step 15: Enter booking details and check required fields
      await eventDetailPage.expectAllFieldsRequired();
      await eventDetailPage.fillBookingForm(fullName, email, phone);

      // Step 16: Click Confirm Booking
      await eventDetailPage.clickConfirmBooking();

      // Step 17: Validate Booking Confirmation with details
      await eventDetailPage.expectConfirmationDetails(fullName, '2', '5,000');
      bookingRef = await eventDetailPage.getBookingReference();
      expect(bookingRef.length).toBeGreaterThan(0);

      // Step 18: Click View My Bookings
      await eventDetailPage.clickViewMyBookings();

      // Step 19: Verify My Bookings page with matching info
      const bookingsPage = new BookingsPage(page);
      await bookingsPage.expectPageOpened();
      await bookingsPage.expectBookingVisible(bookingRef, eventName, '2 tickets', '5,000');

      // Step 20: Click View Details
      await bookingsPage.clickViewDetailsForBooking(bookingRef);

      // Step 21: Validate booking details
      const bookingDetailPage = new BookingDetailPage(page);
      await bookingDetailPage.expectPageOpened();
      await bookingDetailPage.expectCustomerDetails(fullName, email, phone);
      await bookingDetailPage.expectTotalPaid('5,000');

      // Step 22: Go back to My Bookings and cancel the booking
      await bookingsPage.goto();
      await bookingsPage.expectPageOpened();
      await bookingsPage.clickCancelBooking();

      // Step 23: Confirm cancellation on the dialog
      await bookingsPage.confirmCancellation();
      cancelled = true;

      // Step 24: Verify no bookings remain
      await bookingsPage.expectNoBookings();

      // Step 25: Click Logout
      await bookingsPage.clickLogout();

      // Step 26: Verify login page appears
      await expect(page).toHaveURL(/\/login/);
    } catch (err) {
      testResult = 'Fail';
      errorMessage = err instanceof Error ? err.message : String(err);
      test.info().annotations.push({ type: 'error', description: errorMessage });
      throw err;
    } finally {
      const excelPath = `test-data/booking-data-${Date.now()}.xlsx`;
      appendToExcel(excelPath, {
        RunTimestamp: runTimestamp,
        Email: email,
        FullName: fullName,
        Phone: phone,
        EventName: eventName,
        TicketsBooked: ticketCount,
        TotalPrice: totalPrice,
        BookingReference: bookingRef,
        BookingConfirmedAt: bookingRef ? new Date().toISOString() : '',
        Cancelled: cancelled ? 'Yes' : 'No',
        TestResult: testResult,
        ErrorMessage: errorMessage || 'N/A',
      }, 'BookingData');
    }
  });
});
