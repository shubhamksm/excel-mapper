import { Page } from "@playwright/test";
import {
  TEST_ACCOUNTS,
  NORWAY_TRANSACTIONS,
  INDIA_TRANSACTIONS,
  EUR_TRANSACTIONS,
  NORWAY_CSV_DATA,
  INDIA_CSV_DATA,
  CSV_WITH_DIFFERENT_HEADERS,
} from "../fixtures/test-data";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Database helper functions for test setup and teardown
 */
export class TestDataHelper {
  constructor(private page: Page) {}

  /**
   * Clear all data from the test database
   */
  async clearDatabase() {
    await this.page.evaluate(async () => {
      // Clear IndexedDB database directly
      const dbName = "BudgetDB";

      await new Promise((resolve, reject) => {
        const deleteReq = indexedDB.deleteDatabase(dbName);
        deleteReq.onsuccess = () => resolve(undefined);
        deleteReq.onerror = () => reject(deleteReq.error);
      });
    });
  }

  /**
   * Setup test environment - for now just clear database
   * Test accounts and transactions will be created through the UI instead
   */
  async setupTestEnvironment() {
    await this.clearDatabase();
    // Let the app load completely
    await this.page.waitForTimeout(2000);
  }

  /**
   * Get the count of transactions for a specific account using UI
   */
  async getTransactionCount(accountId: string): Promise<number> {
    // Navigate to transactions page and count visible transactions for the account
    await this.page.goto("/transactions");
    await this.page.waitForSelector("table", { timeout: 10000 });

    // Count transaction rows - this is a simplified approach
    const transactionRows = await this.page.locator("tbody tr").count();
    return transactionRows;
  }

  /**
   * Check if balance correction transactions exist by looking at the UI
   */
  async hasBalanceCorrectionTransactions(): Promise<boolean> {
    await this.page.goto("/transactions");
    await this.page.waitForSelector("table", { timeout: 10000 });

    // Look for "Balance Correction" text in the transactions table
    const balanceCorrectionExists =
      (await this.page.locator('text="Balance Correction"').count()) > 0;
    return balanceCorrectionExists;
  }

  /**
   * Wait for transactions to appear in the UI
   */
  async waitForTransactionProcessing(timeoutMs: number = 5000) {
    await this.page.goto("/transactions");

    // Wait for at least one transaction to appear
    await this.page.waitForSelector("tbody tr", { timeout: timeoutMs });
  }

  /**
   * Get linked transactions by checking UI - simplified approach
   */
  async getLinkedTransactions(): Promise<any[]> {
    // For now, just return empty array since we can't easily access the database
    // In a real scenario, we might expose a test API endpoint
    return [];
  }

  /**
   * Create test accounts through the UI
   */
  async createTestAccountsThroughUI() {
    // Navigate to accounts page
    await this.page.goto("/accounts");
    await this.page.waitForSelector('button:has-text("Add Account")', {
      timeout: 10000,
    });

    // Create test accounts using the UI
    for (const account of TEST_ACCOUNTS) {
      console.log(`Creating account: ${account.name}`);

      // Click add account button
      await this.page.click('button:has-text("Add Account")');
      await this.page.waitForSelector('[role="dialog"]', { timeout: 5000 });

      // Fill form fields - note that currency is an Input, not Select
      await this.page.fill(
        'input[placeholder="Enter account name"]',
        account.name
      );
      await this.page.fill('input[placeholder="EUR"]', account.currency);
      await this.page.fill('input[type="number"]', account.balance.toString());

      // Submit form
      await this.page.click('button:has-text("Save Account")');

      // Wait for modal to close and account to be created
      await this.page.waitForSelector('[role="dialog"]', {
        state: "detached",
        timeout: 5000,
      });
      await this.page.waitForTimeout(1000);
    }
  }
}

/**
 * CSV File helper functions for testing file uploads
 */
export class CSVTestHelper {
  private static testFilesDir = path.join(__dirname, "../test-files");

  /**
   * Ensure test files directory exists
   */
  static async ensureTestFilesDir() {
    try {
      await fs.access(this.testFilesDir);
    } catch {
      await fs.mkdir(this.testFilesDir, { recursive: true });
    }
  }

