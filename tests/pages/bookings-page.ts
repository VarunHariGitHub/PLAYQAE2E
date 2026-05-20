import { Page, Locator, expect } from '@playwright/test';

export class BookingsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async expectPageOpened(): Promise<void> {
    await expect(this.page).toHaveURL(/\/bookings$/);
  }

  async expectBookingVisible(bookingRef: string, eventName: string, tickets: string, total: string): Promise<void> {
    const card = this.page.locator('#booking-card');
    await expect(card).toBeVisible();
    await expect(card).toContainText(bookingRef);
    await expect(card).toContainText(eventName);
    await expect(card).toContainText(tickets);
    await expect(card).toContainText(total);
  }

  async clickViewDetailsForBooking(bookingRef: string): Promise<void> {
    const card = this.page.locator('#booking-card').filter({ hasText: bookingRef });
    await card.locator('a:has-text("View Details")').click();
    await this.page.waitForLoadState('networkidle');
  }
}
