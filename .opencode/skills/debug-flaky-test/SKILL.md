---
name: debug-flaky-test
description: Debug flaky Playwright E2E tests using traces, video, and repeat runs
---

## When to use
Use this when a test intermittently fails in CI or locally. Do NOT use for consistently failing tests.

## Workflow

1. **Reproduce with repetition**
   ```
   npx playwright test tests/e2e/<spec>.spec.ts --project=chromium --repeat-each=10
   ```

2. **Check artifacts**
   - Traces: `npx playwright show-trace test-results/<spec>-<failure>/trace.zip`
   - Videos: check `test-results/` for `.webm` files
   - Screenshots: `test-results/<spec>-<failure>/test-finished-1.png`

3. **Inspect trace for:**
   - `waitForTimeout` calls — replace with condition-based waits
   - `force: true` clicks — remove if element is naturally actionable
   - `page.evaluate()` for clicks — replace with Playwright locator `click()`
   - Network requests failing or slow — add proper waits

4. **Common fixes per project conventions:**
   - `networkidle` after navigation (already convention)
   - `--disable-popup-blocking` for window/tab tests
   - `{ force: true }` for radio/checkbox only if element is genuinely covered

5. **Verify fix**
   ```
   npx playwright test tests/e2e/<spec>.spec.ts --project=chromium --repeat-each=5
   ```