  /**
   * Convert array of objects to CSV string
   */
  static arrayToCSV(data: Record<string, any>[]): string {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvHeader = headers.join(",");

    const csvRows = data.map((row) =>
      headers
        .map((header) => {
          const value = row[header] || "";
          // Escape values that contain commas or quotes
          if (
            value.toString().includes(",") ||
            value.toString().includes('"')
          ) {
            return `"${value.toString().replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    );

    return [csvHeader, ...csvRows].join("\n");
  }

  /**
   * Create CSV file for Norway transactions
   */
  static async createNorwayCSV(): Promise<string> {
    await this.ensureTestFilesDir();
    const csvContent = this.arrayToCSV(NORWAY_CSV_DATA);
    const filePath = path.join(this.testFilesDir, "norway-transactions.csv");
    await fs.writeFile(filePath, csvContent);
    return filePath;
  }

  /**
   * Create CSV file for India transactions
   */
  static async createIndiaCSV(): Promise<string> {
    await this.ensureTestFilesDir();
    const csvContent = this.arrayToCSV(INDIA_CSV_DATA);
    const filePath = path.join(this.testFilesDir, "india-transactions.csv");
    await fs.writeFile(filePath, csvContent);
    return filePath;
  }

  /**
   * Create CSV file with alternative headers for testing header mapping
   */
  static async createAlternativeHeaderCSV(): Promise<string> {
    await this.ensureTestFilesDir();
    const csvContent = this.arrayToCSV(CSV_WITH_DIFFERENT_HEADERS.alternative);
    const filePath = path.join(this.testFilesDir, "alternative-headers.csv");
    await fs.writeFile(filePath, csvContent);
    return filePath;
  }

  /**
   * Create CSV file with bank-specific format
   */
  static async createBankFormatCSV(): Promise<string> {
    await this.ensureTestFilesDir();
    const csvContent = this.arrayToCSV(CSV_WITH_DIFFERENT_HEADERS.bankFormat);
    const filePath = path.join(this.testFilesDir, "bank-format.csv");
    await fs.writeFile(filePath, csvContent);
    return filePath;
  }

  /**
   * Create all test CSV files and return their paths
   */
  static async createAllTestFiles(): Promise<{
    norwayCSV: string;
    indiaCSV: string;
    alternativeCSV: string;
    bankFormatCSV: string;
  }> {
    const [norwayCSV, indiaCSV, alternativeCSV, bankFormatCSV] =
      await Promise.all([
        this.createNorwayCSV(),
        this.createIndiaCSV(),
        this.createAlternativeHeaderCSV(),
        this.createBankFormatCSV(),
      ]);

    return {
      norwayCSV,
      indiaCSV,
      alternativeCSV,
      bankFormatCSV,
    };
  }

  /**
   * Clean up test files
   */
  static async cleanupTestFiles() {
    try {
      await fs.rm(this.testFilesDir, { recursive: true, force: true });
    } catch (error) {
      console.warn("Could not clean up test files:", error);
    }
  }
}

/**
 * Page interaction helpers for Excel import testing
 */
export class ImportTestHelper {
  constructor(private page: Page) {}

  /**
   * Open the Excel import modal
   */
  async openImportModal() {
    // More specific selector for the import button on transactions page
    await this.page.click(
      'button:has-text("Import Excel File"):not([role="dialog"] button)'
    );
    await this.page.waitForSelector('[role="dialog"]');
    await this.page.waitForTimeout(500); // Wait for modal to fully load
  }

  /**
   * Upload a CSV file in the upload step
   */
  async uploadCSVFile(filePath: string) {
    const fileInput = this.page.locator('[role="dialog"] input[type="file"]');

    // Set the files AND trigger the change event
    await fileInput.setInputFiles(filePath);

    // Wait for the rawFile state to be set and file to be processed
    await this.page.waitForTimeout(1500);

    // Verify the file was actually set by checking if Next button is enabled
    const nextButton = this.page.locator(
      '[role="dialog"] button:has-text("Next")'
    );
    const isEnabled = await nextButton.isEnabled();

    if (!isEnabled) {
      throw new Error(
        "File upload failed - Next button is still disabled after file upload"
      );
    }
  }

  /**
   * Create a temporary CSV file for testing
   */
  async createTempCSVFile(content: string, filename: string): Promise<string> {
    const fs = await import("fs");
    const path = await import("path");
    const { fileURLToPath } = await import("url");

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const tempDir = path.join(__dirname, "..", "temp");
    const tempFile = path.join(tempDir, filename);

    // Ensure directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    fs.writeFileSync(tempFile, content);
    return tempFile;
  }

  /**
   * Upload CSV content directly (creates a Blob instead of temp file)
   */
  async uploadCSVContent(content: string, filename: string = "test.csv") {
    // Create a Blob instead of a file - this persists in memory
    const blob = new Blob([content], { type: "text/csv" });
    const file = new File([blob], filename, { type: "text/csv" });

    const fileInput = this.page.locator('[role="dialog"] input[type="file"]');

    // Set the file using the File object
    await fileInput.setInputFiles([
      {
        name: filename,
        mimeType: "text/csv",
        buffer: Buffer.from(content),
      },
    ]);

    // Wait for the rawFile state to be set and file to be processed
    await this.page.waitForTimeout(1500);

    // Verify the file was actually set by checking if Next button is enabled
    const nextButton = this.page.locator(
      '[role="dialog"] button:has-text("Next")'
    );
    const isEnabled = await nextButton.isEnabled();

    if (!isEnabled) {
      throw new Error(
        "File upload failed - Next button is still disabled after file upload"
      );
    }
  }

  /**
   * Map headers in the header mapping step
   */
  async mapHeaders(mappings: Record<string, string>) {
    // Find ALL SelectTrigger elements for header mapping (in the modal content area)
    const headerSelectTriggers = this.page.locator(
      '[role="dialog"] .space-y-4 button[role="combobox"]'
    );

    // Map by position since headers are displayed in order
    let index = 0;
    for (const [csvHeader, templateColumn] of Object.entries(mappings)) {
      // Find the select trigger by position
      const selectTrigger = headerSelectTriggers.nth(index);

      // Wait for the element to be visible and click it
      await selectTrigger.waitFor({ state: "visible" });
      await selectTrigger.click();
      await this.page.waitForTimeout(500); // Wait for dropdown to open

      // Select the template column - capitalize first letter for UI display
      const optionText =
        templateColumn.charAt(0).toUpperCase() + templateColumn.slice(1);
      const option = this.page
        .locator(`[role="option"]`)
        .filter({ hasText: optionText });
      await option.waitFor({ state: "visible" });
      await option.click();
      await this.page.waitForTimeout(300); // Wait for selection to register

      index++;
    }

    // Wait for form validation to update after all mappings
    await this.page.waitForTimeout(500);
  }

  /**
   * Set debit/credit for amount column
   */
  async setAmountDebitCredit(debitOrCredit: "debit" | "credit" | "both") {
    const toggleGroup = this.page.locator('[role="radiogroup"]');
    await toggleGroup.locator(`button:has-text("${debitOrCredit}")`).click();
  }

  /**
   * Proceed to next step
   */
  async clickNext() {
    // Use more specific selector for the modal's Next button
    await this.page.click('[role="dialog"] button:has-text("Next")');
  }

  /**
   * Select account in title mapping step
   */
  async selectAccount(accountName: string) {
    await this.page.click('text="Select Account for Transaction"');
    await this.page.click(`[role="option"]:has-text("${accountName}")`);
  }

  /**
   * Assign category to a transaction title
   */
  async assignCategory(title: string, category: string) {
    // Find the row with the title and click the category select
    const row = this.page.locator(`tr:has-text("${title}")`);
    const categorySelect = row.locator('[role="combobox"]').first();
    await categorySelect.click();
    await this.page.click(`[role="option"]:has-text("${category}")`);
  }

  /**
   * Assign reference account for balance correction
   */
  async assignReferenceAccount(title: string, accountName: string) {
    const row = this.page.locator(`tr:has-text("${title}")`);
    const accountSelect = row.locator('[role="combobox"]').last();
    await accountSelect.click();
    await this.page.click(`[role="option"]:has-text("${accountName}")`);
  }

  /**
   * Complete the import process
   */
  async finishImport() {
    await this.page.click('button:has-text("Finish")');
    // Wait for modal to close
    await this.page.waitForSelector('[role="dialog"]', { state: "detached" });
  }

  /**
   * Complete full import flow
   */
  async completeImportFlow({
    filePath,
    headerMappings,
    accountName,
    categoryMappings,
    balanceCorrectionMappings = {},
  }: {
    filePath: string;
    headerMappings: Record<string, string>;
    accountName: string;
    categoryMappings: Record<string, string>;
    balanceCorrectionMappings?: Record<string, string>;
  }) {
    // Step 1: Upload file
    await this.uploadCSVFile(filePath);
    await this.clickNext();

    // Step 2: Map headers
    await this.mapHeaders(headerMappings);
    await this.clickNext();

    // Step 3: Title mapping
    await this.selectAccount(accountName);

    // Assign categories
    for (const [title, category] of Object.entries(categoryMappings)) {
      await this.assignCategory(title, category);

      // If it's a balance correction, assign reference account
      if (
        category === "Balance Correction" &&
        balanceCorrectionMappings[title]
      ) {
        await this.assignReferenceAccount(
          title,
          balanceCorrectionMappings[title]
        );
      }
    }

    // Finish import
    await this.finishImport();
  }
}
