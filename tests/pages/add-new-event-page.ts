import { Page, Locator, expect } from '@playwright/test';

export class AddNewEventPage {
  readonly page: Page;
  readonly addNewEventLink: Locator;
  readonly limitMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addNewEventLink = page.locator('a:has-text("Add New Event")');
    this.limitMessage = page.locator('text=You can add up to 6 events');
  }

  async clickAddNewEvent(): Promise<void> {
    await this.addNewEventLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectPageOpened(): Promise<void> {
    await expect(this.page).toHaveURL(/\/admin\/events/);
    await expect(this.limitMessage).toBeVisible();
  }

  async expectLimitMessageVisible(): Promise<void> {
    await expect(this.limitMessage.first()).toBeVisible();
    await expect(this.limitMessage.first()).toContainText(
      'oldest event is automatically replaced'
    );
  }
}
