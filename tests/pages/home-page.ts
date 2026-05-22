import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly userEmailDisplay: Locator;
  readonly eventsNavLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userEmailDisplay = page.locator('#user-email-display');
    this.eventsNavLink = page.locator('#nav-events');
  }

  async expectPageOpened(email: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/$/);
    await expect(this.userEmailDisplay).toHaveText(email);
  }

  async clickEventsTab(): Promise<void> {
    await this.eventsNavLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickLogout(): Promise<void> {
    await this.page.locator('#logout-btn').click();
    await this.page.waitForLoadState('networkidle');
  }
}
