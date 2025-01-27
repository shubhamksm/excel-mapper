import { CSV_Data } from "@/types";
import { StateCreator } from "zustand";

export interface TitleMappingSlice {
  titleMappedData: CSV_Data | undefined;
  setTitleMappedData: (data: CSV_Data) => void;
}

export const createTitleMappingSlice: StateCreator<TitleMappingSlice> = (
  set
) => ({
  titleMappedData: undefined,
  setTitleMappedData: (data: CSV_Data) =>
    set(() => ({ titleMappedData: data })),
});
