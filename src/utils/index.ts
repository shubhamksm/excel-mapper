import numeral from "numeral";

import {
  CSV_Data,
  CSV_Record,
  Generic_CSV_Data,
  Generic_CSV_Record,
  Headers,
  MappedHeaders,
} from "../types";

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
          const amountValue = numeral(row[header]).value() ?? 0;
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
