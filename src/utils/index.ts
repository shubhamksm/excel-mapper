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
  let cleaned = input
    .replace(/[^0-9.,()-]/g, "") // Remove non-numeric characters except `.,-()`
    .trim();

  // Step 2: Handle negative numbers
  let isNegative = false;
  if (
    cleaned.startsWith("-") ||
    (cleaned.startsWith("(") && cleaned.endsWith(")"))
  ) {
    isNegative = true;
    cleaned = cleaned.replace(/[-()]/g, ""); // Remove negative indicators
  }

  // Step 3: Handle multiple decimal points
  const parts = cleaned.split(/[.,]/);
  if (parts.length > 2) {
    const decimalPart = parts.pop(); // Assume the last segment is the decimal part
    cleaned = parts.join("") + "." + decimalPart; // Rebuild the number
  } else if (cleaned.includes(",")) {
    // Only commas, treat as decimal separator
    cleaned = cleaned.replace(/,/g, ".");
  }

  // Step 4: Parse with Numeral.js
  const parsed = numeral(cleaned).value() ?? 0;

  // Step 5: Apply negative sign if needed
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
  titleRecords: TitleRecords
): CSV_Data => {
  return titleMappedData.map((row) => {
    return {
      ...row,
      Category: titleRecords[row.Title].category,
    };
  });
};

export const updatePreMappedTitles = (
  titleRecords: TitleRecords
): PreMappedTitles => {
  return Object.fromEntries(
    Object.entries(titleRecords).map(([title, { category }]) => [
      title,
      category,
    ])
  );
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
