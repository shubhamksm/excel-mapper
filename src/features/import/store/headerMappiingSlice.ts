import { MappedHeaders } from "@/types";
import { StateCreator } from "zustand";

export interface HeaderMappingSlice {
  mappedHeaders: MappedHeaders;
  setMappedHeaders: (headers: MappedHeaders) => void;
  resetHeaderMappingState: () => void;
}

export const createHeaderMappingSlice: StateCreator<HeaderMappingSlice> = (
  set
) => ({
  mappedHeaders: {},
  setMappedHeaders: (headers: MappedHeaders) =>
    set((state) => ({ mappedHeaders: { ...state.mappedHeaders, ...headers } })),
  resetHeaderMappingState: () =>
    set(() => ({
      mappedHeaders: {},
    })),
});
