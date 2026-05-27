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
| `npm run codegen` | `npx playwright codegen` — open locator picker |
| `npm run report` | open last HTML report |
| `npm run trace` | `npx playwright show-trace` |

Run a single spec: `npx playwright test tests/e2e/<name>.spec.ts --project=chromium`.  
Filter by tag: `--grep @smoke`.

## Targets

- **Main app**: `https://eventhub.rahulshettyacademy.com` (no local dev server needed outside CI).
- **External**: Rediffmail sign-in, Google search/accessibility — these navigate third-party sites.
- Override base URL: `$env:BASE_URL = "..."`.

## Project structure

```
PlayQAE@E/
├── tests/
│   ├── e2e/               # Spec files (*.spec.ts)
│   ├── pages/             # Page Object classes (*-page.ts)
│   ├── fixtures/          # Shared test data (currently empty)
│   └── utils/             # Helpers (excel-utils.ts)
├── test-data/             # Generated Excel exports (gitignored)
├── test-plans/            # Agent-generated test plans
├── scripts/               # Empty, reserved for future automation
├── .opencode/agents/      # Subagent definitions (@test-planner, @test-script-creator, @test-executor, @test-healer)
└── playwright.config.ts
```

## Architecture

- **Page Object Model**: every spec imports page classes from `tests/pages/`. Locators live in page objects, not specs.
- The sole exception: `rediff-signin.spec.ts` — uses inline locators; planned for Page Object extraction.
- **Data uniqueness**: `Date.now()` timestamp appended to emails (`TestTestTest${ts}@gmail.com`), shared password `Test@1234`.
- **Excel side effect**: several tests write registration data to `test-data/*.xlsx` via `appendToExcel()` in `tests/utils/excel-utils.ts`.
- **No shared state between tests**: each test registers a fresh user.

## Playwright config quirks

| Setting | Value | Note |
|---|---|---|
| `testDir` | `./tests/e2e` | Only specs in `tests/e2e/` are discovered |
| `fullyParallel` | `true` | Rediff/Google tests navigate external sites — isolate or use `test.describe.serial` |
| `retries` | `0` local, `2` CI | Set via `process.env.CI` |
| `workers` | `undefined` local, `1` CI | |
| `baseURL` | `https://eventhub.rahulshettyacademy.com` | |
| `trace` | `on-first-retry` | |
| `screenshot` | `only-on-failure` | |
| `video` | `retain-on-failure` | |
| `webServer` | only in CI (starts `npm run dev`) | Not needed locally |

### Projects

| Name | Browser | Notes |
|---|---|---|
| `chromium` | Desktop Chrome (1280x720) | Default |
| `mobile-chrome` | Pixel 5 | |
| `mobile-safari` | iPhone 13 | |
| `iPhone Chrome` | iPhone 15 Pro Max viewport, Chromium engine | Has `headless: false` set in two places (likely over-constrained) |

## Environment

No `.env` is provided. Optional vars:
- `BASE_URL` — override the EventHub endpoint
- `GOOGLE_MCP_CLIENT_ID` / `GOOGLE_MCP_CLIENT_SECRET` — Google Workspace MCP auth
- `GITHUB_TOKEN` — GitHub MCP server
- `Gmail MCP`: authenticate with `opencode mcp auth gmail`

## Conventions

- Page files: `kebab-case.page.ts`, classes `PascalCasePage`, methods `async expectPageOpened()` asserting URL pattern.
- Spec files: `kebab-case.spec.ts`.
- E2E flows use `test.setTimeout(120_000)`; quick flows use `60_000`.
- Wait strategy: `waitUntil: 'domcontentloaded'` + `waitForLoadState('networkidle')` after navigation.
- Locator priority per `.opencode/agents/test-healer.md`: `data-testid` > `id` > `placeholder` > `getByRole` > stable CSS > `text=`.

## OpenCode subagents

Defined in `.opencode/agents/`. Invoke with `@agent-name`:
- **@test-planner** (read-only) — produces test plans from requirements
- **@test-script-creator** (read+write) — implements specs + page objects from a plan
- **@test-executor** (read+bash) — runs tests, reports results
- **@test-healer** (read+write+WebFetch) — fixes broken locators by inspecting live site

## What's ignored

`node_modules/`, `test-results/`, `playwright-report/`, `screenshots/`, `.video/`, `*.log`, `.env`
