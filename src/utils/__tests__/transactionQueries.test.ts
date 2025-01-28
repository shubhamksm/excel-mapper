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
  writeBatch,
} from "firebase/firestore";
import * as transactionQueriesModule from "../transactionQueries";
import { transactionService } from "../transactionQueries";
import { db } from "../../firebase/config";
import { Transaction } from "@/types";
import { Category_Enum } from "@/constants";

// First mock the modules
jest.mock("firebase/firestore");
jest.mock("../../firebase/config", () => ({
  db: {},
}));

describe("transactionService", () => {
  // Common mock data
  const mockDate = new Date("2024-01-01");

  const mockTransactionData = {
    userId: "user123",
    accountId: "account123",
    year: 2024,
    title: "Test Transaction",
    amount: 100,
    currency: "USD",
    date: mockDate,
    category: Category_Enum.UNCATEGORIZED,
  };

  const mockTransactionWithId: Transaction = {
    ...mockTransactionData,
    id: "trans123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fromFirestore
    jest
      .spyOn(transactionQueriesModule, "fromFirestore")
      .mockImplementation((doc) => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date,
      }));
    // Spy on console.error to silence it during tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    jest.restoreAllMocks();
  });

  describe("createTransaction", () => {
    it("should create a new transaction successfully", async () => {
      const mockDocRef = { id: "trans123" };
      (collection as jest.Mock).mockReturnValue("transactions");
      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);

      const result = await transactionService.createTransaction(
        mockTransactionData
      );

      expect(collection).toHaveBeenCalledWith(db, "transactions");
      expect(addDoc).toHaveBeenCalledWith("transactions", {
        ...mockTransactionData,
        date: Timestamp.fromDate(mockDate),
      });
      expect(result).toBe("trans123");
    });

    it("should handle errors when creating transaction", async () => {
      const error = new Error("Failed to create transaction");
      (addDoc as jest.Mock).mockRejectedValue(error);

      await expect(
        transactionService.createTransaction(mockTransactionData)
      ).rejects.toThrow(error);
    });
  });

  describe("getAllTransactions", () => {
    it("should fetch all transactions successfully", async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: "trans123",
            data: () => ({
              ...mockTransactionData,
              date: mockDate,
            }),
          },
        ],
      };
      (collection as jest.Mock).mockReturnValue("transactions");
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const result = await transactionService.getAllTransactions();

      expect(collection).toHaveBeenCalledWith(db, "transactions");
      expect(getDocs).toHaveBeenCalled();
      expect(result).toEqual([mockTransactionWithId]);
    });

    it("should handle errors when fetching all transactions", async () => {
      const error = new Error("Failed to fetch transactions");
      (getDocs as jest.Mock).mockRejectedValue(error);

      await expect(transactionService.getAllTransactions()).rejects.toThrow(
        error
      );
    });
  });

  describe("getTransactionById", () => {
    it("should fetch a transaction by ID successfully", async () => {
      const mockDocSnap = {
        exists: () => true,
        id: "trans123",
        data: () => ({
          ...mockTransactionData,
          date: mockDate,
        }),
      };
      (doc as jest.Mock).mockReturnValue("transactionDoc");
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const result = await transactionService.getTransactionById("trans123");

      expect(doc).toHaveBeenCalledWith(db, "transactions", "trans123");
      expect(getDoc).toHaveBeenCalledWith("transactionDoc");
      expect(result).toEqual(mockTransactionWithId);
    });

    it("should return null for non-existent transaction", async () => {
      const mockDocSnap = {
        exists: () => false,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const result = await transactionService.getTransactionById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("updateTransaction", () => {
    it("should update a transaction successfully", async () => {
      (doc as jest.Mock).mockReturnValue("transactionDoc");
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const updateData = {
        id: "trans123",
        amount: 200,
      };

      await transactionService.updateTransaction(updateData);

      expect(doc).toHaveBeenCalledWith(db, "transactions", "trans123");
      expect(updateDoc).toHaveBeenCalledWith("transactionDoc", { amount: 200 });
    });
  });

  describe("deleteTransaction", () => {
    it("should delete a transaction successfully", async () => {
      (doc as jest.Mock).mockReturnValue("transactionDoc");
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      await transactionService.deleteTransaction("trans123");

      expect(doc).toHaveBeenCalledWith(db, "transactions", "trans123");
      expect(deleteDoc).toHaveBeenCalledWith("transactionDoc");
    });
  });

  describe("isDuplicateTransaction", () => {
    it("should detect duplicate transaction", async () => {
      const mockQuerySnapshot = {
        empty: false,
        docs: [
          {
            data: () => ({
              ...mockTransactionData,
              date: mockDate,
            }),
          },
        ],
      };
      (collection as jest.Mock).mockReturnValue("transactions");
      (query as jest.Mock).mockReturnValue("query");
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const result = await transactionService.isDuplicateTransaction(
        mockTransactionWithId
      );

      expect(result).toBe(true);
      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledTimes(5);
    });

    it("should return false for non-duplicate transaction", async () => {
      const mockQuerySnapshot = {
        empty: true,
        docs: [],
      };
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const testTransaction: Transaction = {
        id: "trans123",
        userId: "user123",
        accountId: "account123",
        year: 2024,
        title: "Test Transaction",
        amount: 100,
        currency: "USD",
        date: mockDate,
        category: Category_Enum.UNCATEGORIZED,
      };

      const result = await transactionService.isDuplicateTransaction(
        testTransaction
      );

      expect(result).toBe(false);
    });
  });

  describe("bulkUploadTransactions", () => {
    it("should properly handle duplicates, successful uploads, and failed transactions", async () => {
      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn(),
      };
      (writeBatch as jest.Mock).mockReturnValue(mockBatch);
      (doc as jest.Mock).mockImplementation(() => ({ id: "newTrans123" }));

      const mockQuerySnapshot = {
        docs: [
          {
            data: () => ({
              ...mockTransactionData,
              date: mockDate,
            }),
          },
        ],
        forEach: function (callback: (doc: any) => void) {
          this.docs.forEach(callback);
        },
      };
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      mockBatch.set.mockImplementation((_, data) => {
        if (data.amount === 300) {
          throw new Error("Failed to add transaction");
        }
      });

      const duplicateTransaction = {
        ...mockTransactionData,
        title: "Duplicate Transaction",
      };

      const uniqueTransaction = {
        ...mockTransactionData,
        title: "Unique Transaction",
        amount: 200,
        date: new Date("2024-01-02"),
      };

      const failingTransaction = {
        ...mockTransactionData,
        title: "Failing Transaction",
        amount: 300,
        date: new Date("2024-01-03"),
      };

      const transactions = [
        duplicateTransaction,
        uniqueTransaction,
        failingTransaction,
      ];

      const result = await transactionService.bulkUploadTransactions(
        transactions
      );

      expect(result.duplicates).toHaveLength(1);
      expect(result.successful).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
    });

    it("should handle errors during bulk upload", async () => {
      const error = new Error("Bulk upload failed");
      (writeBatch as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await expect(
        transactionService.bulkUploadTransactions([
          {
            userId: "user123",
            accountId: "account123",
            year: 2024,
            title: "Test Transaction",
            amount: 100,
            currency: "USD",
            date: mockDate,
            category: Category_Enum.UNCATEGORIZED,
          },
        ])
      ).rejects.toThrow(error);
    });
  });

  describe("queryTransactions", () => {
    it("should query transactions with multiple filters", async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: "trans123",
            data: () => ({
              ...mockTransactionData,
              date: mockDate,
            }),
          },
        ],
      };
      (collection as jest.Mock).mockReturnValue("transactions");
      (query as jest.Mock).mockReturnValue("query");
      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const filters = {
        userId: "user123",
        year: 2024,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
      };

      const result = await transactionService.queryTransactions(filters);

      expect(result).toEqual([mockTransactionWithId]);
      expect(where).toHaveBeenCalledWith("userId", "==", "user123");
      expect(where).toHaveBeenCalledWith("year", "==", 2024);
      expect(orderBy).toHaveBeenCalledWith("date", "desc");
    });
  });
});
