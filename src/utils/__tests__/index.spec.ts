import { CSV_Data, MappedHeaders } from "@/types";
import {
  extractHeaders,
  checkIfRequiredColumnsExists,
  mapRowWithHeaders,
  mapRowWithCategory,
  updatePreMappedTitles,
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
import { PreMappedTitles, TitleRecords } from "@/screens/TitleMappingScreen";

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
        NonExistentColumn: "Date",
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
        Date: "2022-10-04 12:40:58",
        Title: "Card Top-Up",
        Amount: 83.99,
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

      expect(result[0].Amount).toBe(1000.5);
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

      expect(result[0].Amount).toBe(0);
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
        Date: "2022-10-04",
        Title: "Card Top-Up",
        Amount: 83.99,
      },
      {
        Date: "2022-10-06",
        Title: "REMA 1000",
        Amount: -52.52,
      },
    ] as CSV_Data;

    const mockTitleRecords: TitleRecords = {
      "Card Top-Up": { category: "Income", count: 1 },
      "REMA 1000": { category: "Groceries", count: 1 },
    };

    it("should map categories correctly to each row", () => {
      const result = mapRowWithCategory(mockTitleMappedData, mockTitleRecords);

      expect(result).toHaveLength(2);
      expect(result[0].Category).toBe("Income");
      expect(result[1].Category).toBe("Groceries");
    });

    it("should preserve existing row data while adding category", () => {
      const result = mapRowWithCategory(mockTitleMappedData, mockTitleRecords);

      expect(result[0]).toEqual({
        Date: "2022-10-04",
        Title: "Card Top-Up",
        Amount: 83.99,
        Category: "Income",
      });
    });

    it("should handle empty data array", () => {
      const result = mapRowWithCategory([], mockTitleRecords);
      expect(result).toEqual([]);
    });
  });

  describe("updatePreMappedTitles", () => {
    const mockTitleRecords: TitleRecords = {
      "Card Top-Up": { category: "Income", count: 3 },
      "REMA 1000": { category: "Groceries", count: 2 },
      Netflix: { category: "Entertainment", count: 1 },
    };

    it("should convert TitleRecords to PreMappedTitles format", () => {
      const expected: PreMappedTitles = {
        "Card Top-Up": "Income",
        "REMA 1000": "Groceries",
        Netflix: "Entertainment",
      };

      const result = updatePreMappedTitles(mockTitleRecords);
      expect(result).toEqual(expected);
    });

    it("should handle empty title records", () => {
      const result = updatePreMappedTitles({});
      expect(result).toEqual({});
    });

    it("should exclude count property in result", () => {
      const result = updatePreMappedTitles(mockTitleRecords);

      Object.values(result).forEach((value) => {
        expect(typeof value).toBe("string");
        expect(value).not.toHaveProperty("count");
      });
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
        const result = parseAmount(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe("groupTransactionsByYear", () => {
    it("should group transactions by year - Format YYYY-MM-DD", () => {
      const transactions = [
        { Date: "2022-01-01", Amount: 100, Title: "Test1" },
        { Date: "2022-02-01", Amount: 200, Title: "Test2" },
        { Date: "2023-01-01", Amount: 300, Title: "Test3" },
      ] as CSV_Data;

      const result = groupTransactionsByYear(transactions);
      expect(Object.keys(result)).toEqual(["2022", "2023"]);
      expect(result[2022].length).toBe(2);
      expect(result[2023].length).toBe(1);
    });

    it("should group transactions by year - Format DD.MM.YYYY", () => {
      const transactions = [
        { Date: "27.12.2024", Amount: 100, Title: "Test1" },
        { Date: "30.01.2023", Amount: 200, Title: "Test2" },
        { Date: "15.12.2022", Amount: 300, Title: "Test3" },
      ] as CSV_Data;

      const result = groupTransactionsByYear(transactions);
      expect(Object.keys(result)).toEqual(["2022", "2023", "2024"]);
      expect(result[2022].length).toBe(1);
      expect(result[2023].length).toBe(1);
      expect(result[2024].length).toBe(1);
    });
  });
});
