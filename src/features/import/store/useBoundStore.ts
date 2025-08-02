import { create } from "zustand";
import { createScreenSlice, ScreenSlice } from "./screenSlice";
import {
  createHeaderMappingSlice,
  HeaderMappingSlice,
} from "./headerMappiingSlice";
import { createFileUploadSlice, FileUploadSlice } from "./fileUploadSlice";
import {
  createTitleMappingSlice,
  TitleMappingSlice,
} from "./titleMappingSlice";

export type StoreState = ScreenSlice &
  FileUploadSlice &
  HeaderMappingSlice &
  TitleMappingSlice & {
    resetAllImportState: () => void;
  };

export const useBoundStore = create<StoreState>()((set, get, api) => ({
  ...createScreenSlice(set, get, api),
  ...createFileUploadSlice(set, get, api),
  ...createHeaderMappingSlice(set, get, api),
  ...createTitleMappingSlice(set, get, api),
  resetAllImportState: () => {
    const state = get();
    state.resetScreenState();
    state.resetFileUploadState();
    state.resetHeaderMappingState();
    state.resetTitleMappingState();
  },
}));
