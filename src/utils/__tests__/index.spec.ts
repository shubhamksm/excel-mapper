import { MappedHeaders, Transaction } from "@/types";
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
import {
  PreMappedTitles,
  TitleRecords,
} from "@/features/import/components/steps/TitleMappingStep";
import { normalizeTitle } from "../titleNormalization";
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
        NonExistentColumn: "date",
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
        title: "Card Top-Up",
        amount: 83.99,
      },
      {
        date: new Date("2022-10-06"),
        title: "REMA 1000",
        amount: -52.52,
      },
    ] as TitleMappedData;

    const mockTitleRecords: PreMappedTitles = {
      [normalizeTitle("Card Top-Up")]: Category_Enum.INCOME,
      [normalizeTitle("REMA 1000")]: Category_Enum.GROCERIES,
    };

    it("should map categories correctly to each row", () => {
      const result = mapRowWithCategory(
        mockTitleMappedData,
        mockTitleRecords,
        "account1",
        "NOK"
      );

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe(Category_Enum.INCOME);
      expect(result[1].category).toBe(Category_Enum.GROCERIES);
    });

    it("should preserve existing row data while adding category", () => {
      const result = mapRowWithCategory(
        mockTitleMappedData,
        mockTitleRecords,
        "account1",
        "NOK"
      );

      expect(result[0]).toEqual({
        date: new Date("2022-10-04"),
        title: "Card Top-Up",
        amount: 83.99,
        category: Category_Enum.INCOME,
        accountId: "account1",
        currency: "NOK",
        year: 2022,
      });
    });

    it("should handle empty data array", () => {
      const result = mapRowWithCategory(
        [],
        mockTitleRecords,
        "account1",
        "NOK"
      );
      expect(result).toEqual([]);
    });
  });

  describe("updatePreMappedTitles", () => {
    const mockTitleRecords: TitleRecords[] = [
      { title: "Card Top-Up", category: Category_Enum.INCOME, count: 1 },
      { title: "REMA 1000", category: Category_Enum.GROCERIES, count: 1 },
      { title: "Netflix", category: Category_Enum.ENTERTAINMENT, count: 1 },
    ];

    it("should convert TitleRecords to PreMappedTitles format", () => {
      const expected: PreMappedTitles = {
        "Card Top-Up": Category_Enum.INCOME,
        "REMA 1000": Category_Enum.GROCERIES,
        Netflix: Category_Enum.ENTERTAINMENT,
      };

      const result = updatePreMappedTitles(mockTitleRecords);
      expect(result).toEqual(expected);
    });

    it("should handle empty title records", () => {
      const result = updatePreMappedTitles([]);
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
        { date: "2022-01-01", amount: 100, title: "Test1" },
        { date: "2022-02-01", amount: 200, title: "Test2" },
        { date: "2023-01-01", amount: 300, title: "Test3" },
      ] as unknown as Transaction[];

      const result = groupTransactionsByYear(transactions);
      expect(Object.keys(result)).toEqual(["2022", "2023"]);
      expect(result[2022].length).toBe(2);
      expect(result[2023].length).toBe(1);
    });

    it("should group transactions by year - Format DD.MM.YYYY", () => {
      const transactions = [
        { date: "27.12.2024", amount: 100, title: "Test1" },
        { date: "30.01.2023", amount: 200, title: "Test2" },
        { date: "15.12.2022", amount: 300, title: "Test3" },
      ] as unknown as Transaction[];

      const result = groupTransactionsByYear(transactions);
      expect(Object.keys(result)).toEqual(["2022", "2023", "2024"]);
      expect(result[2022].length).toBe(1);
      expect(result[2023].length).toBe(1);
      expect(result[2024].length).toBe(1);
    });
  });
});
