import { Page, Locator, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly dashboardLink: Locator;
  readonly pageTitle: Locator;
  readonly monthlyRunCard: Locator;
  readonly appHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('[data-sidebar="sidebar"]'); // sidebar element
    this.dashboardLink = page.getByRole("link", { name: "Dashboard" });
    this.pageTitle = page.locator('[data-testid="page-title"]');
    this.monthlyRunCard = page
      .locator('[data-testid="monthly-run-card"]')
      .or(page.getByText("Monthly Run Card").locator(".."));
    this.appHeader = page
      .locator("header")
      .or(page.locator('[data-testid="app-header"]'));
  }

  async goto() {
    await this.page.goto("/");
  }

  async expectToBeVisible() {
    // Verify the main dashboard elements are visible
    await expect(this.sidebar).toBeVisible();
    await expect(this.dashboardLink).toBeVisible();

    // Verify page has loaded (no login screen visible)
    await expect(
      this.page.getByRole("button", { name: "Login" })
    ).not.toBeVisible();
  }

  async expectDashboardContent() {
    // Wait for the main dashboard grid to be visible
    // This is the specific grid that contains dashboard cards
    await expect(this.page.locator("main .grid").first()).toBeVisible();
  }
}
