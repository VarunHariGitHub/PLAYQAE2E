# Test Plan: Rediff Sign-In Flow

## 1. Overview

**Feature Under Test:** Rediff.com → Rediffmail Sign-In Page

**Objective:** Validate that a user can navigate from the Rediff.com homepage to the Rediffmail login page and that all critical sign-in UI elements are present and accessible.

**Current State:** A single Playwright spec (`rediff-signin.spec.ts`) exists with inline locators and no dedicated page object. The rest of the project follows the Page Object Model (POM) pattern with page classes under `tests/pages/`.

**Test Type:** UI / Smoke / Sanity - verifies navigation and presence of key login controls without performing actual authentication.

---

## 2. Test Scenarios

### 2.1 Decomposition of Existing Test

| Step | Action | Page Object Method Needed | Validation |
|------|--------|--------------------------|------------|
| 1 | Navigate to `https://www.rediff.com` with `domcontentloaded` + `networkidle` | `RediffHomePage.goto()` | Page title equals `Rediff.com: News \| Rediffmail \| Stock Quotes \| Rediff Gurus` |
| 2 | Click the "Rediffmail" link in the top navigation | `RediffHomePage.clickRediffmailLink()` | URL changes to `/cgi-bin/login.cgi` |
| 3 | Wait for network idle on the login page | - (part of `clickRediffmailLink`) | Page title equals `Rediffmail - Free Email for Login with Secure Access` |
| 4 | Verify presence of login UI elements | `RediffSignInPage.expectSignInElementsVisible()` | "Sign in" heading visible, "Log In" button visible, "Forgot password?" link visible, "Get a new Rediffmail ID" link visible |

### 2.2 Suggested Additional Test Cases

#### TC-01: Verify Homepage Key Navigation Links

```
Given the user is on the Rediff.com homepage
Then all major navigation links should be visible:
  - Rediffmail
  - News
  - Money
  - Business
  - Movies
  - Cricket
```

#### TC-02: Invalid Login - Wrong Password

```
Given the user is on the Rediffmail sign-in page
When the user enters a valid-format email but an incorrect password
And clicks "Log In"
Then an error message should be displayed (e.g., "Wrong password" or "Invalid login")
```

#### TC-03: Invalid Login - Non-Existent Username

```
Given the user is on the Rediffmail sign-in page
When the user enters an unregistered email address and any password
And clicks "Log In"
Then an error message should be displayed (e.g., "Invalid username" or "User does not exist")
```

#### TC-04: Empty Fields Validation

```
Given the user is on the Rediffmail sign-in page
When the user clicks "Log In" without entering any credentials
Then client-side validation should trigger (HTML5 required attribute or JS alert)
And the form should not submit
```

#### TC-05: Successful Login (if test credentials are available)

```
Given the user is on the Rediffmail sign-in page
When the user enters valid credentials (REDIFF_EMAIL, REDIFF_PASSWORD)
And clicks "Log In"
Then the user should be redirected to the Rediffmail inbox
And the user's email identity should be visible in the header
```

#### TC-06: Forgot Password - Navigate and Verify UI

```
Given the user is on the Rediffmail sign-in page
When the user clicks "Forgot password?"
Then the user should be redirected to the password recovery page
And the recovery page should have an email/username input field
And a submit button to send recovery instructions
```

#### TC-07: Get a New Rediffmail ID - Navigate and Verify

```
Given the user is on the Rediffmail sign-in page
When the user clicks "Get a new Rediffmail ID"
Then the user should be redirected to the registration/sign-up page
And the sign-up form should have fields for: Full Name, Email ID, Password, etc.
```

#### TC-08: Remember Me Checkbox (if present)

```
Given the user is on the Rediffmail sign-in page
Then a "Remember me" checkbox should be present and unchecked by default
When the user checks "Remember me"
Then the checkbox state should toggle to checked
```

#### TC-09: Page Accessibility - Heading Structure

```
Given the user is on the Rediffmail sign-in page
Then the page should have exactly one <h1> element
And the heading hierarchy should follow a logical order (h1 -> h2 -> ...)
And all interactive elements should have accessible names/labels
```

#### TC-10: Responsive Layout - Mobile Viewport

```
Given the user is on the Rediffmail sign-in page using a mobile viewport (375x812)
Then all login elements should be visible without horizontal scrolling
And the layout should stack vertically (form fields, buttons, links)
```

#### TC-11: Browser Back Navigation

