import { ExcelMappingScreens } from "@/types";
import { StateCreator } from "zustand";

export interface ScreenSlice {
  currentScreen: ExcelMappingScreens;
  changeCurrentScreen: (value: ExcelMappingScreens) => void;
}

export const createScreenSlice: StateCreator<ScreenSlice> = (set) => ({
  currentScreen: ExcelMappingScreens.UPLOAD_FILE,
  changeCurrentScreen: (value: ExcelMappingScreens) =>
    set(() => ({ currentScreen: value })),
});
