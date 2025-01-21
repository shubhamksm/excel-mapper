import { StateCreator } from "zustand";

export interface DriveSlice {
  rootFolderId: string | undefined;
  setRootFolderId: (id: string | undefined) => void;
}

export const createDriveSlice: StateCreator<DriveSlice> = (set) => ({
  rootFolderId: undefined,
  setRootFolderId: (id: string | undefined) =>
    set(() => ({ rootFolderId: id })),
});
