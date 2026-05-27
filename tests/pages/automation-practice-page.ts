import { Page, Locator, expect } from '@playwright/test';

export class AutomationPracticePage {
  readonly page: Page;

  // Radio Button Example
  readonly radioButtons: Locator;

  // Suggestion Class Example
  readonly suggestionInput: Locator;

  // Dropdown Example
  readonly dropdown: Locator;

  // Checkbox Example
  readonly checkboxOption1: Locator;
  readonly checkboxOption2: Locator;
  readonly checkboxOption3: Locator;

  // Switch Window Example
  readonly openWindowButton: Locator;

  // Switch Tab Example
  readonly openTabLink: Locator;

  // Switch To Alert Example
  readonly alertNameInput: Locator;
  readonly alertButton: Locator;
  readonly confirmButton: Locator;

  // Web Table Example (courses)
  readonly webTable: Locator;

  // Element Displayed Example
  readonly displayedTextbox: Locator;
  readonly hideButton: Locator;
  readonly showButton: Locator;

  // Web Table Fixed header (employees)
  readonly fixedTable: Locator;
  readonly totalAmount: Locator;

  // Mouse Hover Example
  readonly mouseHoverButton: Locator;

  // iFrame Example
  readonly coursesIframe: Locator;

  constructor(page: Page) {
    this.page = page;

    // Radio Button Example
    this.radioButtons = page.locator('input[type="radio"]');

    // Suggestion Class Example
    this.suggestionInput = page.locator('#autocomplete');

    // Dropdown Example
    this.dropdown = page.locator('#dropdown-class-example');

    // Checkbox Example
    this.checkboxOption1 = page.locator('#checkBoxOption1');
    this.checkboxOption2 = page.locator('#checkBoxOption2');
    this.checkboxOption3 = page.locator('#checkBoxOption3');

    // Switch Window Example
    this.openWindowButton = page.locator('#openwindow');

    // Switch Tab Example
    this.openTabLink = page.locator('#opentab');

    // Switch To Alert Example
    this.alertNameInput = page.locator('#name');
    this.alertButton = page.locator('#alertbtn');
    this.confirmButton = page.locator('#confirmbtn');

    // Web Table Example (courses)
    this.webTable = page.locator('table#product').first();

    // Element Displayed Example
    this.displayedTextbox = page.locator('#displayed-text');
    this.hideButton = page.locator('#hide-textbox');
    this.showButton = page.locator('#show-textbox');

    // Web Table Fixed header (employees)
    this.fixedTable = page.locator('table#product').nth(1);
    this.totalAmount = page.locator('.totalAmount');

    // Mouse Hover Example
    this.mouseHoverButton = page.locator('#mousehover');

    // iFrame Example
    this.coursesIframe = page.locator('#courses-iframe');
  }

  async goto(): Promise<void> {
    await this.page.goto('https://rahulshettyacademy.com/AutomationPractice/', { waitUntil: 'domcontentloaded' });
  }

  async expectPageOpened(): Promise<void> {
    await expect(this.page).toHaveURL(/\/AutomationPractice\//);
  }

  // ---------- Radio Button Example ----------

  async selectRadioButton(value: string): Promise<void> {
    await this.page.locator(`input[value="${value}"]`).click();
  }

  async expectRadioButtonSelected(value: string): Promise<void> {
    await expect(this.page.locator(`input[value="${value}"]`)).toBeChecked();
  }

  async expectRadioButtonNotSelected(value: string): Promise<void> {
    await expect(this.page.locator(`input[value="${value}"]`)).not.toBeChecked();
  }

  // ---------- Suggestion Class Example ----------

  async typeSuggestion(text: string): Promise<void> {
    await this.suggestionInput.pressSequentially(text, { delay: 100 });
    await this.page.locator('.ui-autocomplete').waitFor({ state: 'visible', timeout: 5000 });
  }

  async selectSuggestion(suggestionText: string): Promise<void> {
    await this.page.getByText(suggestionText, { exact: true }).waitFor({ state: 'visible', timeout: 5000 });
    await this.page.getByText(suggestionText, { exact: true }).click();
  }

  async expectSuggestionInputValue(value: string): Promise<void> {
    await expect(this.suggestionInput).toHaveValue(value);
  }

  // ---------- Dropdown Example ----------

  async selectDropdownOption(text: string): Promise<void> {
    await this.dropdown.selectOption(text);
  }

  async expectDropdownSelectedValue(value: string): Promise<void> {
    await expect(this.dropdown).toHaveValue(value);
  }

  // ---------- Checkbox Example ----------

  async checkCheckbox(index: number): Promise<void> {
    const checkbox = this.getCheckboxByIndex(index);
    await checkbox.check();
  }

  async uncheckCheckbox(index: number): Promise<void> {
    const checkbox = this.getCheckboxByIndex(index);
    await checkbox.uncheck();
  }

  async expectCheckboxChecked(index: number): Promise<void> {
    await expect(this.getCheckboxByIndex(index)).toBeChecked();
  }

  async expectCheckboxNotChecked(index: number): Promise<void> {
    await expect(this.getCheckboxByIndex(index)).not.toBeChecked();
  }

  private getCheckboxByIndex(index: number): Locator {
    const checkboxes = [this.checkboxOption1, this.checkboxOption2, this.checkboxOption3];
    if (index < 1 || index > 3) {
      throw new Error(`Checkbox index must be 1, 2, or 3. Got: ${index}`);
    }
    return checkboxes[index - 1];
  }

  // ---------- Switch Window Example ----------

  async clickOpenWindow(): Promise<Page> {
    const [newWindow] = await Promise.all([
      this.page.waitForEvent('popup'),
      this.openWindowButton.click(),
    ]);
    await newWindow.waitForLoadState('domcontentloaded');
    await expect(newWindow).toHaveURL(/qaclickacademy/);
    return newWindow;
  }

  // ---------- Switch Tab Example ----------

  async clickOpenTab(): Promise<Page> {
    const [newTab] = await Promise.all([
      this.page.waitForEvent('popup'),
      this.openTabLink.click(),
    ]);
    await newTab.waitForLoadState('domcontentloaded');
    await expect(newTab).toHaveURL(/qaclickacademy/);
    return newTab;
  }

  // ---------- Switch To Alert Example ----------

  async triggerAlert(text: string): Promise<string> {
    await this.alertNameInput.fill(text);
    const dialogPromise = new Promise<{ message: string; accept: () => void }>((resolve) => {
      this.page.once('dialog', (dialog) => {
        resolve({ message: dialog.message(), accept: () => dialog.accept() });
      });
    });
    await this.page.evaluate(() => {
      setTimeout(() => (document.getElementById('alertbtn') as HTMLElement)?.click(), 50);
    });
    const result = await dialogPromise;
    result.accept();
    return result.message;
  }

  async triggerConfirm(text: string, accept: boolean = true): Promise<string> {
    await this.alertNameInput.fill(text);
    const dialogPromise = new Promise<{ message: string }>((resolve) => {
      this.page.once('dialog', (dialog) => {
        const message = dialog.message();
        if (accept) {
          dialog.accept();
        } else {
          dialog.dismiss();
        }
        resolve({ message });
      });
    });
    await this.page.evaluate(() => {
      setTimeout(() => (document.getElementById('confirmbtn') as HTMLElement)?.click(), 50);
    });
    const result = await dialogPromise;
    return result.message;
  }

  // ---------- Web Table Example ----------

  async getWebTableData(): Promise<string[][]> {
    return this.page.evaluate(() => {
      const tables = document.querySelectorAll('table#product');
      const table = tables[0];
      if (!table) return [];
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      return rows.map((row) =>
        Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent?.trim() ?? ''),
      );
    });
  }

