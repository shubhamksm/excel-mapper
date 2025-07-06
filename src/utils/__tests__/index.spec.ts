import { MappedHeaders, Transaction } from "@/types";
import {
  extractHeaders,
  checkIfRequiredColumnsExists,
  mapRowWithHeaders,
  mapRowWithCategory,
  parseAmount,
  groupTransactionsByYear,
} from "../index";
import {
  genericCSVRecord1,
  correctlyExtractedHeaders1,
  genericCSVData1,
  fullyMappedHeaders1,
  partialMappedHeaders1,
} from "@/testData";
import { PreMappedTitles } from "@/features/import/components/steps/TitleMappingStep";
import { Category_Enum } from "@/constants";
import { TitleMappedData } from "@/features/import/store/titleMappingSlice";

describe("Utils", () => {
  describe("extractHeaders", () => {
    it("should extract headers correctly from CSV record", () => {
      const headers = extractHeaders(genericCSVRecord1);
      expect(headers).toEqual(correctlyExtractedHeaders1);
    });

    it("should return unique headers only", () => {
      const recordWithDuplicates = {
        ...genericCSVRecord1,
        Type: "TOPUP", // Duplicate key
      };
      const headers = extractHeaders(recordWithDuplicates);
      expect(headers).toEqual(correctlyExtractedHeaders1);
    });
  });

  describe("checkIfRequiredColumnsExists", () => {
    it("should return true when all required columns exist", () => {
      const result = checkIfRequiredColumnsExists(
        genericCSVRecord1,
        fullyMappedHeaders1
      );
      expect(result).toBe(true);
    });

    it("should return true for partial header mapping", () => {
      const result = checkIfRequiredColumnsExists(
        genericCSVRecord1,
        partialMappedHeaders1
      );
      expect(result).toBe(true);
    });

    it("should return false when required columns are missing", () => {
      const invalidMappedHeaders: MappedHeaders = {
        NonExistentColumn: { column: "date" },
      };
      const result = checkIfRequiredColumnsExists(
        genericCSVRecord1,
        invalidMappedHeaders
      );
      expect(result).toBe(false);
    });
  });

  describe("mapRowWithHeaders", () => {
    it("should map rows correctly with full header mapping", () => {
      const result = mapRowWithHeaders(genericCSVData1, fullyMappedHeaders1);

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        date: new Date("2022-10-04 12:40:58"),
        title: "Card Top-Up",
        amount: 83.99,
      });
    });

    it("should handle amount values with commas correctly", () => {
      const dataWithComma = [
        {
          ...genericCSVRecord1,
          Amount: "1,000.50",
        },
      ];

      const result = mapRowWithHeaders(dataWithComma, fullyMappedHeaders1);

      expect(result[0].amount).toBe(1000.5);
    });

    it("should handle invalid amount values", () => {
      const dataWithInvalidAmount = [
        {
          ...genericCSVRecord1,
          Amount: "invalid",
        },
      ];

      const result = mapRowWithHeaders(
        dataWithInvalidAmount,
        fullyMappedHeaders1
      );

      expect(result[0].amount).toBe(0);
    });

    it("should skip rows with missing required columns", () => {
      const incompleteData = [
        {
          Type: "TOPUP",
          Product: "Current",
          // Missing required columns
        },
        ...genericCSVData1,
      ];

      const result = mapRowWithHeaders(incompleteData, fullyMappedHeaders1);

      expect(result).toHaveLength(4); // Should skip the incomplete row
    });
  });

  describe("mapRowWithCategory", () => {
    const mockTitleMappedData = [
      {
        date: new Date("2022-10-04"),
        title: "CARD TOP UP",
        amount: 83.99,
      },
      {
        date: new Date("2022-10-06"),
        title: "REMA 1000",
        amount: -52.52,
      },
    ] as TitleMappedData;

    const mockPreMappedTitles: PreMappedTitles = {
      "CARD TOP UP": Category_Enum.INCOME,
      REMA: Category_Enum.GROCERIES,
    };

    const mockReferenceAccountMapping: Record<string, string | undefined> = {
      "CARD TOP UP": "account1",
      REMA: "account2",
    };

    it("should map categories correctly to each row", () => {
      const result = mapRowWithCategory(
        mockTitleMappedData,
        mockPreMappedTitles,
        mockReferenceAccountMapping,
        "NOK"
      );

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe(Category_Enum.INCOME);
      expect(result[1].category).toBe(Category_Enum.GROCERIES);
    });

    it("should preserve existing row data while adding category", () => {
      const result = mapRowWithCategory(
        mockTitleMappedData,
        mockPreMappedTitles,
        mockReferenceAccountMapping,
        "NOK"
      );

      expect(result[0]).toEqual({
        date: new Date("2022-10-04"),
        title: "CARD TOP UP",
        amount: 83.99,
        category: Category_Enum.INCOME,
        referenceAccountId: "account1",
        currency: "NOK",
        year: 2022,
      });
    });

    it("should handle empty data array", () => {
      const result = mapRowWithCategory(
        [],
        mockPreMappedTitles,
        mockReferenceAccountMapping,
        "NOK"
      );
      expect(result).toEqual([]);
    });
  });

  describe("parseAmount", () => {
    const testCases = [
      { input: "123.00", expected: 123 },
      { input: "123.00$", expected: 123 },
      { input: "123,00", expected: 123 },
      { input: "123,00NOK", expected: 123 },
      { input: "123.12,40", expected: 12312.4 },
      { input: "123,12.40", expected: 12312.4 },
      { input: "$1,234.56", expected: 1234.56 },
      { input: "1.234,56€", expected: 1234.56 },
      { input: "12,345,678.90", expected: 12345678.9 },
      { input: "12.345.678,90", expected: 12345678.9 },
      { input: "", expected: 0 },
      { input: "$,.", expected: 0 },
      { input: "  123.45  ", expected: 123.45 },
      { input: "123.45.67,00", expected: 1234567 },
      { input: "123,45,67.00", expected: 1234567 },
      { input: "-123.45", expected: -123.45 },
      { input: "(123.45)", expected: -123.45 },
    ];

    testCases.forEach(({ input, expected }) => {
      it(`should correctly parse "${input}" to ${expected}`, () => {
        expect(parseAmount(input)).toBe(expected);
      });
    });
  });

  describe("groupTransactionsByYear", () => {
    const mockTransactions: Transaction[] = [
      {
        id: "1",
        accountId: "account1",
        year: 2022,
        title: "Transaction 1",
        amount: 100,
        currency: "NOK",
        date: new Date("2022-01-01"),
        category: Category_Enum.GROCERIES,
        note: "Test transaction 1",
        exchangeRate: 1,
      },
      {
        id: "2",
        accountId: "account1",
        year: 2023,
        title: "Transaction 2",
        amount: 200,
        currency: "NOK",
        date: new Date("2023-01-01"),
        category: Category_Enum.EXTRAS,
        note: "Test transaction 2",
        exchangeRate: 1,
      },
      {
        id: "3",
        accountId: "account1",
        year: 2022,
        title: "Transaction 3",
        amount: 300,
        currency: "NOK",
        date: new Date("2022-02-01"),
        category: Category_Enum.SHOPPING,
        note: "Test transaction 3",
        exchangeRate: 1,
      },
      {
        id: "4",
        accountId: "account1",
        year: 2023,
        title: "Investment Transaction",
        amount: 1000,
        currency: "NOK",
        date: new Date("2023-03-01"),
        category: Category_Enum.INVESTMENT,
        note: "Test investment transaction",
        exchangeRate: 1,
      },
    ];

    it("should group transactions by year correctly", () => {
      const result = groupTransactionsByYear(mockTransactions);

      expect(result).toHaveProperty("2022");
      expect(result).toHaveProperty("2023");
      expect(result[2022]).toHaveLength(2);
      expect(result[2023]).toHaveLength(2);
    });

    it("should handle transactions with invalid dates", () => {
      const transactionsWithInvalidDate = [
        {
          ...mockTransactions[0],
          date: new Date("invalid-date"),
        },
      ];

      const result = groupTransactionsByYear(transactionsWithInvalidDate);
      expect(result).toEqual({});
    });
  });
});