```
Given the user is on the Rediffmail sign-in page (after clicking from homepage)
When the user clicks the browser back button
Then the user should be returned to the Rediff.com homepage
And the homepage title should match the expected title
```

#### TC-12: Redirect to Login When Accessing Mail Directly

```
Given the user navigates directly to the login URL
When the page loads
Then the user should see the sign-in form
And all sign-in elements should be present
```

---

## 3. Test Data Strategy

### 3.1 Current Approach (in spec file)

- No test data - only navigation and element visibility checks.

### 3.2 Proposed Strategy

| Data Category | Source | Example | Notes |
|---------------|--------|---------|-------|
| Valid login credentials | Environment variables (`.env` file) | `REDIFF_EMAIL=testuser@rediffmail.com` / `REDIFF_PASSWORD=xxxx` | Never hardcode credentials. Use `process.env.REDIFF_EMAIL`. Add `.env` to `.gitignore`. |
| Invalid login data | Hardcoded or fixture | `invalid@nonexistent.com` / `WrongPass123!` | Use `Date.now()`-based email for uniqueness if needed |
| Timestamp for uniqueness | `Date.now()` | `const ts = Date.now();` | Established pattern across all existing tests |
| Navigation URLs | Hardcoded constants | `BASE_URL = 'https://www.rediff.com'` | Already in spec; consider moving to config |
| Expected titles/texts | Constants in spec or page object | Title strings, heading texts | Already in spec |

### 3.3 Recommended Fixture File

Create `tests/fixtures/rediff-test-data.ts`:

```typescript
export const REDIFF_URLS = {
  HOME: 'https://www.rediff.com',
  LOGIN: 'https://mail.rediff.com/cgi-bin/login.cgi',
  FORGOT_PASSWORD: 'https://mail.rediff.com/cgi-bin/forgot.cgi',
  REGISTER: 'https://register.rediffmail.com/',
} as const;

export const REDIFF_TITLES = {
  HOME: 'Rediff.com: News | Rediffmail | Stock Quotes | Rediff Gurus',
  LOGIN: 'Rediffmail - Free Email for Login with Secure Access',
} as const;

export const INVALID_CREDENTIALS = {
  email: `invalid_user_${Date.now()}@rediffmail.com`,
  password: 'WrongPass123!',
  wrongPassword: { email: 'existing_test@rediffmail.com', password: 'WrongPassword' },
};
```

---

## 4. Page Object Model Recommendations

### 4.1 New Page Objects Needed

