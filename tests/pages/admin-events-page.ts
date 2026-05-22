import { Page, Locator, expect } from '@playwright/test';

export class AdminEventsPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly categorySelect: Locator;
  readonly cityInput: Locator;
  readonly venueInput: Locator;
  readonly dateTimeInput: Locator;
  readonly priceInput: Locator;
  readonly totalSeatsInput: Locator;
  readonly imageUrlInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.locator('#event-title-input');
    this.descriptionTextarea = page.locator('textarea[placeholder="Describe the event…"]');
    this.categorySelect = page.locator('#category');
    this.cityInput = page.locator('#city');
    this.venueInput = page.locator('#venue');
    this.dateTimeInput = page.locator('input[type="datetime-local"]');
    this.priceInput = page.locator('input[id="price-($)"]');
    this.totalSeatsInput = page.locator('#total-seats');
    this.imageUrlInput = page.locator('#image-url-\\(optional\\)');
    this.submitButton = page.locator('#add-event-btn');
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin/events', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle');
  }

  async expectPageOpened(): Promise<void> {
    await expect(this.page).toHaveURL(/\/admin\/events/);
    await expect(this.submitButton).toBeVisible();
  }

  async fillEventForm(data: {
    title: string;
    description?: string;
    category: string;
    city: string;
    venue: string;
    dateTime: string;
    price: string;
    totalSeats: string;
    imageUrl?: string;
  }): Promise<void> {
    await this.titleInput.fill(data.title);
    if (data.description) {
      await this.descriptionTextarea.fill(data.description);
    }
    await this.categorySelect.selectOption(data.category);
    await this.cityInput.fill(data.city);
    await this.venueInput.fill(data.venue);
    await this.dateTimeInput.fill(data.dateTime);
    await this.priceInput.fill(data.price);
    await this.totalSeatsInput.fill(data.totalSeats);
    if (data.imageUrl) {
      await this.imageUrlInput.fill(data.imageUrl);
    }
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  private eventRows() {
    return this.page.locator('table tbody tr');
  }

  async expectEventInTable(title: string): Promise<void> {
    await expect(this.page.locator('table').filter({ hasText: title })).toBeVisible();
  }

  async expectEventNotInTable(title: string): Promise<void> {
    const rows = this.eventRows();
    const rowCount = await rows.count();
    let found = false;
    for (let i = 0; i < rowCount; i++) {
      const rowText = await rows.nth(i).textContent();
      if (rowText?.includes(title)) {
        found = true;
        break;
      }
    }
    expect(found).toBe(false);
  }

  async clickEditForEvent(title: string): Promise<void> {
    const row = this.page.locator('table tbody tr').filter({ hasText: title });
    await row.locator('[data-testid="edit-event-btn"]').click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickDeleteForEvent(title: string): Promise<void> {
    const row = this.page.locator('table tbody tr').filter({ hasText: title });
    await row.locator('[data-testid="delete-event-btn"]').click();
    await this.page.waitForLoadState('networkidle');
  }

  async confirmDelete(): Promise<void> {
    await this.page.locator('button:has-text("Delete event")').click();
    await this.page.waitForLoadState('networkidle');
  }

  async getEventTitleValue(): Promise<string> {
    return (await this.titleInput.inputValue()) || '';
  }

  async isEditMode(): Promise<boolean> {
    const buttonText = await this.submitButton.textContent();
    return buttonText?.includes('Update') || false;
  }

  async clickCancelEdit(): Promise<void> {
    await this.page.locator('button:has-text("Cancel edit")').click();
    await this.page.waitForLoadState('networkidle');
  }
}
