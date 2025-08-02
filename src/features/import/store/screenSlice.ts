import { ExcelMappingScreens } from "@/types";
import { StateCreator } from "zustand";

export interface ScreenSlice {
  currentScreen: ExcelMappingScreens;
  changeCurrentScreen: (value: ExcelMappingScreens) => void;
  setOpen: (value: boolean) => void;
  open: boolean;
  resetScreenState: () => void;
}

export const createScreenSlice: StateCreator<ScreenSlice> = (set) => ({
  currentScreen: ExcelMappingScreens.UPLOAD_FILE,
  changeCurrentScreen: (value: ExcelMappingScreens) =>
    set(() => ({ currentScreen: value })),
  setOpen: (value: boolean) => set(() => ({ open: value })),
  open: false,
  resetScreenState: () =>
    set(() => ({
      currentScreen: ExcelMappingScreens.UPLOAD_FILE,
    })),
});
