import { db } from "@/firebase/config";
import { Account, AccountType } from "@/types";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  orderBy,
} from "firebase/firestore";

const convertTimestampToDate = (data: any): Account => {
  return {
    ...data,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  } as Account;
};

export const accountService = {
  createAccount: async (
    accountData: Omit<Account, "id" | "createdAt" | "updatedAt">
  ): Promise<string> => {
    try {
      // Create a new document reference with auto-generated ID
      const accountRef = doc(collection(db, "accounts"));

      // Prepare the account data
      const now = Timestamp.now();
      const account = {
        ...accountData,
        id: accountRef.id,
        createdAt: now,
        updatedAt: now,
      };

      // Save to Firestore
      await setDoc(accountRef, account);

      return accountRef.id;
    } catch (error) {
      console.error("Error creating account:", error);
      throw error;
    }
  },

  // Get account by ID
  getAccountById: async (accountId: string): Promise<Account | null> => {
    try {
      const docRef = doc(db, "accounts", accountId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return convertTimestampToDate({ id: docSnap.id, ...docSnap.data() });
      }
      return null;
    } catch (error) {
      console.error("Error getting account:", error);
      throw error;
    }
  },

  // Get all accounts for a user
  getUserAccounts: async (userId: string): Promise<Account[]> => {
    try {
      const q = query(
        collection(db, "accounts"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) =>
        convertTimestampToDate({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error("Error getting user accounts:", error);
      throw error;
    }
  },

  // Get all main accounts for a user
  getMainAccounts: async (userId: string): Promise<Account[]> => {
    try {
      const q = query(
        collection(db, "accounts"),
        where("userId", "==", userId),
        where("type", "==", AccountType.MAIN),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) =>
        convertTimestampToDate({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error("Error getting main accounts:", error);
      throw error;
    }
  },

  // Get proxy accounts for a main account
  getProxyAccounts: async (mainAccountId: string): Promise<Account[]> => {
    try {
      const q = query(
        collection(db, "accounts"),
        where("parentAccountId", "==", mainAccountId),
        where("type", "==", AccountType.PROXY),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) =>
        convertTimestampToDate({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error("Error getting proxy accounts:", error);
      throw error;
    }
  },

  // Update account
  updateAccount: async (
    accountId: string,
    updateData: Partial<
      Omit<Account, "id" | "userId" | "createdAt" | "updatedAt">
    >
  ): Promise<void> => {
    try {
      const docRef = doc(db, "accounts", accountId);
      const now = Timestamp.now();

      await updateDoc(docRef, {
        ...updateData,
        updatedAt: now,
      });
    } catch (error) {
      console.error("Error updating account:", error);
      throw error;
    }
  },

  // Update account balance
  updateAccountBalance: async (
    accountId: string,
    newBalance: number
  ): Promise<void> => {
    try {
      const docRef = doc(db, "accounts", accountId);
      const now = Timestamp.now();

      await updateDoc(docRef, {
        balance: newBalance,
        updatedAt: now,
      });
    } catch (error) {
      console.error("Error updating account balance:", error);
      throw error;
    }
  },

  // Delete account
  deleteAccount: async (accountId: string): Promise<void> => {
    try {
      const docRef = doc(db, "accounts", accountId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  },
};
