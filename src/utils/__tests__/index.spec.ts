import { MappedHeaders } from "@/types";
import {
  extractHeaders,
  checkIfRequiredColumnsExists,
  mapRowWithHeaders,
} from "../index";
import {
  genericCSVRecord1,
  correctlyExtractedHeaders1,
  genericCSVData1,
  fullyMappedHeaders1,
  partialMappedHeaders1,
} from "@/testData";

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
});