  async expectCourseExists(instructor: string, course: string): Promise<void> {
    const data = await this.getWebTableData();
    const match = data.some(
      (row) => row[0]?.includes(instructor) && row[1]?.includes(course),
    );
    expect(match).toBeTruthy();
  }

  // ---------- Element Displayed Example ----------

  async typeIntoDisplayedTextbox(text: string): Promise<void> {
    await this.displayedTextbox.fill(text);
  }

  async hideElement(): Promise<void> {
    await this.hideButton.click();
  }

  async showElement(): Promise<void> {
    await this.showButton.click();
  }

  async expectDisplayedTextboxVisible(): Promise<void> {
    await expect(this.displayedTextbox).toBeVisible();
  }

  async expectDisplayedTextboxHidden(): Promise<void> {
    await expect(this.displayedTextbox).toBeHidden();
  }

  // ---------- Web Table Fixed header ----------

  async getFixedTableData(): Promise<string[][]> {
    return this.page.evaluate(() => {
      const tables = document.querySelectorAll('table#product');
      const table = tables[1]; // second table is fixed header
      if (!table) return [];
      const rows = Array.from(table.querySelectorAll('tr')).slice(1); // skip header row
      return rows.map((row) =>
        Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent?.trim() ?? ''),
      );
    });
  }

  async getFixedTableHeaders(): Promise<string[]> {
    return this.page.evaluate(() => {
      const tables = document.querySelectorAll('table#product');
      const table = tables[1];
      if (!table) return [];
      const headerRow = table.querySelector('thead tr');
      if (!headerRow) return [];
      return Array.from(headerRow.querySelectorAll('th')).map((cell) =>
        cell.textContent?.trim() ?? '',
      );
    });
  }

  async getTotalAmount(): Promise<string> {
    return (await this.totalAmount.textContent()) ?? '';
  }

  // ---------- Mouse Hover Example ----------

  async hoverMouse(): Promise<void> {
    await this.mouseHoverButton.hover();
  }

  async clickHoverTopLink(): Promise<void> {
    await this.page.locator('a[href="#top"]').click();
  }

  async clickHoverReloadLink(): Promise<void> {
    await this.page.locator('.mouse-hover-content a').nth(1).click();
  }

  async expectHoverTopLinkVisible(): Promise<void> {
    await expect(this.page.locator('a[href="#top"]')).toBeVisible();
  }

  async expectHoverReloadLinkVisible(): Promise<void> {
    await expect(this.page.locator('.mouse-hover-content a').nth(1)).toBeVisible();
  }

  // ---------- iFrame Example ----------

  async switchToIframe(): Promise<void> {
    const iframe = this.page.frameLocator('#courses-iframe');
    await expect(iframe.locator('body')).toBeVisible();
  }

  async getIframeLinks(): Promise<string[]> {
    const iframe = this.page.frameLocator('#courses-iframe');
    await iframe.locator('a').first().waitFor({ state: 'attached', timeout: 15000 });
    return iframe.locator('a').allTextContents();
  }

  async getIframeLocator(): ReturnType<Page['frameLocator']> {
    return this.page.frameLocator('#courses-iframe');
  }
}
