import { StateCreator } from "zustand";
import { Account } from "@/types";

export interface AccountSlice {
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;
}

export const createAccountSlice: StateCreator<AccountSlice> = (set) => ({
  accounts: [],
  setAccounts: (accounts: Account[]) => set(() => ({ accounts })),
});
