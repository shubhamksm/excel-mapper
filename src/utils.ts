import {
  CSV_Data,
  CSV_Record,
  Generic_CSV_Data,
  Headers,
  MappedHeaders,
} from "./types";

export const extractHeaders = (obj: Record<string, unknown>): Headers => {
  return [
    ...new Set(
      Object.keys(obj).filter((key) => typeof obj[key] === "string" && key)
    ),
  ];
};

export const checkIfRequiredColumnsExists = (
  record: Record<string, unknown>,
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
          const rawAmountValue = parseFloat(row[header].replace(",", "."));
          const amountValue = isNaN(rawAmountValue) ? 0 : rawAmountValue;
          if (!mappedRow[mappingHeader]) {
            mappedRow[mappingHeader] = amountValue;
          } else if (typeof mappedRow[mappingHeader] === "number") {
            mappedRow[mappingHeader] += amountValue;
          }
        }
        if (!mappedRow[mappingHeader]) {
          mappedRow[mappingHeader] = row[header];
        }
      }
      result.push(mappedRow);
    }
  }
  return result;
};
