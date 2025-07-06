import numeral from "numeral";
import { parseISO, parse as parseDate, isValid } from "date-fns";

import {
  Category_Type,
  Generic_CSV_Data,
  Generic_CSV_Record,
  Headers,
  MappedHeaders,
  Template_Columns,
  Transaction,
} from "../types";
import {
  PreMappedTitles,
  TitleRecords,
} from "@/features/import/components/steps/TitleMappingStep";
import { normalizeTitle } from "./titleNormalization";
import { Category_Enum, CATEGORY_LIST } from "@/constants";
import { TitleMappedData } from "@/features/import/store/titleMappingSlice";

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

const transformValue = (
  key: Template_Columns,
  value: string
): Category_Type | string | Date | number | undefined => {
  switch (key) {
    case "date":
      return sanitizeDate(value);
    case "amount":
      return parseAmount(value);
    case "category":
      const upperCaseValue = toUpperCaseWithUnderscores(value);
      return CATEGORY_LIST.includes(upperCaseValue as Category_Type)
        ? (upperCaseValue as Category_Type)
        : undefined;
    default:
      return value;
  }
};

export const mapRowWithHeaders = (
  parsedFile: Generic_CSV_Data,
  mappedHeaders: MappedHeaders
): TitleMappedData => {
  const result: TitleMappedData = [];
  for (const row of parsedFile) {
    if (checkIfRequiredColumnsExists(row, mappedHeaders)) {
      const mappedRow = {} as Pick<Transaction, Template_Columns>;
      for (const [
        header,
        { column: mappingHeader, debitOrCredit },
      ] of Object.entries(mappedHeaders)) {
        if (mappingHeader === "amount") {
          let amountValue = parseAmount(row[header]);
          if (debitOrCredit === "debit") {
            amountValue = -amountValue;
          } else if (debitOrCredit === "credit") {
            amountValue = amountValue;
          }
          if (!mappedRow[mappingHeader]) {
            mappedRow[mappingHeader] = amountValue;
          } else if (typeof mappedRow[mappingHeader] === "number") {
            mappedRow[mappingHeader] += amountValue;
          }
        } else if (!mappedRow[mappingHeader]) {
          // @ts-ignore
          mappedRow[mappingHeader] = transformValue(mappingHeader, row[header]);
        }
      }
      result.push(mappedRow);
    }
  }
  return result;
};

// TODO: Add currency and accountId to the transaction
export const mapRowWithCategory = (
  titleMappedData: TitleMappedData,
  categoryMapping: PreMappedTitles,
  referenceAccountMapping: Record<string, string | undefined>,
  currency: string
): Omit<Transaction, "id" | "userId" | "accountId">[] => {
  return titleMappedData.map((row) => {
    return {
      ...row,
      category: categoryMapping[normalizeTitle(row.title as string)],
      referenceAccountId:
        referenceAccountMapping[normalizeTitle(row.title as string)],
      year: row.date.getFullYear(),
      currency: currency,
    };
  });
};

export const updateTitleMappingWithCategoryAndReferenceAccountId = (
  titleRecords: TitleRecords[]
): {
  categoryMapping: PreMappedTitles;
  referenceAccountMapping: Record<string, string | undefined>;
} => {
  const categoryMapping: PreMappedTitles = {};
  const referenceAccountMapping: Record<string, string | undefined> = {};
  titleRecords.forEach((record) => {
    categoryMapping[record.title] = record.category;
    referenceAccountMapping[record.title] = record.referenceAccountId;
  });
  return { categoryMapping, referenceAccountMapping };
};

export interface TransactionsByYear {
  [year: number]: Transaction[];
}

export const sanitizeDate = (rawDate: string) => {
  let date = parseISO(rawDate);
  if (!isValid(date)) {
    const cleanDate = rawDate.replace(/[./-]/g, "-");
    date = parseDate(cleanDate, "dd-MM-yyyy", new Date());
  }
  return date;
};

export const groupTransactionsByYear = (
  transactions: Transaction[]
): TransactionsByYear => {
  return transactions.reduce((acc: TransactionsByYear, transaction) => {
    try {
      const rawDate = transaction.date as unknown as string;
      let date = sanitizeDate(rawDate);

      if (isValid(date)) {
        const year = date.getFullYear();
        acc[year] = acc[year] || [];
        acc[year].push(transaction);
      } else {
        console.error(`Invalid date format: ${transaction.date}`);
      }
    } catch (error) {
      console.error(`Failed to parse date: ${transaction.date}`);
    }
    return acc;
  }, {});
};

export const getTitleRecords = (
  preMappedTitles: PreMappedTitles,
  titleMappedData?: TitleMappedData
) => {
  if (titleMappedData) {
    const _titleRecords: Record<
      string,
      { count: number; category: Category_Type }
    > = {};
    for (const row of titleMappedData) {
      const normalizedTitle = normalizeTitle(row.title as string);
      if (
        _titleRecords[normalizedTitle] &&
        _titleRecords[normalizedTitle].count
      ) {
        _titleRecords[normalizedTitle].count += 1;
      } else {
        _titleRecords[normalizedTitle] = {
          count: 1,
          category: preMappedTitles[normalizedTitle] ?? Category_Enum.EXTRAS,
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

export const toTitleCase = (str: string) => {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const toUpperCaseWithUnderscores = (str: string) => {
  return str.replace(/ /g, "_").toUpperCase();
};

export const formatCurrency = (currency: string, amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};
