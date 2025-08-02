import { test, expect } from "./fixtures/test-fixtures";
import { DashboardPage } from "./page-objects/DashboardPage";
import { NavigationHelpers, TestHelpers } from "./utils/test-helpers";

test.describe("Dashboard", () => {
  test("should successfully load dashboard page", async ({
    authenticatedPage,
  }) => {
    const dashboardPage = new DashboardPage(authenticatedPage);
    const navigationHelpers = new NavigationHelpers(authenticatedPage);
    const testHelpers = new TestHelpers(authenticatedPage);

    // Navigate to dashboard
    await navigationHelpers.goToDashboard();

    // Wait for authentication and app to load
    await testHelpers.waitForAuthentication();

    // Ensure we're not seeing the login screen
    await testHelpers.expectNoLoginScreen();

    // Verify dashboard is visible and loaded
    await dashboardPage.expectToBeVisible();

    // Verify we can see dashboard content
    await dashboardPage.expectDashboardContent();

    // Additional verification - check page title contains the app name
    await expect(authenticatedPage).toHaveTitle(/Vite|Excel/i);
  });

  test("should display sidebar navigation", async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage);
    const testHelpers = new TestHelpers(authenticatedPage);

    await authenticatedPage.goto("/");
    await testHelpers.waitForAuthentication();

    // Verify sidebar links are present
    await expect(dashboardPage.dashboardLink).toBeVisible();
    await expect(
      authenticatedPage.getByRole("link", { name: "Accounts" })
    ).toBeVisible();
    await expect(
      authenticatedPage.getByRole("link", { name: "Transactions" })
    ).toBeVisible();
    await expect(
      authenticatedPage.getByRole("link", { name: "Budgets" })
    ).toBeVisible();
    await expect(
      authenticatedPage.getByRole("link", { name: "Goals" })
    ).toBeVisible();
  });

  test("should navigate between pages using sidebar", async ({
    authenticatedPage,
  }) => {
    const navigationHelpers = new NavigationHelpers(authenticatedPage);
    const testHelpers = new TestHelpers(authenticatedPage);

    // Start at dashboard
    await navigationHelpers.goToDashboard();
    await testHelpers.waitForAuthentication();

    // Navigate to accounts using sidebar
    await navigationHelpers.navigateUsingSidebar("Accounts");
    await expect(authenticatedPage).toHaveURL("/accounts");

    // Navigate to transactions using sidebar
    await navigationHelpers.navigateUsingSidebar("Transactions");
    await expect(authenticatedPage).toHaveURL("/transactions");

    // Navigate back to dashboard
    await navigationHelpers.navigateUsingSidebar("Dashboard");
    await expect(authenticatedPage).toHaveURL("/");
  });
});
