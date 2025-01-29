import { StateCreator } from "zustand";
import { Account, AccountSubType, AccountType } from "@/types";

export interface AccountSlice {
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;
}

export const createAccountSlice: StateCreator<AccountSlice> = (set) => ({
  // [TODO: Remove this]
  accounts: [
    {
      id: "1",
      userId: "1",
      name: "Main",
      currency: "NOK",
      balance: 1000,
      type: AccountType.MAIN,
      subType: AccountSubType.SAVINGS,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  setAccounts: (accounts: Account[]) => set(() => ({ accounts })),
});
