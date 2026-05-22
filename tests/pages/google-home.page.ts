import { Page, Locator, expect } from '@playwright/test';

export class GoogleHomePage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly acceptAllButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByRole('combobox', { name: /search/i });
    this.acceptAllButton = page.getByRole('button', { name: /accept all/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle');
  }

  async acceptCookiesIfVisible(): Promise<void> {
    if (await this.acceptAllButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.acceptAllButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async getAccessibilitySnapshot(): Promise<object | null> {
    if (!this.page.accessibility) return null;
    return this.page.accessibility.snapshot();
  }

  async expectPageHasTitle(): Promise<void> {
    await expect(this.page).toHaveTitle(/google/i);
  }

  async expectSearchInputIsAccessible(): Promise<void> {
    await expect(this.searchInput).toBeVisible({ timeout: 15000 });
    await expect(this.searchInput).toBeEnabled();
    const role = await this.searchInput.getAttribute('role');
    expect(role).toBe('combobox');
    const label = await this.searchInput.getAttribute('aria-label');
    expect(label?.toLowerCase()).toContain('search');
  }
}
