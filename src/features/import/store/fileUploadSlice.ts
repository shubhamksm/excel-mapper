import { Generic_CSV_Data } from "@/types";
import { StateCreator } from "zustand";

export interface FileUploadSlice {
  rawFile: File | undefined;
  parsedFile: Generic_CSV_Data | undefined;
  setRawFile: (file: File | undefined) => void;
  setParsedFile: (file: Generic_CSV_Data) => void;
}

export const createFileUploadSlice: StateCreator<FileUploadSlice> = (set) => ({
  rawFile: undefined,
  parsedFile: undefined,
  setRawFile: (file: File | undefined) => set(() => ({ rawFile: file })),
  setParsedFile: (file: Generic_CSV_Data) => set(() => ({ parsedFile: file })),
});
