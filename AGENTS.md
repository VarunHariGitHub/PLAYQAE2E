# E2E Test Automation — Agent Workflow

This project uses **OpenCode custom subagents** for an automated E2E testing workflow.
Invoke any agent with `@agent-name` in your message.

---

## Agents Overview

| Agent | Role | Tool Access |
|-------|------|-------------|
| `@test-planner` | Creates test plans from requirements | Read-only |
| `@test-script-creator` | Implements tests with POM | Read + Write |
| `@test-executor` | Runs tests and reports results | Read + Bash |
| `@test-healer` | Fixes broken locators from UI changes | Read + Write + WebFetch |

---

## Workflow

### 1. Plan → `@test-planner`

```
@test-planner I need to add tests for the forgot-password flow on EventHub.
Steps: 1) navigate to login, 2) click "Forgot Password", 3) enter email, 4) verify confirmation.
```

Produces: test scenarios, test data strategy, required page object methods, and validation checkpoints.

### 2. Create → `@test-script-creator`

```
@test-script-creator Using the plan from @test-planner, create the test and page objects.
```

Produces: page object files in `tests/pages/` and spec files in `tests/e2e/`.

### 3. Execute → `@test-executor`

```
@test-executor Run the new forgot-password test on Chromium
```

Runs the test and reports pass/fail with error context.

### 4. Heal (if needed) → `@test-healer`

If a test fails due to a locator change:

```
@test-healer The forgot-password test failed. Fix the locator.
```

Inspects the live site, finds the correct locator, updates the page object, and verifies.

---

## Project Structure

```
PlayQAE@E/
├── .opencode/
│   └── agents/           # Agent definitions (auto-discovered)
│       ├── test-planner.md
│       ├── test-script-creator.md
│       ├── test-executor.md
│       └── test-healer.md
├── tests/
│   ├── pages/            # Page Object classes
│   ├── e2e/              # Test spec files
│   ├── fixtures/         # Shared test fixtures
│   └── utils/            # Helper utilities
└── playwright.config.ts
```

## Quick Reference

```bash
# Run specific test
npx playwright test tests/e2e/event-booking.spec.ts --project=chromium --timeout=120000

# Run headed (visible browser)
npx playwright test tests/e2e/event-booking.spec.ts --project=chromium --headed --timeout=120000

# Run with debugger
npx playwright test tests/e2e/event-booking.spec.ts --project=chromium --headed --debug --timeout=300000

# View report
npx playwright show-report
```
