import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
  writeBatch,
  DocumentData,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Transaction } from "@/types";

interface BulkUploadResult {
  successful: Transaction[];
  duplicates: Transaction[];
  failed: {
    transaction: Transaction;
    error: string;
  }[];
}

// Helper functions
export const toFirestore = (transaction: Omit<Transaction, "id">) => {
  return {
    ...transaction,
    date: Timestamp.fromDate(transaction.date),
  };
};

export const fromFirestore = (doc: DocumentData): Transaction => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    date: (data.date as Timestamp).toDate(),
  };
};

export const transactionService = {
  // Create a new transaction
  createTransaction: async (
    transactionData: Omit<Transaction, "id">
  ): Promise<string> => {
    try {
      const docRef = await addDoc(
        collection(db, "transactions"),
        toFirestore(transactionData)
      );
      return docRef.id;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  },

  // Get all transactions
  getAllTransactions: async (): Promise<Transaction[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "transactions"));
      return querySnapshot.docs.map((doc) => fromFirestore(doc));
    } catch (error) {
      console.error("Error getting transactions:", error);
      throw error;
    }
  },

  // Get transaction by ID
  getTransactionById: async (id: string): Promise<Transaction | null> => {
    try {
      const docRef = doc(db, "transactions", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return fromFirestore(docSnap);
      }
      return null;
    } catch (error) {
      console.error("Error getting transaction:", error);
      throw error;
    }
  },

  // Update transaction
  updateTransaction: async (
    transaction: Partial<Transaction> & { id: string }
  ): Promise<void> => {
    try {
      const { id, ...data } = transaction;
      const docRef = doc(db, "transactions", id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  },

  // Delete transaction
  deleteTransaction: async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, "transactions", id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  },

  // Get transactions by user ID
  getTransactionsByUserId: async (userId: string): Promise<Transaction[]> => {
    try {
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", userId),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => fromFirestore(doc));
    } catch (error) {
      console.error("Error getting user transactions:", error);
      throw error;
    }
  },

  // Get transactions by account ID
  getTransactionsByAccountId: async (
    accountId: string
  ): Promise<Transaction[]> => {
    try {
      const q = query(
        collection(db, "transactions"),
        where("accountId", "==", accountId),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => fromFirestore(doc));
    } catch (error) {
      console.error("Error getting account transactions:", error);
      throw error;
    }
  },

  // Get transactions by year
  getTransactionsByYear: async (year: number): Promise<Transaction[]> => {
    try {
      const q = query(
        collection(db, "transactions"),
        where("year", "==", year),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => fromFirestore(doc));
    } catch (error) {
      console.error("Error getting transactions by year:", error);
      throw error;
    }
  },

  // Get transactions by category
  getTransactionsByCategory: async (
    category: string
  ): Promise<Transaction[]> => {
    try {
      const q = query(
        collection(db, "transactions"),
        where("category", "==", category),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => fromFirestore(doc));
    } catch (error) {
      console.error("Error getting transactions by category:", error);
      throw error;
    }
  },

  // Advanced query with multiple filters
  queryTransactions: async (filters: {
    userId?: string;
    accountId?: string;
    year?: number;
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Transaction[]> => {
    try {
      const constraints: QueryConstraint[] = [];

      if (filters.userId) {
        constraints.push(where("userId", "==", filters.userId));
      }
      if (filters.accountId) {
        constraints.push(where("accountId", "==", filters.accountId));
      }
      if (filters.year) {
        constraints.push(where("year", "==", filters.year));
      }
      if (filters.category) {
        constraints.push(where("category", "==", filters.category));
      }
      if (filters.startDate) {
        constraints.push(
          where("date", ">=", Timestamp.fromDate(filters.startDate))
        );
      }
      if (filters.endDate) {
        constraints.push(
          where("date", "<=", Timestamp.fromDate(filters.endDate))
        );
      }

      constraints.push(orderBy("date", "desc"));

      const q = query(collection(db, "transactions"), ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => fromFirestore(doc));
    } catch (error) {
      console.error("Error querying transactions:", error);
      throw error;
    }
  },

  isDuplicateTransaction: async (
    transaction: Transaction
  ): Promise<boolean> => {
    try {
      // Create a time window of 1 minute around the transaction date
      const date = transaction.date;
      const startDate = new Date(date.getTime() - 60000); // 1 minute before
      const endDate = new Date(date.getTime() + 60000); // 1 minute after

      const q = query(
        collection(db, "transactions"),
        where("userId", "==", transaction.userId),
        where("accountId", "==", transaction.accountId),
        where("amount", "==", transaction.amount),
        where("date", ">=", Timestamp.fromDate(startDate)),
        where("date", "<=", Timestamp.fromDate(endDate))
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking for duplicate transaction:", error);
      throw error;
    }
  },

  // Bulk upload transactions with duplicate checking
  bulkUploadTransactions: async (
    transactions: Omit<Transaction, "id">[]
  ): Promise<BulkUploadResult> => {
    const result: BulkUploadResult = {
      successful: [],
      duplicates: [],
      failed: [],
    };

    try {
      // Process transactions in parallel batches for better performance
      const batchSize = 500;
      const batches: Promise<void>[] = [];

      // Group transactions by time windows to optimize duplicate checking
      const timeWindowMap = new Map<string, Omit<Transaction, "id">[]>();

      // Group transactions by minute to reduce duplicate checks
      transactions.forEach((transaction) => {
        const minute = Math.floor(transaction.date.getTime() / 60000);
        const key = `${transaction.userId}_${transaction.accountId}_${minute}`;
        if (!timeWindowMap.has(key)) {
          timeWindowMap.set(key, []);
        }
        timeWindowMap.get(key)!.push(transaction);
      });

      // Process each time window group
      for (const [_, windowTransactions] of timeWindowMap) {
        const batchPromise = async () => {
          const batch = writeBatch(db);
          let batchCount = 0;

          // First, check all duplicates in this time window at once
          const uniqueTransactions = new Map<string, Omit<Transaction, "id">>();

          windowTransactions.forEach((transaction) => {
            const key = `${transaction.userId}_${transaction.accountId}_${
              transaction.amount
            }_${transaction.date.getTime()}`;
            uniqueTransactions.set(key, transaction);
          });

          // Check existing transactions in this time window
          const startDate = Timestamp.fromDate(
            new Date(
              Math.min(...windowTransactions.map((t) => t.date.getTime())) -
                60000
            )
          );
          const endDate = Timestamp.fromDate(
            new Date(
              Math.max(...windowTransactions.map((t) => t.date.getTime())) +
                60000
            )
          );

          const existingTransactions = await getDocs(
            query(
              collection(db, "transactions"),
              where("date", ">=", startDate),
              where("date", "<=", endDate)
            )
          );

          // Remove duplicates
          existingTransactions.forEach((doc) => {
            const existing = doc.data();
            const key = `${existing.userId}_${existing.accountId}_${
              existing.amount
            }_${existing.date.getTime()}`;
            if (uniqueTransactions.has(key)) {
              result.duplicates.push({
                ...uniqueTransactions.get(key)!,
                id: "duplicate",
              } as Transaction);
              uniqueTransactions.delete(key);
            }
          });

          // Process remaining unique transactions
          for (const transaction of uniqueTransactions.values()) {
            try {
              const docRef = doc(collection(db, "transactions"));
              batch.set(docRef, toFirestore(transaction));
              result.successful.push({
                ...transaction,
                id: docRef.id,
              } as Transaction);
              batchCount++;

              if (batchCount === batchSize) {
                await batch.commit();
                batchCount = 0;
              }
            } catch (error) {
              result.failed.push({
                transaction: transaction as Transaction,
                error: (error as Error).message,
              });
            }
          }

          if (batchCount > 0) {
            await batch.commit();
          }
        };

        batches.push(batchPromise());
      }

      // Wait for all batches to complete
      await Promise.all(batches);

      return result;
    } catch (error) {
      console.error("Error in bulk upload:", error);
      throw error;
    }
  },
};
