import { Transaction } from "@/types";
import { StateCreator } from "zustand";

export type TitleMappedData = (Pick<Transaction, "title" | "amount" | "date"> &
  Partial<Omit<Transaction, "title" | "amount" | "date">>)[];

export interface TitleMappingSlice {
  titleMappedData: TitleMappedData | undefined;
  setTitleMappedData: (data: TitleMappedData | undefined) => void;
}

export const createTitleMappingSlice: StateCreator<TitleMappingSlice> = (
  set
) => ({
  titleMappedData: undefined,
  setTitleMappedData: (data: TitleMappedData | undefined) =>
    set(() => ({ titleMappedData: data })),
});
