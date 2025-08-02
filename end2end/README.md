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

## Test Data Setup

### Available Test Data

The test data includes comprehensive scenarios for testing the Excel import feature:

#### Test Accounts

- **test-norway**: NOK currency, main savings account
- **test-india**: INR currency, main savings account
- **test-savings**: EUR currency, main savings account

#### Transaction Categories

- **Standard Categories**: GROCERIES, SHOPPING, BILLS_AND_FEES, TRAVEL, INCOME, HEALTH, DINING, EXTRAS, INVESTMENT
- **Balance Correction**: Special category for linking transfers between accounts

#### Balance Correction Flow

The test data includes examples of balance correction transactions that demonstrate the cross-account linking:

1. **Norway to India Transfer**:
   - Norway account: "Transfer to India Emergency" (-8,000 NOK)
   - India account: "International Transfer from Norway Emergency" (+80,000 INR)
   - These transactions are automatically linked to prevent double-counting in financial analysis

#### Sample CSV Files

- `norway-transactions.csv` - Standard format with Date, Description, Amount columns
- `india-transactions.csv` - Matching transactions for balance correction testing
- `alternative-headers.csv` - Different header names to test mapping flexibility
- `bank-format.csv` - Bank-specific format with additional columns

### Using Test Data Helpers

```typescript
import {
  TestDataHelper,
  CSVTestHelper,
  ImportTestHelper,
} from "./utils/test-data-helpers";

test("example", async ({ authenticatedPage }) => {
  const testDataHelper = new TestDataHelper(authenticatedPage);
  const importHelper = new ImportTestHelper(authenticatedPage);

  // Setup clean test environment
  await testDataHelper.setupTestEnvironment();

  // Complete import flow
  await importHelper.completeImportFlow({
    filePath: "path/to/test.csv",
    headerMappings: { Date: "date", Description: "title", Amount: "amount" },
    accountName: "test-norway",
    categoryMappings: { "Some Transaction": "Groceries" },
  });

  // Verify results
  const transactionCount = await testDataHelper.getTransactionCount(
    "test-norway-001"
  );
  expect(transactionCount).toBeGreaterThan(0);
});
```

## Test Structure

### Page Objects

- `page-objects/DashboardPage.ts` - Dashboard page interactions and assertions
- Add more page objects as needed for other features

### Utilities

- `utils/test-helpers.ts` - Common navigation and assertion helpers
- Reusable functions for test setup and verification

### Test Files

- `dashboard.spec.ts` - Dashboard functionality tests
- `excel-import.spec.ts` - Excel import and balance correction tests
- `example.spec.ts` - Placeholder file (tests moved to specific files)

## Test Architecture

```
end2end/
├── fixtures/
│   ├── test-fixtures.ts     # Test fixtures and auth bypass
│   └── test-data.ts         # Test accounts, transactions, and sample data
├── page-objects/
│   └── DashboardPage.ts     # Page object models
├── utils/
│   ├── test-helpers.ts      # Common test utilities
│   └── test-data-helpers.ts # Database setup and CSV file management
├── test-files/              # Sample CSV files for import testing
│   ├── norway-transactions.csv
│   ├── india-transactions.csv
│   ├── alternative-headers.csv
│   └── bank-format.csv
├── dashboard.spec.ts        # Dashboard tests
├── excel-import.spec.ts     # Excel import and balance correction tests
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
