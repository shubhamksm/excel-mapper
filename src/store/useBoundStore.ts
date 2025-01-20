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
  TitleMappingSlice;

export const useBoundStore = create<StoreState>()((...a) => ({
  ...createScreenSlice(...a),
  ...createFileUploadSlice(...a),
  ...createHeaderMappingSlice(...a),
  ...createTitleMappingSlice(...a),
}));
