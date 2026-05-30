---
name: test-data-seeding
description: Seed and manage test data including Excel registration exports
---

## When to use
Use when you need to generate test data, populate fixtures, or clean up after tests.

## Data generation pattern
Unique emails use `Date.now()` timestamp:
```
TestTestTest${Date.now()}@gmail.com
```
Shared password: `Test@1234`

## Excel exports
Several tests write registration data to `test-data/*.xlsx` via `tests/utils/excel-utils.ts`:
```typescript
import { appendToExcel } from '../utils/excel-utils';
await appendToExcel('test-data/registrations.xlsx', rowData);
```

## Fixtures
Shared test data lives in `tests/fixtures/`. Keep these files small and focused:
- `tests/fixtures/users.ts` — reusable user objects
- `tests/fixtures/routes.ts` — route/page URL constants
- `tests/fixtures/selectors.ts` — shared selectors if not in page objects

## Cleanup
- Tests create fresh users — no shared state to clean
- Excel files in `test-data/` are gitignored, safe to delete locally
- Run `Remove-Item test-data/*.xlsx` to reset exports
