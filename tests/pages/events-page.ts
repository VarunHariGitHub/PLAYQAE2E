import { Page, Locator, expect } from '@playwright/test';

export class EventsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async expectPageOpened(): Promise<void> {
    await expect(this.page).toHaveURL(/\/events/);
  }

  async getEventNames(): Promise<string[]> {
    await this.page.waitForSelector('article a[href*="/events/"] h3', { timeout: 15000 });
    const eventTitleElements = this.page.locator('article a[href*="/events/"] h3');
    const count = await eventTitleElements.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const name = await eventTitleElements.nth(i).textContent();
      if (name) names.push(name.trim());
    }
    return names;
  }

  async scrollToEvent(eventName: string): Promise<void> {
    const eventTitle = this.page.locator(`article:has-text("${eventName}")`).first();
    await eventTitle.scrollIntoViewIfNeeded();
  }

  async expectLocationForEvent(eventName: string, expectedLocation: string): Promise<void> {
    const eventCard = this.page.locator('article').filter({ hasText: eventName });
    await expect(eventCard).toBeVisible();
    await expect(eventCard).toContainText(expectedLocation);
  }

  async clickBookNowForEvent(eventName: string): Promise<void> {
    const eventCard = this.page.locator('article').filter({ hasText: eventName });
    const bookNowButton = eventCard.locator('[data-testid="book-now-btn"]');
    await bookNowButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
