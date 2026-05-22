import { Page, Locator, expect } from '@playwright/test';

export class ApiDocsPage {
  readonly page: Page;
  readonly authorizeButton: Locator;
  readonly authValueInput: Locator;
  readonly authDialogAuthorizeButton: Locator;
  readonly authDialogCloseButton: Locator;
  readonly logoutButton: Locator;
  readonly authDialogHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.authorizeButton = page.locator('button:has-text("Authorize")');
    this.authValueInput = page.locator('#auth-bearer-value');
    this.authDialogAuthorizeButton = page.locator('button.btn.modal-btn.auth.authorize.button');
    this.authDialogCloseButton = page.locator('button.btn.modal-btn.auth.btn-done.button');
    this.logoutButton = page.locator('button[aria-label="Remove authorization"]');
    this.authDialogHeader = page.locator('h3:has-text("Available authorizations")');
  }

  async expectPageOpened(): Promise<void> {
    await expect(this.page).toHaveURL(/\/api\/docs\/?/);
    await expect(this.authorizeButton).toBeVisible();
  }

  async clickAuthorize(): Promise<void> {
    await this.authorizeButton.click();
    await this.page.waitForTimeout(1000);
  }

  async expectAuthDialogVisible(): Promise<void> {
    await expect(this.authDialogHeader).toBeVisible();
    await expect(this.authValueInput).toBeVisible();
  }

  async fillAuthValue(value: string): Promise<void> {
    await this.authValueInput.fill(value);
  }

  async clickAuthorizeInDialog(): Promise<void> {
    await this.authDialogAuthorizeButton.click();
    await this.page.waitForTimeout(1000);
  }

  async clickClose(): Promise<void> {
    await this.authDialogCloseButton.click();
    await this.page.waitForTimeout(1000);
  }

  async expectLogoutVisible(): Promise<void> {
    // Click Authorize again to open the authorized dialog showing Logout
    await this.authorizeButton.click();
    await this.page.waitForTimeout(1000);
    await expect(this.authDialogHeader).toBeVisible();
    await expect(this.logoutButton).toBeVisible();
  }
}
