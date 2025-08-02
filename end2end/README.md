# End-to-End Testing Documentation

This directory contains Playwright end-to-end tests for the Excel Mapper application.

## Setup

The tests are configured to automatically start the development server and run against `http://localhost:5173`.

### Prerequisites

- Node.js and npm installed
- Playwright installed (`npx playwright install`)

## Running Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test dashboard.spec.ts

# Run tests with UI mode for debugging
npx playwright test --ui
```

## Authentication Bypass

Tests use a mocked Google API client to bypass the OAuth flow:

- **Test Fixtures**: Located in `fixtures/test-fixtures.ts`
- **Mock Strategy**: Overrides `window.gapi` with test doubles
- **Auth State**: Automatically sets authenticated state for tests

## Test Structure

### Page Objects

- `page-objects/DashboardPage.ts` - Dashboard page interactions and assertions
- Add more page objects as needed for other features

### Utilities

- `utils/test-helpers.ts` - Common navigation and assertion helpers
- Reusable functions for test setup and verification

### Test Files

- `dashboard.spec.ts` - Dashboard functionality tests
- `example.spec.ts` - Placeholder file (tests moved to specific files)

## Test Architecture

```
end2end/
├── fixtures/
│   └── test-fixtures.ts     # Test fixtures and auth bypass
├── page-objects/
│   └── DashboardPage.ts     # Page object models
├── utils/
│   └── test-helpers.ts      # Common test utilities
├── dashboard.spec.ts        # Dashboard tests
└── README.md               # This file
```

## Writing New Tests

1. **Create Page Objects**: For complex pages, create page object models in `page-objects/`
2. **Use Test Fixtures**: Import and use the `test` from `fixtures/test-fixtures.ts` for authenticated tests
3. **Follow Patterns**: Use the existing dashboard tests as templates

### Example Test Structure

```typescript
import { test, expect } from "./fixtures/test-fixtures";
import { YourPage } from "./page-objects/YourPage";

test.describe("Your Feature", () => {
  test("should do something", async ({ authenticatedPage }) => {
    const yourPage = new YourPage(authenticatedPage);

    await yourPage.goto();
    await yourPage.expectToBeVisible();
    // ... your test logic
  });
});
```

## Debugging Tests

- **Screenshots**: Automatically captured on failure
- **Videos**: Recorded and saved on failure
- **Traces**: Available for failed tests
- **Playwright Inspector**: Use `--debug` flag to step through tests

## Configuration

Main configuration in `playwright.config.ts`:

- **Base URL**: `http://localhost:5173`
- **Web Server**: Automatically starts `npm run dev`
- **Browsers**: Chromium, Firefox, WebKit
- **Timeouts**: 120s for server startup
