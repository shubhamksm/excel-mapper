import { Page } from "@playwright/test";

/**
 * Navigation helpers for the application
 */
export class NavigationHelpers {
  constructor(private page: Page) {}

  async goToDashboard() {
    await this.page.goto("/");
  }

  async goToAccounts() {
    await this.page.goto("/accounts");
  }

  async goToTransactions() {
    await this.page.goto("/transactions");
  }

  async goToBudgets() {
    await this.page.goto("/budgets");
  }

  async goToGoals() {
    await this.page.goto("/goals");
  }

  async navigateUsingSidebar(linkName: string) {
    await this.page.getByRole("link", { name: linkName }).click();
  }
}

/**
 * Common assertions and waits
 */
export class TestHelpers {
  constructor(private page: Page) {}

  async waitForAppToLoad() {
    // Wait for page to fully load
    await this.page.waitForLoadState("networkidle");

    // Wait for authentication to complete and app to render
    // Either sidebar appears (authenticated) or login button appears (not authenticated)
    try {
      // First try to find sidebar (authenticated state)
      const sidebar = this.page.locator('[data-sidebar="sidebar"]');
      const loginButton = this.page.getByRole("button", { name: "Login" });

      // Wait for either sidebar or login button to appear
      await Promise.race([
        sidebar.waitFor({ state: "visible", timeout: 15000 }),
        loginButton.waitFor({ state: "visible", timeout: 15000 }),
      ]);
    } catch (error) {
      throw new Error(
        `App failed to load - neither authenticated layout nor login screen appeared: ${error}`
      );
    }
  }

  async expectNoLoginScreen() {
    // Ensure we're not seeing the login screen
    const loginButton = this.page.getByRole("button", { name: "Login" });

    // Check if login button is visible
    const isLoginVisible = await loginButton.isVisible().catch(() => false);

    if (isLoginVisible) {
      throw new Error(
        "Login screen is still visible - authentication bypass failed"
      );
    }
  }

  async waitForAuthentication() {
    // Wait for authentication flow to complete
    await this.page.waitForFunction(
      () => {
        // Check if we have the authenticated layout (sidebar) or still have login
        const sidebar = document.querySelector('[data-sidebar="sidebar"]');

        // Look for login button by text content
        const buttons = Array.from(document.querySelectorAll("button"));
        const loginButton = buttons.find((btn) =>
          btn.textContent?.includes("Login")
        );

        return sidebar !== null || loginButton !== undefined;
      },
      { timeout: 10000 }
    );

    // Verify we got the sidebar (authenticated state)
    const sidebar = this.page.locator('[data-sidebar="sidebar"]');
    await sidebar.waitFor({ state: "visible", timeout: 5000 });
  }
}
