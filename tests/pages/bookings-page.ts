import { Page, expect } from '@playwright/test';

export class BookingsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await this.page.locator('#nav-bookings').click();
    await this.page.waitForLoadState('networkidle');
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

  async clickCancelBooking(): Promise<void> {
    await this.page.locator('#cancel-booking-btn').click();
  }

  async confirmCancellation(): Promise<void> {
    //await this.page.locator('button:has-text("Yes, cancel it")').click();
    await this.page.locator('#confirm-dialog-yes').click();
    this.page.pause();
    await this.page.waitForLoadState('networkidle');
  }

  async expectNoBookings(): Promise<void> {
    await expect(this.page.locator('h3:has-text("No bookings yet")')).toBeVisible();
  }

  async clickLogout(): Promise<void> {
    await this.page.locator('#logout-btn').click();
    await this.page.waitForLoadState('networkidle');
  }
}
