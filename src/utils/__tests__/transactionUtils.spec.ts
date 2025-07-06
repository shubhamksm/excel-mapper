import {
  updateTransactionCategory,
  getTransactionTitleStats,
  getAllTransactionTitles,
} from "../transactionUtils";
import { db } from "@/database";
import { Category_Enum } from "@/constants";

// Mock the database
jest.mock("@/database", () => ({
  db: {
    transactions: {
      get: jest.fn(),
      toArray: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("Transaction Utils", () => {
  const mockTransaction = {
    id: "1",
    accountId: "account1",
    year: 2023,
    title: "Netflix",
    amount: -15.99,
    currency: "NOK",
    date: new Date("2023-01-01"),
    category: Category_Enum.EXTRAS,
    note: "Monthly subscription",
    exchangeRate: 1,
  };

  const mockTransactions = [
    mockTransaction,
    {
      id: "2",
      accountId: "account1",
      year: 2023,
      title: "Netflix",
      amount: -15.99,
      currency: "NOK",
      date: new Date("2023-02-01"),
      category: Category_Enum.EXTRAS,
      note: "Monthly subscription",
      exchangeRate: 1,
    },
    {
      id: "3",
      accountId: "account1",
      year: 2023,
      title: "Different Title",
      amount: -50.0,
      currency: "NOK",
      date: new Date("2023-01-15"),
      category: Category_Enum.GROCERIES,
      note: "Different transaction",
      exchangeRate: 1,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("updateTransactionCategory", () => {
    it("should update category for a single transaction", async () => {
      (db.transactions.get as jest.Mock).mockResolvedValue(mockTransaction);
      (db.transactions.toArray as jest.Mock).mockResolvedValue([
        mockTransaction,
      ]);
      (db.transactions.update as jest.Mock).mockResolvedValue(1);

      const result = await updateTransactionCategory(
        "1",
        Category_Enum.INVESTMENT
      );

      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(1);
      expect(result.errors).toHaveLength(0);
      expect(db.transactions.update).toHaveBeenCalledWith("1", {
        category: Category_Enum.INVESTMENT,
      });
    });

    it("should update category for multiple transactions with same title", async () => {
      (db.transactions.get as jest.Mock).mockResolvedValue(mockTransaction);
      (db.transactions.toArray as jest.Mock).mockResolvedValue(
        mockTransactions
      );
      (db.transactions.update as jest.Mock).mockResolvedValue(1);

      const result = await updateTransactionCategory(
        "1",
        Category_Enum.INVESTMENT
      );

      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(2); // Both Netflix transactions
      expect(result.errors).toHaveLength(0);
      expect(db.transactions.update).toHaveBeenCalledTimes(2);
    });

    it("should handle transaction not found", async () => {
      (db.transactions.get as jest.Mock).mockResolvedValue(null);

      const result = await updateTransactionCategory(
        "999",
        Category_Enum.INVESTMENT
      );

      expect(result.success).toBe(false);
      expect(result.updatedCount).toBe(0);
      expect(result.errors).toContain("Transaction with ID 999 not found");
    });

    it("should handle database update errors", async () => {
      (db.transactions.get as jest.Mock).mockResolvedValue(mockTransaction);
      (db.transactions.toArray as jest.Mock).mockResolvedValue([
        mockTransaction,
      ]);
      (db.transactions.update as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const result = await updateTransactionCategory(
        "1",
        Category_Enum.INVESTMENT
      );

      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("Failed to update transaction 1");
    });
  });

  describe("getTransactionTitleStats", () => {
    it("should return statistics for transactions with same title", async () => {
      (db.transactions.get as jest.Mock).mockResolvedValue(mockTransaction);
      (db.transactions.toArray as jest.Mock).mockResolvedValue(
        mockTransactions
      );

      const result = await getTransactionTitleStats("1");

      expect(result.title).toBe("Netflix");
      expect(result.totalCount).toBe(2);
      expect(result.currentCategory).toBe(Category_Enum.EXTRAS);
      expect(result.transactions).toHaveLength(2);
    });

    it("should handle transaction not found", async () => {
      (db.transactions.get as jest.Mock).mockResolvedValue(null);

      await expect(getTransactionTitleStats("999")).rejects.toThrow(
        "Transaction with ID 999 not found"
      );
    });
  });

  describe("getAllTransactionTitles", () => {
    it("should return all unique transaction titles with counts", async () => {
      (db.transactions.toArray as jest.Mock).mockResolvedValue(
        mockTransactions
      );

      const result = await getAllTransactionTitles();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        title: "Netflix",
        category: Category_Enum.EXTRAS,
        count: 2,
      });
      expect(result[1]).toEqual({
        title: "Different Title",
        category: Category_Enum.GROCERIES,
        count: 1,
      });
    });

    it("should sort by count in descending order", async () => {
      (db.transactions.toArray as jest.Mock).mockResolvedValue(
        mockTransactions
      );

      const result = await getAllTransactionTitles();

      expect(result[0].count).toBeGreaterThan(result[1].count);
    });
  });
});
