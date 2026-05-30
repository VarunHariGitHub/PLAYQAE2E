---
name: add-new-page
description: Scaffold a new Page Object and corresponding test spec
---

## When to use
Use when adding test coverage for a new page/feature in the app.

## Page Object file
Create `tests/pages/<feature-name>.page.ts`:

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class FeaturePage {
  readonly page: Page;
  readonly header: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('h1');
  }

  async goto(subPath = ''): Promise<void> {
    await this.page.goto(subPath, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle');
  }

  async expectPageOpened(): Promise<void> {
    await expect(this.page).toHaveURL(/\/expected-path\//);
  }
}
```

## Conventions
- File name: `kebab-case.page.ts`
- Class name: `PascalCasePage`
- Methods: `async` returning `Promise<void>` unless returning data
- Locator priority: `data-testid` > `id` > `placeholder` > `getByRole` > stable CSS > `text=`
- Every page needs `goto()` and `expectPageOpened()` asserting URL pattern

## Spec file
Create `tests/e2e/<feature-name>.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { FeaturePage } from '../pages/feature-name.page';

test.describe('Feature Page', () => {
  test.setTimeout(120_000);

  let pageObj: FeaturePage;

  test.beforeEach(async ({ page }) => {
    pageObj = new FeaturePage(page);
    await pageObj.goto();
    await pageObj.expectPageOpened();
  });

  test('should do something', async () => {
    // test body
  });
});
```

Timeouts: E2E flows use `120_000`, quick flows use `60_000`.
