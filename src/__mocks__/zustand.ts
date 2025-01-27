import {
  StoreState,
  useBoundStore,
} from "@/features/import/store/useBoundStore";
import { useAppStore, StoreState as AppStoreState } from "@/store/useAppStore";

import type * as ZustandExportedTypes from "zustand";
export * from "zustand";

// required actual to inherit all functionality in tests
jest.requireActual<typeof ZustandExportedTypes>("zustand");

// Turn useBoundStore to mock
jest.mock("../features/import/store/useBoundStore", () => ({
  useBoundStore: jest.fn(),
}));

jest.mock("../store/useAppStore", () => ({
  useAppStore: jest.fn(),
}));

// Using jest.mock will allow retain the types to useStoreMock
const useStoreMock = jest.mocked(useBoundStore);
const useAppStoreMock = jest.mocked(useAppStore);

// Individual tests can use this to override
export const mockUseStore = (overrides: Partial<StoreState> = {}) => {
  useStoreMock.mockImplementation((getterFn) => {
    return getterFn({
      // we include the store's actual values by default
      // this allows the mocked store to have complete functionality,
      // with "granular" mocks defined as specified by tests
      ...jest
        .requireActual("../features/import/store/useBoundStore")
        .useBoundStore(),
      ...overrides,
    });
  });
};

export const mockUseAppStore = (overrides: Partial<AppStoreState> = {}) => {
  useAppStoreMock.mockImplementation((getterFn) => {
    return getterFn({
      ...jest.requireActual("../store/useAppStore").useAppStore(),
      ...overrides,
    });
  });
};

// this will set the default mock for the store on a per-test basis
// Note: setting this mock per test is a little heavy-handed, alternatively
// you can use beforeAll to set the default mock once per test suite
beforeEach(() => {
  mockUseStore();
  mockUseAppStore();
});
