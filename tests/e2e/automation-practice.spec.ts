import { test, expect } from '@playwright/test';
import { AutomationPracticePage } from '../pages/automation-practice-page';

test.describe('Automation Practice Page - All Sections', () => {
  test.setTimeout(120_000);

  let practicePage: AutomationPracticePage;

  test.beforeEach(async ({ page }) => {
    practicePage = new AutomationPracticePage(page);
    await practicePage.goto();
    await practicePage.expectPageOpened();
  });

  // ---------------------------------------------------------------
  // 1. Radio Button Example
  // ---------------------------------------------------------------
  test.describe('Radio Button Example', () => {
    test('should select Radio1 and verify it is checked while others are not', async () => {
      await practicePage.selectRadioButton('radio1');
      await practicePage.expectRadioButtonSelected('radio1');
      await practicePage.expectRadioButtonNotSelected('radio2');
      await practicePage.expectRadioButtonNotSelected('radio3');
    });

    test('should select Radio2 and verify it is checked while others are not', async () => {
      await practicePage.selectRadioButton('radio2');
      await practicePage.expectRadioButtonSelected('radio2');
      await practicePage.expectRadioButtonNotSelected('radio1');
      await practicePage.expectRadioButtonNotSelected('radio3');
    });

    test('should select Radio3 and verify it is checked while others are not', async () => {
      await practicePage.selectRadioButton('radio3');
      await practicePage.expectRadioButtonSelected('radio3');
      await practicePage.expectRadioButtonNotSelected('radio1');
      await practicePage.expectRadioButtonNotSelected('radio2');
    });
  });

  // ---------------------------------------------------------------
  // 2. Suggestion Class Example
  // ---------------------------------------------------------------
  test.describe('Suggestion Class Example', () => {
    test('should type a partial country name and select a suggestion', async () => {
      await practicePage.typeSuggestion('Ind');
      await practicePage.selectSuggestion('India');
      await practicePage.expectSuggestionInputValue('India');
    });
  });

  // ---------------------------------------------------------------
  // 3. Dropdown Example
  // ---------------------------------------------------------------
  test.describe('Dropdown Example', () => {
    test('should select Option1 from the dropdown', async () => {
      await practicePage.selectDropdownOption('Option1');
      await practicePage.expectDropdownSelectedValue('option1');
    });

    test('should select Option2 from the dropdown', async () => {
      await practicePage.selectDropdownOption('Option2');
      await practicePage.expectDropdownSelectedValue('option2');
    });

    test('should select Option3 from the dropdown', async () => {
      await practicePage.selectDropdownOption('Option3');
      await practicePage.expectDropdownSelectedValue('option3');
    });
  });

  // ---------------------------------------------------------------
  // 4. Checkbox Example
  // ---------------------------------------------------------------
  test.describe('Checkbox Example', () => {
    test('should check and uncheck Option1 checkbox', async () => {
      await practicePage.checkCheckbox(1);
      await practicePage.expectCheckboxChecked(1);

      await practicePage.uncheckCheckbox(1);
      await practicePage.expectCheckboxNotChecked(1);
    });

    test('should check and uncheck Option2 checkbox', async () => {
      await practicePage.checkCheckbox(2);
      await practicePage.expectCheckboxChecked(2);

      await practicePage.uncheckCheckbox(2);
      await practicePage.expectCheckboxNotChecked(2);
    });

    test('should check and uncheck Option3 checkbox', async () => {
      await practicePage.checkCheckbox(3);
      await practicePage.expectCheckboxChecked(3);

      await practicePage.uncheckCheckbox(3);
      await practicePage.expectCheckboxNotChecked(3);
    });

    test('should handle multiple checkboxes simultaneously', async () => {
      await practicePage.checkCheckbox(1);
      await practicePage.checkCheckbox(2);
      await practicePage.checkCheckbox(3);
      await practicePage.expectCheckboxChecked(1);
      await practicePage.expectCheckboxChecked(2);
      await practicePage.expectCheckboxChecked(3);

      await practicePage.uncheckCheckbox(2);
      await practicePage.expectCheckboxNotChecked(2);
      await practicePage.expectCheckboxChecked(1);
      await practicePage.expectCheckboxChecked(3);
    });
  });

  // ---------------------------------------------------------------
  // 5. Switch Window Example
  // ---------------------------------------------------------------
  test.describe('Switch Window Example', () => {
    test('should open a new window and verify it opens', async () => {
      const newWindow = await practicePage.clickOpenWindow();
      const url = newWindow.url();
      expect(url).toContain('qaclickacademy');
      await newWindow.close();
    });
  });

  // ---------------------------------------------------------------
  // 6. Switch Tab Example
  // ---------------------------------------------------------------
  test.describe('Switch Tab Example', () => {
    test('should open a new tab and verify it opens', async () => {
      const newTab = await practicePage.clickOpenTab();
      const url = newTab.url();
      expect(url).toContain('qaclickacademy');
      await newTab.close();
    });
  });

  // ---------------------------------------------------------------
  // 7. Switch To Alert Example
  // ---------------------------------------------------------------
  test.describe('Switch To Alert Example', () => {
    test('should trigger alert with the entered name and accept it', async () => {
      const alertMessage = await practicePage.triggerAlert('TestUser');
      expect(alertMessage).toContain('TestUser');
    });

    test('should trigger confirm dialog and dismiss it', async () => {
      const confirmMessage = await practicePage.triggerConfirm('DismissUser', false);
      expect(confirmMessage).toContain('DismissUser');
    });
  });

  // ---------------------------------------------------------------
  // 8. Web Table Example
  // ---------------------------------------------------------------
  test.describe('Web Table Example', () => {
    test('should contain Rahul Shetty courses in the table', async () => {
      const data = await practicePage.getWebTableData();
      expect(data.length).toBeGreaterThan(0);
      // Verify Rahul Shetty is the instructor for all rows
      data.forEach((row) => {
        expect(row[0]).toBe('Rahul Shetty');
      });
    });

    test('should contain Selenium Webdriver course', async () => {
      await practicePage.expectCourseExists('Rahul Shetty', 'Selenium Webdriver with Java Basics');
    });

    test('should contain Appium course', async () => {
      await practicePage.expectCourseExists('Rahul Shetty', 'Appium');
    });
  });

  // ---------------------------------------------------------------
  // 9. Element Displayed Example
  // ---------------------------------------------------------------
  test.describe('Element Displayed Example', () => {
    test('should hide the textbox when Hide is clicked', async () => {
      await practicePage.expectDisplayedTextboxVisible();
      await practicePage.hideElement();
      await practicePage.expectDisplayedTextboxHidden();
    });

    test('should show the textbox after hiding and clicking Show', async () => {
      await practicePage.hideElement();
      await practicePage.expectDisplayedTextboxHidden();

      await practicePage.showElement();
      await practicePage.expectDisplayedTextboxVisible();
    });

    test('should allow typing in the displayed textbox', async () => {
      await practicePage.typeIntoDisplayedTextbox('Hello World');
      await expect(practicePage.displayedTextbox).toHaveValue('Hello World');
    });
  });

  // ---------------------------------------------------------------
  // 10. Web Table Fixed header
  // ---------------------------------------------------------------
  test.describe('Web Table Fixed header', () => {
    test('should have correct column headers', async () => {
      const headers = await practicePage.getFixedTableHeaders();
      expect(headers).toEqual(['Name', 'Position', 'City', 'Amount']);
    });

    test('should contain expected employee data', async () => {
      const data = await practicePage.getFixedTableData();
      expect(data.length).toBe(9);

      const names = data.map((row) => row[0]);
      expect(names).toContain('Alex');
      expect(names).toContain('Ben');
      expect(names).toContain('Dwayne');
      expect(names).toContain('Ivory');
      expect(names).toContain('Jack');
      expect(names).toContain('Joe');
      expect(names).toContain('Raymond');
      expect(names).toContain('Ronaldo');
      expect(names).toContain('Smith');
    });

    test('should display total amount as 296', async () => {
      const total = await practicePage.getTotalAmount();
      expect(total).toContain('296');
    });
  });

  // ---------------------------------------------------------------
  // 11. Mouse Hover Example
  // ---------------------------------------------------------------
  test.describe('Mouse Hover Example', () => {
    test('should show Top and Reload links on hover', async () => {
      await practicePage.hoverMouse();
      await practicePage.expectHoverTopLinkVisible();
      await practicePage.expectHoverReloadLinkVisible();
    });
  });

  // ---------------------------------------------------------------
  // 12. iFrame Example
  // ---------------------------------------------------------------
  test.describe('iFrame Example', () => {
    test('should have content inside the iframe', async () => {
      await practicePage.switchToIframe();
    });

    test('should contain links inside the iframe', async () => {
      const links = await practicePage.getIframeLinks();
      expect(links.length).toBeGreaterThan(0);

      // Verify some expected link texts exist
      const linkTexts = links.map((l) => l.trim());
      expect(linkTexts.some((t) => t.includes('Home'))).toBeTruthy();
      expect(linkTexts.some((t) => t.includes('Courses'))).toBeTruthy();
    });
  });
});
