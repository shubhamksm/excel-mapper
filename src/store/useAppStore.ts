import { create } from "zustand";
import { createDriveSlice, DriveSlice } from "./driveSlice";
import { createAccountSlice, AccountSlice } from "./accountSlice";

export type StoreState = DriveSlice & AccountSlice;

export const useAppStore = create<StoreState>()((...a) => ({
  ...createDriveSlice(...a),
  ...createAccountSlice(...a),
}));
