import numeral from "numeral";
import { parseISO, parse as parseDate, isValid } from "date-fns";

import {
  Category_Type,
  CSV_Data,
  CSV_Record,
  Generic_CSV_Data,
  Generic_CSV_Record,
  Headers,
  MappedHeaders,
} from "../types";
import {
  PreMappedTitles,
  TitleRecords,
} from "@/features/import/components/steps/TitleMappingStep";
import { normalizeTitle } from "./titleNormalization";
import { DEFAULT_TITLE_MAP_FILE } from "@/constants";
import { getJsonFileByName, readJsonFileContent } from "@/services/drive";
import { createJsonFile } from "@/services/drive";

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

export const getTitleRecords = (
  preMappedTitles: PreMappedTitles,
  titleMappedData?: CSV_Data
) => {
  if (titleMappedData) {
    const _titleRecords: Record<
      string,
      { count: number; category: Category_Type }
    > = {};
    for (const row of titleMappedData) {
      const normalizedTitle = normalizeTitle(row.Title as string);
      if (
        _titleRecords[normalizedTitle] &&
        _titleRecords[normalizedTitle].count
      ) {
        _titleRecords[normalizedTitle].count += 1;
      } else {
        _titleRecords[normalizedTitle] = {
          count: 1,
          category: preMappedTitles[normalizedTitle] ?? "Uncategorized",
        };
      }
    }
    const finalList = Object.keys(_titleRecords).map((key) => {
      return {
        title: key,
        count: _titleRecords[key].count,
        category: _titleRecords[key].category,
      };
    });
    return finalList;
  }
  return [];
};

export const getPreMappedTitles = async (
  rootFolderId: string
): Promise<
  | {
      fileId: string;
      data: PreMappedTitles;
    }
  | undefined
> => {
  const titleMapFileId = await getJsonFileByName(DEFAULT_TITLE_MAP_FILE);
  if (titleMapFileId) {
    const titleMap =
      (await readJsonFileContent<PreMappedTitles>(titleMapFileId)) ?? {};
    return {
      fileId: titleMapFileId,
      data: titleMap,
    };
  }
  const newTitleMapFileId = await createJsonFile(
    DEFAULT_TITLE_MAP_FILE,
    {},
    rootFolderId
  );
  if (newTitleMapFileId) {
    return {
      fileId: newTitleMapFileId,
      data: {},
    };
  }
};
