import { Page, Locator, expect } from '@playwright/test';

export class EventDetailPage {
  readonly page: Page;
  readonly ticketCount: Locator;
  readonly ticketPlusButton: Locator;
  readonly ticketMinusButton: Locator;
  readonly customerNameInput: Locator;
  readonly customerEmailInput: Locator;
  readonly phoneInput: Locator;
  readonly confirmBookingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.ticketCount = page.locator('#ticket-count');
    this.ticketPlusButton = page.locator('button:has-text("+")').first();
    this.ticketMinusButton = page.locator('button:has-text("−")').first();
    this.customerNameInput = page.locator('#customerName');
    this.customerEmailInput = page.locator('#customer-email');
    this.phoneInput = page.locator('#phone');
    this.confirmBookingButton = page.locator('#confirm-booking');
  }

  async expectPageOpened(): Promise<void> {
    await expect(this.page).toHaveURL(/\/events\/\d+/);
  }

  async expectEventNameVisible(eventName: string): Promise<void> {
    await expect(this.page.locator('h1')).toContainText(eventName);
  }

  async expectAvailableSeats(): Promise<void> {
    await expect(this.page.locator('text=/\\d+ \\/ \\d+ seats/')).toBeVisible();
  }

  async expectDescriptionVisible(): Promise<void> {
    const description = "An unforgettable evening of live music performed by A-list playback singers under the open Mumbai sky. Featuring chart-toppers from the last three decades with a stunning light show and pyrotechnics.";
    await expect(this.page.locator('h2:has-text("About this event") + p')).toContainText(description);
  }

  async increaseTickets(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.ticketPlusButton.click();
      await this.page.waitForTimeout(300);
    }
  }

  async getTicketCount(): Promise<number> {
    const text = await this.ticketCount.textContent();
    return parseInt(text || '0', 10);
  }

  async getTotalPrice(): Promise<string> {
    const totalRow = this.page.locator('div.font-bold').filter({ hasText: 'Total' });
    const priceElement = totalRow.locator('span.text-indigo-700');
    return (await priceElement.textContent()) || '';
  }

  async fillBookingForm(name: string, email: string, phone: string): Promise<void> {
    await this.customerNameInput.fill(name);
    await this.customerEmailInput.fill(email);
    await this.phoneInput.fill(phone);
  }

  async expectAllFieldsRequired(): Promise<void> {
    await expect(this.customerNameInput).toHaveAttribute('required', '');
    const emailRequired = await this.customerEmailInput.getAttribute('required');
    expect(emailRequired).not.toBeNull();
    const phoneRequired = await this.phoneInput.getAttribute('required');
    expect(phoneRequired).not.toBeNull();
  }

  async clickConfirmBooking(): Promise<void> {
    await this.confirmBookingButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectConfirmationDetails(name: string, tickets: string, total: string): Promise<void> {
    const confirmationBox = this.page.locator('.bg-indigo-50.border-indigo-100');
    await expect(this.page.locator('h3:has-text("Booking Confirmed")')).toBeVisible();
    await expect(confirmationBox).toContainText('Booking Ref');
    await expect(confirmationBox).toContainText(name);
    await expect(confirmationBox).toContainText(tickets);
    await expect(confirmationBox).toContainText(total);
  }

  async getBookingReference(): Promise<string> {
    const refElement = this.page.locator('.booking-ref');
    return (await refElement.textContent()) || '';
  }

  async clickViewMyBookings(): Promise<void> {
    await this.page.locator('button:has-text("View My Bookings")').click();
    await this.page.waitForLoadState('networkidle');
  }
}
