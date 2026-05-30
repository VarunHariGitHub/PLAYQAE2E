# PlayQAE@E — Playwright E2E Test Automation

## Quick start

```bash
npm install
npx playwright install chromium
npx playwright test --project=chromium
```

## Commands

| npm script | What it runs |
|---|---|
| `npm test` | `npx playwright test` (all projects, headless) |
| `npm run test:headed` | visible browser |
| `npm run test:chrome` | `--project=chromium` |
| `npm run test:ui` | Playwright UI mode |
| `npm run test:debug` | Playwright Inspector |
| `npm run codegen` | `npx playwright codegen` |
| `npm run report` | open last HTML report |
| `npm run trace` | `npx playwright show-trace` |

Single spec: `npx playwright test tests/e2e/<name>.spec.ts --project=chromium`.  
Filter by tag: `--grep @smoke`.

## Targets

- **Main app**: `https://eventhub.rahulshettyacademy.com` — tested via E2E flows (registration, booking, admin CRUD, API docs). No local dev server needed.
- **External**: Rediffmail sign-in, Google search/accessibility, Automation Practice — navigate third-party sites directly.
- Override base URL: `env:BASE_URL`.

## CI/CD (GitHub Actions)

Workflow: `.github/workflows/playwright-ci.yml`  
Runs on: push to `master`/`Varun`, PR to `master`, or manual dispatch.

- **Matrix**: `chromium`, `mobile-chrome`, `mobile-safari` (parallel, `fail-fast: false`).
- **`iPhone Chrome` project is excluded from CI** — has `headless: false` hardcoded.
- **Env**: `CI=true` activates `retries: 2`, `workers: 1`, `forbidOnly`, and `github` reporter.
- **Artifacts on failure**: HTML report + test-results (retained 7 days).
- **Manual dispatch inputs**: `test_file`, `headed` (boolean, uses xvfb), `project`.
- **Headed mode in CI**: uses `xvfb-run --auto-servernum` for virtual display.

Trigger manually: GitHub → Actions → Playwright CI → Run workflow.  
Run URL: `https://github.com/VarunHariGitHub/PLAYQAE2E/actions`

## Project structure

```
PlayQAE@E/
├── tests/
│   ├── e2e/               # Spec files (*.spec.ts, one *.spec.js)
│   ├── pages/             # Page Object classes (*-page.ts)
│   ├── fixtures/          # (empty — reserved for future shared test data)
│   └── utils/             # excel-utils.ts (XLSX append helper)
├── test-data/             # Generated Excel exports (gitignored)
├── test-plans/            # Agent-generated test plans
├── .opencode/agents/      # Subagent definitions
├── .opencode/skills/      # Skill definitions
└── playwright.config.ts
```

## Architecture

- **Page Object Model**: locators live in page objects, not specs.
- **Specs in `.ts`** — except `google-search.spec.js` (the sole `.js` leftover; inline locators, no page object).
- **`rediff-signin.spec.ts`** also uses inline locators; planned for Page Object extraction.
- **Data uniqueness**: `Date.now()` timestamp appended to emails (`TestTestTest${ts}@gmail.com`), shared password `Test@1234`.
- **Excel side effect**: `appendToExcel()` in `tests/utils/excel-utils.ts` writes registration/booking/api-auth data to `test-data/*.xlsx`.
- **No shared state**: each test registers a fresh user.

## Playwright config quirks

| Setting | Value | Note |
|---|---|---|
| `testDir` | `./tests/e2e` | Only specs in `tests/e2e/` are discovered |
| `fullyParallel` | `true` | Rediff/Google tests navigate external sites — isolate or use `test.describe.serial` |
| `retries` | `0` local, `2` CI | Via `process.env.CI` |
| `workers` | `undefined` local, `1` CI | |
| `baseURL` | `https://eventhub.rahulshettyacademy.com` | |
| `trace` | `on-first-retry` | |
| `screenshot` | `only-on-failure` | |
| `video` | `retain-on-failure` | |

### Projects

| Name | Browser | Notes |
|---|---|---|
| `chromium` | Desktop Chrome (1280x720) | Default |
| `mobile-chrome` | Pixel 5 | |
| `mobile-safari` | iPhone 13 | |
| `iPhone Chrome` | iPhone 15 Pro Max viewport, Chromium engine | `headless: false` hardcoded — **cannot run in CI**, local headed only |

## Test quirks & gotchas

- **`automation-practice.spec.ts`** uses `--disable-popup-blocking` via `test.use({ launchOptions: { args: [...] } })`. Window/tab tests will fail without it.
- **`google-search.spec.js`** has CAPTCHA handling: if Google blocks automated traffic, the test skips gracefully (annotation logged, test passes).
- **`bookings-page.ts:41`** has a leftover `page.pause()` in `confirmCancellation()` — blocks test execution in headed debug mode.
- **`event-detail-page.ts:44`** uses `waitForTimeout(300)` in `increaseTickets()` loop. Do not replace with condition-based wait — the ticket count UI updates with animation.
- **`api-docs-page.ts`** uses `waitForTimeout(1000)` after authorize/close actions — Swagger UI dialog animations require this.
- **Alert tests** in `automation-practice-page.ts:205,227` use `page.evaluate()` with `setTimeout` to trigger browser dialogs (Playwright limitation — dialogs fire before listener is attached otherwise).

## Page Object conventions

- File naming: `kebab-case.page.ts`, classes: `PascalCasePage`.
- Every page has `async expectPageOpened()` asserting URL pattern.
- `goto()` uses `waitUntil: 'domcontentloaded'` + `waitForLoadState('networkidle')`.
- Locator priority: `data-testid` > `id` > `placeholder` > `getByRole` > stable CSS > `text=`.
- Timeouts: long E2E flows `120_000`, quick flows `60_000`.

## Environment

No `.env` is provided. Optional vars:
- `BASE_URL` — override the EventHub endpoint
- `CI` — enables retries, single worker, forbidOnly, github reporter, and disables popup blocking
- `GOOGLE_MCP_CLIENT_ID` / `GOOGLE_MCP_CLIENT_SECRET` — Google Workspace MCP auth
- `JIRA_INSTANCE_URL`, `JIRA_USER_EMAIL`, `JIRA_API_KEY` — Jira MCP
- `GITHUB_TOKEN` — GitHub MCP
- Gmail MCP auth: `opencode mcp auth gmail`

## OpenCode subagents & skills

Defined in `.opencode/agents/`, invoke with `@agent-name`:

| Agent | Permission | Purpose |
|---|---|---|
| `@test-planner` | read-only | Produces structured test plans from requirements |
| `@test-script-creator` | read+write | Creates page objects + spec files from a plan |
| `@test-executor` | read+bash | Runs tests, reports results (never edits) |
| `@test-healer` | read+write+WebFetch | Fixes broken locators by inspecting live DOM |

Skills (`.opencode/skills/`): `add-new-page`, `test-healer-review`, `debug-flaky-test`, `excel-export`, `jira-workflow`, `test-data-seeding`.

## What's ignored

`node_modules/`, `test-results/`, `playwright-report/`, `screenshots/`, `.video/`, `*.log`, `.env`
