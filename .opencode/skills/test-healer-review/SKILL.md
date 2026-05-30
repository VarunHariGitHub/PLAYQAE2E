---
name: test-healer-review
description: Review @test-healer changes for regressions and best-practice violations
---

## When to use
Use after @test-healer fixes broken locators. Review the changes before committing.

## Checklist

### 1. Assert `force: true` was not introduced
```typescript
// BAD — bypasses actionability
await page.locator(...).click({ force: true });
// GOOD
await page.locator(...).click();
```
Only acceptable if element is genuinely covered/unreachable. Verify by testing without it first.

### 2. Assert no hard-coded timeouts were added
```typescript
// BAD — flaky and slow
await page.waitForTimeout(2000);
// GOOD — condition-based
await expect(page.locator(...)).toBeVisible({ timeout: 5000 });
```

### 3. Assert no `page.evaluate()` replaced locator clicks
```typescript
// BAD — bypasses Playwright auto-waiting
await page.evaluate(() => document.getElementById('btn')?.click());
// GOOD — uses locator
await page.locator('#btn').click();
```

### 4. Assert locator priority
Per project conventions: `data-testid` > `id` > `placeholder` > `getByRole` > stable CSS > `text=`
Prefer `getByRole` or `getByText` over CSS selectors where possible.

### 5. Verify the fix
```powershell
npx playwright test tests/e2e/<affected-spec>.spec.ts --project=chromium --reporter=line
```