#### `tests/pages/rediff-home-page.ts` - Rediff.com Homepage

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class RediffHomePage {
  readonly page: Page;
  readonly rediffmailLink: Locator;
  readonly navLinks: { [key: string]: Locator };

  constructor(page: Page) {
    this.page = page;
    this.rediffmailLink = page.getByRole('link', { name: 'Rediffmail', exact: true });
    this.navLinks = {
      news: page.getByRole('link', { name: /^news$/i }),
      money: page.getByRole('link', { name: /^money$/i }),
      business: page.getByRole('link', { name: /^business$/i }),
      movies: page.getByRole('link', { name: /^movies$/i }),
      cricket: page.getByRole('link', { name: /^cricket$/i }),
    };
  }

  async goto(): Promise<void> {
    await this.page.goto('https://www.rediff.com', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle');
  }

  async expectPageOpened(): Promise<void> {
    await expect(this.page).toHaveTitle(
      'Rediff.com: News | Rediffmail | Stock Quotes | Rediff Gurus'
    );
  }

  async clickRediffmailLink(): Promise<void> {
    await this.rediffmailLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectNavigationLinksVisible(): Promise<void> {
    for (const [name, locator] of Object.entries(this.navLinks)) {
      await expect(locator, `Navigation link "${name}" should be visible`).toBeVisible();
    }
  }
}
```

#### `tests/pages/rediff-signin-page.ts` - Rediffmail Sign-In Page

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class RediffSignInPage {
  readonly page: Page;
  readonly signInHeading: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly newRediffmailIdLink: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signInHeading = page.getByRole('heading', { name: 'Sign in' });
    this.loginButton = page.getByRole('button', { name: 'Log In' });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
    this.newRediffmailIdLink = page.getByRole('link', { name: 'Get a new Rediffmail ID' });
    this.emailInput = page.locator('#login_id');
    this.passwordInput = page.locator('#password');
    this.rememberMeCheckbox = page.locator('#remember');
    this.errorMessage = page.locator('.errmsg, #error-msg');
  }

  async expectPageOpened(): Promise<void> {
    await expect(this.page).toHaveURL(/\/cgi-bin\/login\.cgi/);
    await expect(this.page).toHaveTitle('Rediffmail - Free Email for Login with Secure Access');
  }

  async expectSignInElementsVisible(): Promise<void> {
    await expect(this.signInHeading).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.forgotPasswordLink).toBeVisible();
    await expect(this.newRediffmailIdLink).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectLoginError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout: 10_000 });
    const errorText = await this.errorMessage.textContent();
    expect(errorText?.length).toBeGreaterThan(0);
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickNewRediffmailId(): Promise<void> {
    await this.newRediffmailIdLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickLoginWithoutCredentials(): Promise<void> {
    await this.loginButton.click();
  }

  async expectClientSideValidation(): Promise<void> {
    const validity = await this.emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    expect(validity.length).toBeGreaterThan(0);
  }
}
```

#### `tests/pages/rediff-inbox-page.ts` (Future - for TC-05 success scenario)

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class RediffInboxPage {
  readonly page: Page;
  readonly userIdentity: Locator;
  readonly composeButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userIdentity = page.locator('#user-identity, .user_name, [data-testid="user-name"]');
    this.composeButton = page.locator('a:has-text("Compose")');
    this.logoutLink = page.locator('a:has-text("Logout")');
  }

  async expectPageOpened(expectedUser?: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/cgi-bin\/login\.cgi\?login_proc=1|inbox/);
    if (expectedUser) {
      await expect(this.userIdentity).toContainText(expectedUser);
    }
  }
}
```

### 4.2 Summary of Methods by Page Object

| Page Object | Method | TC Mapping |
|-------------|--------|------------|
| `RediffHomePage` | `goto()` | All homepage tests |
| `RediffHomePage` | `expectPageOpened()` | Existing, TC-11 |
| `RediffHomePage` | `clickRediffmailLink()` | Existing |
| `RediffHomePage` | `expectNavigationLinksVisible()` | TC-01 |
| `RediffSignInPage` | `expectPageOpened()` | Existing, TC-12 |
| `RediffSignInPage` | `expectSignInElementsVisible()` | Existing, TC-09 |
| `RediffSignInPage` | `login(email, password)` | TC-02, TC-03, TC-05 |
| `RediffSignInPage` | `expectLoginError()` | TC-02, TC-03 |
| `RediffSignInPage` | `clickLoginWithoutCredentials()` | TC-04 |
| `RediffSignInPage` | `expectClientSideValidation()` | TC-04 |
| `RediffSignInPage` | `clickForgotPassword()` | TC-06 |
| `RediffSignInPage` | `clickNewRediffmailId()` | TC-07 |
| `RediffInboxPage` | `expectPageOpened(user?)` | TC-05 |
| - | Browser back | TC-11 (inline in spec) |

---

## 5. Validation Checkpoints

### 5.1 Existing Checkpoints (Detailed)

| # | Assertion | What It Verifies | Type |
|---|-----------|------------------|------|
| 1 | `toHaveTitle('Rediff.com: News \| Rediffmail \| Stock Quotes \| Rediff Gurus')` | The homepage loaded completely and the `<title>` tag is correct | Page title |
| 2 | `toHaveURL(/\/cgi-bin\/login\.cgi/)` | Clicking "Rediffmail" navigated to the correct path | URL pattern |
| 3 | `toHaveTitle('Rediffmail - Free Email for Login with Secure Access')` | The login page's `<title>` is correct | Page title |
| 4 | `getByRole('heading', { name: 'Sign in' }).toBeVisible()` | The sign-in heading is rendered and visible | Element visibility |
| 5 | `getByRole('button', { name: 'Log In' }).toBeVisible()` | The primary CTA button is present | Element visibility |
| 6 | `getByRole('link', { name: 'Forgot password?' }).toBeVisible()` | Password recovery link is accessible | Element visibility |
| 7 | `getByRole('link', { name: 'Get a new Rediffmail ID' }).toBeVisible()` | Registration link is accessible | Element visibility |

### 5.2 Suggested Additional Checkpoints

| # | Assertion | TC |
|---|-----------|----|
| 8 | All nav links are visible on homepage | TC-01 |
| 9 | Error message element is visible and non-empty after failed login | TC-02, TC-03 |
| 10 | Form does not submit when fields are empty (URL stays on login page) | TC-04 |
| 11 | Browser validation message is shown on empty required fields | TC-04 |
| 12 | After successful login, URL contains inbox or login_proc | TC-05 |
| 13 | User identity/email is displayed in the header after login | TC-05 |
| 14 | Forgot password page has an email input and submit button | TC-06 |
| 15 | Registration/sign-up page has form fields (Full Name, Email, Password) | TC-07 |
| 16 | "Remember me" checkbox exists and is unchecked by default | TC-08 |
| 17 | There is exactly one `<h1>` on the sign-in page | TC-09 |
| 18 | All login elements fit within the mobile viewport (no horizontal scroll) | TC-10 |
| 19 | Clicking browser back returns to homepage with correct title | TC-11 |
| 20 | Direct navigation to login URL shows the sign-in form | TC-12 |

---

## 6. Edge Cases & Negative Scenarios

| Scenario | Expected Behavior | Test Priority |
|----------|-------------------|---------------|
| Empty email, valid password | Client-side validation prevents submission ("Please fill out this field") | High |
| Valid email, empty password | Client-side validation prevents submission | High |
| Both fields empty | Client-side validation prevents submission | High |
| Email with leading/trailing spaces | Should trim or show validation error | Medium |
| Password with leading/trailing spaces | Spaces should be preserved or flagged | Medium |
| SQL injection in email field | Form should reject or sanitize | Low |
| XSS in email or password field | Should not execute scripts; inputs should be sanitized | Low |
| Extremely long email (254+ chars) | Should handle gracefully (truncate or validate) | Low |
| Unicode/special characters in email | Should validate as per RFC standards | Low |
| Browser back after login failure | Should return to login page with fields cleared or preserved | Medium |
| Page refresh after failed attempt | Should return to clean login form (no stale state) | Medium |
| Network disconnection during login | Should show a network error message | Low |
| Concurrent login attempts (rapid clicking) | Should debounce or prevent double submission | Low |
| Caps Lock warning on password field | Some sites warn if Caps Lock is on; should verify if implemented | Low |
| Accessibility: keyboard navigation | Tab order should follow: email -> password -> Log In -> Forgot password -> Register | Medium |
| Accessibility: screen reader | All interactive elements should have proper aria-labels/roles | Medium |
| Mobile: orientation change (portrait <-> landscape) | UI should reflow correctly | Low |
| Mobile: touch target sizes | Buttons/links should be >= 48x48px per WCAG | Medium |

---

## 7. Environment & Pre-requisites

### 7.1 Dependencies

| Dependency | Version (in `package.json`) | Purpose |
|------------|-----------------------------|---------|
| `@playwright/test` | ^1.60.0 | Test framework |
| TypeScript | ^5.7.0 | Type safety |
| `xlsx` | ^0.18.5 | Excel logging (optional for data exports) |

### 7.2 Browser Configuration

From `playwright.config.ts`:

| Project | Viewport | Browser | Notes |
|---------|----------|---------|-------|
| Chromium | 1280x720 | Chromium | Default desktop |
| Mobile Chrome | 393x786 (Pixel 5) | Chromium | For TC-10 responsive tests |
| Mobile Safari | 375x812 (iPhone 13) | WebKit | For TC-10 responsive tests |

### 7.3 Timeouts

| Timeout | Value | Source |
|---------|-------|--------|
| Action timeout | 10,000 ms | `playwright.config.ts` |
| Navigation timeout | 30,000 ms | `playwright.config.ts` |
| Test timeout (current) | 60,000 ms | `test.setTimeout(60_000)` in spec |
| Test timeout (E2E flows) | 120,000 ms | Pattern from other specs |

### 7.4 Base URLs

The rediff spec currently hardcodes `BASE_URL = 'https://www.rediff.com'`.  
Recommendation: Move to `playwright.config.ts` as a separate project or as `use.baseURL` for a dedicated Rediff project. Alternatively, keep as a constant in a shared `tests/fixtures/rediff-urls.ts` file.

### 7.5 Required `rediffmail-locators.xlsx`

An Excel file exists at the project root. This likely contains locator mappings for the Rediffmail login page.  
Recommendation: Extract locators from this file into the page object for maintainability (especially if the locators were gathered via codegen or manual inspection).

---

## 8. Suggested Test Improvements

### 8.1 Extract Page Object (Highest Priority)
Move inline locators into `RediffSignInPage` and `RediffHomePage` per the POM recommendations above. This aligns with the project convention (all other specs use page objects).

### 8.2 Add Retries
The config already has `retries: 2` for CI. Consider adding `retries: 1` for local runs on flaky navigations (Rediff site can be slow).

### 8.3 Use Project Fixtures
Extend the Playwright fixture system to provide pre-built page objects:

```typescript
// tests/fixtures/fixtures.ts
import { test as base } from '@playwright/test';
import { RediffHomePage } from '../pages/rediff-home-page';
import { RediffSignInPage } from '../pages/rediff-signin-page';

