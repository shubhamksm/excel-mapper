import { create } from "zustand";
import { createScreenSlice, ScreenSlice } from "./screenSlice";
import {
  createHeaderMappingSlice,
  HeaderMappingSlice,
} from "./headerMappiingSlice";
import { createFileUploadSlice, FileUploadSlice } from "./fileUploadSlice";

export const useBoundStore = create<
  ScreenSlice & FileUploadSlice & HeaderMappingSlice
>()((...a) => ({
  ...createScreenSlice(...a),
  ...createFileUploadSlice(...a),
  ...createHeaderMappingSlice(...a),
}));
