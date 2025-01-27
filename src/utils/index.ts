import numeral from "numeral";
import { parseISO, parse as parseDate, isValid } from "date-fns";

import {
  CSV_Data,
  CSV_Record,
  Generic_CSV_Data,
  Generic_CSV_Record,
  Headers,
  MappedHeaders,
} from "../types";
import { PreMappedTitles, TitleRecords } from "@/screens/TitleMappingScreen";
import { normalizeTitle } from "./titleNormalization";

export const extractHeaders = (obj: Generic_CSV_Record): Headers => {
  return [
    ...new Set(
      Object.keys(obj).filter((key) => typeof obj[key] === "string" && key)
    ),
  ];
};

export const checkIfRequiredColumnsExists = (
  record: Generic_CSV_Record,
  mappedHeaders: MappedHeaders
) => {
  return Object.keys(mappedHeaders).every((val) => val in record);
};

export const parseAmount = (input: string): number => {
  let cleaned = input.replace(/[^0-9.,()-]/g, "").trim();

  let isNegative = false;
  if (
    cleaned.startsWith("-") ||
    (cleaned.startsWith("(") && cleaned.endsWith(")"))
  ) {
    isNegative = true;
    cleaned = cleaned.replace(/[-()]/g, "");
  }

  const parts = cleaned.split(/[.,]/);
  if (parts.length > 2) {
    const decimalPart = parts.pop();
    cleaned = parts.join("") + "." + decimalPart;
  } else if (cleaned.includes(",")) {
    cleaned = cleaned.replace(/,/g, ".");
  }

  const parsed = numeral(cleaned).value() ?? 0;

  return isNegative ? -parsed : parsed;
};

export const mapRowWithHeaders = (
  parsedFile: Generic_CSV_Data,
  mappedHeaders: MappedHeaders
): CSV_Data => {
  const result: CSV_Data = [];
  for (const row of parsedFile) {
    if (checkIfRequiredColumnsExists(row, mappedHeaders)) {
      const mappedRow = {} as CSV_Record;
      for (const [header, mappingHeader] of Object.entries(mappedHeaders)) {
        if (mappingHeader === "Amount") {
          const amountValue = parseAmount(row[header]);
          if (!mappedRow[mappingHeader]) {
            mappedRow[mappingHeader] = amountValue;
          } else if (typeof mappedRow[mappingHeader] === "number") {
            mappedRow[mappingHeader] += amountValue;
          }
        } else if (!mappedRow[mappingHeader]) {
          mappedRow[mappingHeader] = row[header];
        }
      }
      result.push(mappedRow);
    }
  }
  return result;
};

export const mapRowWithCategory = (
  titleMappedData: CSV_Data,
  mappedTitles: PreMappedTitles
): CSV_Data => {
  return titleMappedData.map((row) => {
    return {
      ...row,
      Category: mappedTitles[normalizeTitle(row.Title as string)],
    };
  });
};

export const updatePreMappedTitles = (
  titleRecords: TitleRecords[]
): PreMappedTitles => {
  const preMappedTitles: PreMappedTitles = {};
  titleRecords.forEach((record) => {
    preMappedTitles[record.title] = record.category;
  });
  return preMappedTitles;
};

export interface TransactionsByYear {
  [year: number]: CSV_Data;
}

export const groupTransactionsByYear = (
  transactions: CSV_Data
): TransactionsByYear => {
  return transactions.reduce((acc: TransactionsByYear, transaction) => {
    try {
      const rawDate = transaction.Date as string;
      let date = parseISO(rawDate);

      // If parseISO fails, try parse with common separators
      if (!isValid(date)) {
        const cleanDate = rawDate.replace(/[./-]/g, "-");
        date = parseDate(cleanDate, "dd-MM-yyyy", new Date());
      }

      if (isValid(date)) {
        const year = date.getFullYear();
        acc[year] = acc[year] || [];
        acc[year].push(transaction);
      } else {
        console.error(`Invalid date format: ${transaction.Date}`);
      }
    } catch (error) {
      console.error(`Failed to parse date: ${transaction.Date}`);
    }
    return acc;
  }, {});
};
