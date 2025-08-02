import { test as base, Page } from "@playwright/test";

// Test fixtures for bypassing authentication and setting up test state
export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Mock gapi before any scripts load
    await page.addInitScript(() => {
      // Comprehensive gapi mock that simulates successful authentication
      let authInstance: any = null;
      let statusCallback: ((isSignedIn: boolean) => void) | null = null;

      const gapiMock = {
        load: (apis: string, callback: () => void) => {
          console.log("[GAPI MOCK] Loading APIs:", apis);
          // Simulate async loading of gapi modules
          setTimeout(() => {
            console.log("[GAPI MOCK] APIs loaded, calling callback");
            callback();
          }, 50);
        },
        client: {
          init: (config: any) => {
            console.log("[GAPI MOCK] Initializing client with config:", config);
            // Return a resolved promise and trigger auth status
            return Promise.resolve().then(() => {
              console.log("[GAPI MOCK] Client initialized");
              // Trigger the status callback after initialization
              if (statusCallback) {
                console.log("[GAPI MOCK] Triggering status callback with true");
                setTimeout(() => statusCallback!(true), 100);
              }
            });
          },
          request: (params: any) => {
            console.log("[GAPI MOCK] client.request called with:", params);
            return Promise.resolve({
              result: {},
              status: 200,
            });
          },
          drive: {
            files: {
              list: (params: any) => {
                console.log(
                  "[GAPI MOCK] drive.files.list called with:",
                  params
                );
                return Promise.resolve({
                  result: {
                    files: [], // Return empty list for tests
                  },
                });
              },
              create: (params: any) => {
                console.log(
                  "[GAPI MOCK] drive.files.create called with:",
                  params
                );
                return Promise.resolve({
                  result: {
                    id: "mock-folder-id-" + Date.now(),
                  },
                });
              },
              get: (params: any) => {
                console.log("[GAPI MOCK] drive.files.get called with:", params);
                return Promise.resolve({
                  result: {
                    id: params.fileId,
                    name: "mock-file",
                  },
                });
              },
            },
          },
        },
        auth2: {
          getAuthInstance: () => {
            if (!authInstance) {
              authInstance = {
                isSignedIn: {
                  get: () => {
                    console.log(
                      "[GAPI MOCK] isSignedIn.get() called, returning true"
                    );
                    return true;
                  },
                  listen: (callback: (isSignedIn: boolean) => void) => {
                    console.log("[GAPI MOCK] isSignedIn.listen() called");
                    statusCallback = callback;
                    // Also call immediately to set initial state
                    setTimeout(() => {
                      console.log(
                        "[GAPI MOCK] Calling listen callback with true"
                      );
                      callback(true);
                    }, 50);
                  },
                },
                signIn: () => {
                  console.log("[GAPI MOCK] signIn() called");
                  return Promise.resolve();
                },
                signOut: () => {
                  console.log("[GAPI MOCK] signOut() called");
                  return Promise.resolve();
                },
              };
            }
            console.log("[GAPI MOCK] getAuthInstance() returning instance");
            return authInstance;
          },
        },
      };

      // Set up the global gapi object
      (window as any).gapi = gapiMock;

      // Also mock it on the global object for any direct access
      (globalThis as any).gapi = gapiMock;

      // Set test environment flag
      (window as any).__TEST_MODE__ = true;
    });

    // Intercept the Vite bundled gapi-script module and replace with our mock
    await page.route(/.*gapi-script\.js.*/, (route) => {
      const mockGapiScript = `
        console.log('[MOCK] gapi-script module loaded');
        // Export our mocked gapi that uses the one set up in addInitScript
        export const gapi = window.gapi;
        export default window.gapi;
      `;
      route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: mockGapiScript,
      });
    });

    // Block all Google APIs requests to prevent real auth
    await page.route(/.*apis\.google\.com.*/, (route) => {
      console.log(
        `[MOCK] Blocked Google API request: ${route.request().url()}`
      );
      route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: "// Blocked Google API script",
      });
    });

    await use(page);
  },
});

export { expect } from "@playwright/test";
