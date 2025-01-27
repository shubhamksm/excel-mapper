import { create } from "zustand";
import { createDriveSlice, DriveSlice } from "./driveSlice";

export type StoreState = DriveSlice;

export const useAppStore = create<StoreState>()((...a) => ({
  ...createDriveSlice(...a),
}));
