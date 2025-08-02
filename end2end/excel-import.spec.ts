import { test, expect } from "./fixtures/test-fixtures";
import {
  TestDataHelper,
  CSVTestHelper,
  ImportTestHelper,
} from "./utils/test-data-helpers";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe("Excel Import Feature", () => {
  let testDataHelper: TestDataHelper;
  let importHelper: ImportTestHelper;

  test.beforeEach(async ({ authenticatedPage }) => {
    testDataHelper = new TestDataHelper(authenticatedPage);
    importHelper = new ImportTestHelper(authenticatedPage);

    // Navigate to the application
    await authenticatedPage.goto("/");
    await authenticatedPage.waitForSelector("text=Dashboard", {
      timeout: 10000,
    });

    // Setup clean test environment and create accounts
    await testDataHelper.setupTestEnvironment();
    await testDataHelper.createTestAccountsThroughUI();
  });

  test.afterEach(async () => {
    // Clean up test files
    await CSVTestHelper.cleanupTestFiles();
  });

  test("should complete basic CSV import flow", async ({
    authenticatedPage,
  }) => {
    // Navigate to transactions page where import button is available
    await authenticatedPage.goto("/transactions");
    await authenticatedPage.waitForSelector("text=Import Excel File", {
      timeout: 10000,
    });

    // Create CSV content
    const csvContent = `Date,Description,Amount,Category
2024-02-01,ICA Supermarket,-520.75,
2024-02-02,Spotify Premium,-99,
2024-02-05,Salary February,47000,
2024-02-15,Transfer to India Emergency,-8000,`;

    // Open import modal and upload file
    await importHelper.openImportModal();
    await importHelper.uploadCSVContent(csvContent, "norway-transactions.csv");
    await importHelper.clickNext();

    // Should be on header mapping step first
    await expect(
      authenticatedPage.locator("text=Map your file headers")
    ).toBeVisible();

    // Map the headers
    await importHelper.mapHeaders({
      Date: "date",
      Description: "title",
      Amount: "amount",
    });
    await importHelper.clickNext();

    // Now should be on title mapping step
    await expect(
      authenticatedPage.locator("text=Assign categories")
    ).toBeVisible();

    // Select account for which transactions are uploaded
    await importHelper.selectAccount("test-norway");

    // Map categories for the transactions
    await importHelper.assignCategory("ICA Supermarket", "Groceries");
    await importHelper.assignCategory("Spotify Premium", "Bills And Fees");
    await importHelper.assignCategory("Salary February", "Income");
    await importHelper.assignCategory("Transfer to India Emergency", "Extras");

    // Click finish to complete import
    await importHelper.finishImport();

    // Verify transactions page shows all newly added transactions
    await expect(
      authenticatedPage.locator("text=ICA Supermarket")
    ).toBeVisible();
    await expect(
      authenticatedPage.locator("text=Spotify Premium")
    ).toBeVisible();
    await expect(
      authenticatedPage.locator("text=Salary February")
    ).toBeVisible();
    await expect(
      authenticatedPage.locator("text=Transfer to India Emergency")
    ).toBeVisible();

    // Verify the amounts are displayed correctly (with currency indicators)
    await expect(authenticatedPage.getByText(/-.*520\.75/)).toBeVisible();
    await expect(authenticatedPage.getByText(/-.*99(\D|$)/)).toBeVisible();
    await expect(authenticatedPage.getByText(/47,?000(\D|$)/)).toBeVisible();
    await expect(authenticatedPage.getByText(/-.*8,?000(\D|$)/)).toBeVisible();
  });

  test("should handle alternative header formats", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/transactions");
    await authenticatedPage.waitForSelector("text=Import Excel File", {
      timeout: 10000,
    });

    const alternativeCSVContent = `Transaction Date,Transaction Description,Debit/Credit,Type
2024-02-01,ICA Supermarket,-520.75,
2024-02-02,Spotify Premium,-99,
2024-02-05,Salary February,47000,
2024-02-15,Transfer to India Emergency,-8000,`;

    await importHelper.openImportModal();
    await importHelper.uploadCSVContent(
      alternativeCSVContent,
      "alternative-headers.csv"
    );
    await importHelper.clickNext();

    // Map alternative headers
    await importHelper.mapHeaders({
      "Transaction Date": "date",
      "Transaction Description": "title",
      "Debit/Credit": "amount",
    });
    await importHelper.clickNext();

    // Should be on title mapping step
    await expect(
      authenticatedPage.locator("text=Assign categories")
    ).toBeVisible();

    // Select account for which transactions are uploaded
    await importHelper.selectAccount("test-norway");

    // Map categories for the transactions
    await importHelper.assignCategory("ICA Supermarket", "Groceries");
    await importHelper.assignCategory("Spotify Premium", "Bills And Fees");
    await importHelper.assignCategory("Salary February", "Income");
    await importHelper.assignCategory("Transfer to India Emergency", "Extras");

    // Click finish to complete import
    await importHelper.finishImport();

    // Verify transactions page shows all newly added transactions
    await expect(
      authenticatedPage.locator("text=ICA Supermarket")
    ).toBeVisible();
    await expect(
      authenticatedPage.locator("text=Spotify Premium")
    ).toBeVisible();
    await expect(
      authenticatedPage.locator("text=Salary February")
    ).toBeVisible();
    await expect(
      authenticatedPage.locator("text=Transfer to India Emergency")
    ).toBeVisible();

    // Verify the amounts are displayed correctly (with currency indicators)
    await expect(authenticatedPage.getByText(/-.*520\.75/)).toBeVisible();
    await expect(authenticatedPage.getByText(/-.*99(\D|$)/)).toBeVisible();
    await expect(authenticatedPage.getByText(/47,?000(\D|$)/)).toBeVisible();
    await expect(authenticatedPage.getByText(/-.*8,?000(\D|$)/)).toBeVisible();
  });

  test("should show balance correction reference account dropdown", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/transactions");
    await authenticatedPage.waitForSelector("text=Import Excel File", {
      timeout: 10000,
    });

    const csvContent = `Date,Description,Amount,Category
2024-02-01,ICA Supermarket,-520.75,
2024-02-02,Spotify Premium,-99,
2024-02-05,Salary February,47000,
2024-02-15,Balance Correction to Savings,5000,`;

    await importHelper.openImportModal();
    await importHelper.uploadCSVContent(
      csvContent,
      "balance-correction-test.csv"
    );
    await importHelper.clickNext();

    await importHelper.mapHeaders({
      Date: "date",
      Description: "title",
      Amount: "amount",
    });
    await importHelper.clickNext();

    // Should be on title mapping step now
    await expect(
      authenticatedPage.locator("text=Assign categories")
    ).toBeVisible();

    // Select account for which transactions are uploaded
    await importHelper.selectAccount("test-norway");

    // Map categories for the transactions, including balance correction
    await importHelper.assignCategory("ICA Supermarket", "Groceries");
    await importHelper.assignCategory("Spotify Premium", "Bills And Fees");
    await importHelper.assignCategory("Salary February", "Income");
    await importHelper.assignCategory(
      "Balance Correction to Savings",
      "Balance Correction"
    );

    // For balance correction, assign reference account
    await importHelper.assignReferenceAccount(
      "Balance Correction to Savings",
      "test-savings"
    );

    // Click finish to complete import
    await importHelper.finishImport();

    // Verify transactions page shows all newly added transactions
    await expect(
      authenticatedPage.locator("text=ICA Supermarket")
    ).toBeVisible();
    await expect(
      authenticatedPage.locator("text=Spotify Premium")
    ).toBeVisible();
    await expect(
      authenticatedPage.locator("text=Salary February")
    ).toBeVisible();
    await expect(
      authenticatedPage.locator("text=Balance Correction to Savings")
    ).toBeVisible();

    // Verify the amounts are displayed correctly (with currency indicators)
    await expect(authenticatedPage.getByText(/-.*520\.75/)).toBeVisible();
    await expect(authenticatedPage.getByText(/-.*99(\D|$)/)).toBeVisible();
    await expect(authenticatedPage.getByText(/47,?000(\D|$)/)).toBeVisible();
    await expect(authenticatedPage.getByText(/5,?000(\D|$)/)).toBeVisible();
  });

  test("should handle upload step validation", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/transactions");
    await authenticatedPage.waitForSelector("text=Import Excel File", {
      timeout: 10000,
    });

    await importHelper.openImportModal();

    // Try to proceed without uploading a file
    await expect(
      authenticatedPage.locator('[role="dialog"] button:has-text("Next")')
    ).toBeDisabled();

    // Upload a file using CSV content
    const csvContent = `Date,Description,Amount,Category
2024-02-01,ICA Supermarket,-520.75,
2024-02-02,Spotify Premium,-99,
2024-02-05,Salary February,47000,`;

    await importHelper.uploadCSVContent(csvContent, "norway-test.csv");

    // Next button should now be enabled
    await expect(
      authenticatedPage.locator('[role="dialog"] button:has-text("Next")')
    ).toBeEnabled();
  });

  test("should handle header mapping validation", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/transactions");
    await authenticatedPage.waitForSelector("text=Import Excel File", {
      timeout: 10000,
    });

    const csvContent = `Date,Description,Amount,Category
2024-02-01,ICA Supermarket,-520.75,
2024-02-02,Spotify Premium,-99,
2024-02-05,Salary February,47000,`;

    await importHelper.openImportModal();
    await importHelper.uploadCSVContent(csvContent, "norway-transactions.csv");
    await importHelper.clickNext();

    // Next button should be disabled until required fields are mapped
    await expect(
      authenticatedPage.locator('[role="dialog"] button:has-text("Next")')
    ).toBeDisabled();

    // Map all required fields
    await importHelper.mapHeaders({
      Date: "date",
      Amount: "amount",
      Description: "title",
    });

    // Now next should be enabled
    await expect(
      authenticatedPage.locator('[role="dialog"] button:has-text("Next")')
    ).toBeEnabled();
  });

  test("should require account selection in title mapping", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/transactions");
    await authenticatedPage.waitForSelector("text=Import Excel File", {
      timeout: 10000,
    });

    const csvContent = `Date,Description,Amount,Category
2024-02-01,ICA Supermarket,-520.75,
2024-02-02,Spotify Premium,-99,
2024-02-05,Salary February,47000,`;

    await importHelper.openImportModal();
    await importHelper.uploadCSVContent(csvContent, "norway-transactions.csv");
    await importHelper.clickNext();

    await importHelper.mapHeaders({
      Date: "date",
      Description: "title",
      Amount: "amount",
    });
    await importHelper.clickNext();

    // Should show account selection prompt
    await expect(
      authenticatedPage.locator("text=Select Account for Transaction")
    ).toBeVisible();
  });

  test("should display modal elements correctly", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/transactions");
    await authenticatedPage.waitForSelector("text=Import Excel File", {
      timeout: 10000,
    });

    await importHelper.openImportModal();

    // Check modal is visible
    await expect(authenticatedPage.locator('[role="dialog"]')).toBeVisible();
    await expect(
      authenticatedPage.locator(
        '[role="dialog"] h2:has-text("Import Excel File")'
      )
    ).toBeVisible();

    // Check step indicator circles and file upload area
    await expect(authenticatedPage.locator('text="1"').first()).toBeVisible();
    await expect(authenticatedPage.locator('text="2"').first()).toBeVisible();
    await expect(authenticatedPage.locator('text="3"').first()).toBeVisible();

    // Check file upload area is visible
    await expect(
      authenticatedPage.locator('text="Click to upload"')
    ).toBeVisible();
  });
});