export const test = base.extend<{
  rediffHomePage: RediffHomePage;
  rediffSignInPage: RediffSignInPage;
}>({
  rediffHomePage: async ({ page }, use) => {
    await use(new RediffHomePage(page));
  },
  rediffSignInPage: async ({ page }, use) => {
    await use(new RediffSignInPage(page));
  },
});
```

### 8.4 Improve Wait Strategy
Replace the hardcoded `waitForLoadState('networkidle')` with smarter waits:
- Use `waitForURL()` after navigation clicks
- Use `waitForSelector()` for critical elements
- Keep `networkidle` but consider adding a reduced timeout fallback

### 8.5 Add Test Tags

```typescript
test.describe('Rediff Sign In Flow', () => {
  test('Verify Rediff homepage title, navigate to Rediffmail, and verify Sign In locators', {
    tag: ['@smoke', '@rediff', '@navigation'],
  }, async ({ page }) => {
    // ...
  });
});
```

This enables targeted runs:
```bash
npx playwright test --grep @smoke
```

### 8.6 Environment-Driven Configuration

```typescript
// Instead of hardcoded:
const BASE_URL = 'https://www.rediff.com';

// Use:
const BASE_URL = process.env.REDIFF_BASE_URL || 'https://www.rediff.com';
```

### 8.7 Parallel Test Isolation
Since the rediff tests navigate to external sites (not the app under test), do not run them in parallel with EventHub tests. Either:
- Put rediff tests in a separate `test.describe.serial` block
- Add a dedicated config project for rediff tests
- Use `fullyParallel: false` in their describe block

### 8.8 Console Error Monitoring
Add console error assertions to catch JS errors on the login page:

```typescript
const consoleErrors: string[] = [];
page.on('console', msg => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

// After test:
expect(consoleErrors).toHaveLength(0);
```

### 8.9 Screenshot on Failure
The config already has `screenshot: 'only-on-failure'` and `video: 'retain-on-failure'`. These are sufficient.

### 8.10 Data-Driven Testing
For negative login tests (TC-02, TC-03, TC-04), use parameterized tests:

```typescript
const invalidCredentials = [
  { email: '', password: '', description: 'both empty' },
  { email: 'bad@user.com', password: '', description: 'empty password' },
  { email: '', password: 'SomePass1', description: 'empty email' },
  { email: 'not_an_email', password: 'SomePass1', description: 'malformed email' },
];

for (const { email, password, description } of invalidCredentials) {
  test(`should show validation error when ${description}`, async ({ page }) => {
    // ...
  });
}
```

---

## 9. Definition of Done

- [ ] Page objects `RediffHomePage` and `RediffSignInPage` created in `tests/pages/`
- [ ] Existing spec refactored to use page objects (no inline locators)
- [ ] All 7 existing assertions preserved and working
- [ ] `test.describe.serial` or dedicated project configured for external-site isolation
- [ ] Test data constants moved to `tests/fixtures/` or environment variables
- [ ] At least one additional test case implemented (e.g., TC-01 or TC-04)
- [ ] Retry strategy verified (config already has CI retries)
- [ ] Tests pass on `chromium` project locally
- [ ] Tests pass on `mobile-chrome` and `mobile-safari` projects
- [ ] No `console.error` messages from the Rediffmail page during test execution

---

## 10. Summary of Changes Required

| File | Action |
|------|--------|
| `tests/pages/rediff-home-page.ts` | Create - Homepage page object |
| `tests/pages/rediff-signin-page.ts` | Create - Sign-in page object |
| `tests/pages/rediff-inbox-page.ts` | Create - Inbox page object (for TC-05) |
| `tests/fixtures/rediff-test-data.ts` | Create - URL and text constants |
| `tests/fixtures/fixtures.ts` | Create - Custom Playwright fixtures |
| `tests/e2e/rediff-signin.spec.ts` | Refactor - Use page objects, add tags, improve waits |
| `tests/e2e/rediff-signin.spec.ts` | Enhance - Add TC-01 through TC-12 as appropriate |
| `playwright.config.ts` | Optionally add a dedicated Rediff project entry if isolation is needed |
