import { Page, expect } from '@playwright/test';

export class BookingDetailPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async expectPageOpened(): Promise<void> {
    await expect(this.page).toHaveURL(/\/bookings\/\d+/);
  }

  async expectCustomerDetails(name: string, email: string, phone: string): Promise<void> {
    const customerSection = this.page.locator('h2').filter({ hasText: 'Customer Details' }).locator('..');
    await expect(customerSection).toContainText(name);
    await expect(customerSection).toContainText(email.toLowerCase());
    await expect(customerSection).toContainText(phone);
  }

  async expectTotalPaid(amount: string): Promise<void> {
    const totalRow = this.page.locator('div').filter({ hasText: 'Total Paid' }).filter({ has: this.page.locator('span.text-indigo-700') });
    await expect(totalRow.locator('span.text-indigo-700')).toContainText(amount);
  }
}
