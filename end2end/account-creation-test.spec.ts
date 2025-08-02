import { test, expect } from "./fixtures/test-fixtures";
import { TestDataHelper } from "./utils/test-data-helpers";

test.describe("Account Creation Test", () => {
  let testDataHelper: TestDataHelper;

  test.beforeEach(async ({ authenticatedPage }) => {
    testDataHelper = new TestDataHelper(authenticatedPage);

    await authenticatedPage.goto("/");
    await authenticatedPage.waitForSelector("text=Dashboard", {
      timeout: 10000,
    });

    // Setup clean environment
    await testDataHelper.setupTestEnvironment();
  });

  test("should create test accounts successfully", async ({
    authenticatedPage,
  }) => {
    // Navigate to accounts page
    await authenticatedPage.goto("/accounts");
    await authenticatedPage.waitForSelector('button:has-text("Add Account")', {
      timeout: 10000,
    });

    // Create one test account manually to verify the flow
    await authenticatedPage.click('button:has-text("Add Account")');
    await authenticatedPage.waitForSelector('[role="dialog"]', {
      timeout: 5000,
    });

    // Fill form
    await authenticatedPage.fill(
      'input[placeholder="Enter account name"]',
      "test-norway"
    );
    await authenticatedPage.fill('input[placeholder="EUR"]', "NOK");
    await authenticatedPage.fill('input[type="number"]', "25000");

    // Submit
    await authenticatedPage.click('button:has-text("Save Account")');

    // Wait for modal to close
    await authenticatedPage.waitForSelector('[role="dialog"]', {
      state: "detached",
      timeout: 5000,
    });

    // Verify account appears in the table
    await expect(authenticatedPage.locator('text="test-norway"')).toBeVisible();
  });

  test("should create accounts via helper method", async ({
    authenticatedPage,
  }) => {
    await testDataHelper.createTestAccountsThroughUI();

    // Navigate back to accounts to verify
    await authenticatedPage.goto("/accounts");
    await authenticatedPage.waitForSelector("table", { timeout: 10000 });

    // Check that accounts were created
    await expect(authenticatedPage.locator('text="test-norway"')).toBeVisible();
    await expect(authenticatedPage.locator('text="test-india"')).toBeVisible();
  });
});
