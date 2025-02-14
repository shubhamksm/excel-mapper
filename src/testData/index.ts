import {
  Generic_CSV_Data,
  Generic_CSV_Record,
  Headers,
  MappedHeaders,
} from "@/types";

export const parsedFile1: Generic_CSV_Data = [
  {
    Type: "TOPUP",
    Product: "Current",
    "Started Date": "2022-10-04 12:40:58",
    "Completed Date": "2022-10-04 12:42:41",
    Description: "Card Top-Up",
    Amount: "83.99",
    Fee: "0.00",
    Currency: "NOK",
    State: "COMPLETED",
    Balance: "83.99",
  },
  {
    Type: "CARD_PAYMENT",
    Product: "Current",
    "Started Date": "2022-10-06 13:06:09",
    "Completed Date": "2022-10-08 16:27:29",
    Description: "REMA 1000 LAKKEGATA",
    Amount: "-52.52",
    Fee: "0.00",
    Currency: "NOK",
    State: "COMPLETED",
    Balance: "1947.48",
  },
  {
    Type: "TRANSFER",
    Product: "Savings",
    "Started Date": "2022-10-09 09:15:00",
    "Completed Date": "2022-10-09 09:16:30",
    Description: "Transfer to Savings",
    Amount: "-500.00",
    Fee: "0.00",
    Currency: "NOK",
    State: "COMPLETED",
    Balance: "1447.48",
  },
  {
    Type: "ATM_WITHDRAWAL",
    Product: "Current",
    "Started Date": "2022-10-10 14:20:00",
    "Completed Date": "2022-10-10 14:21:15",
    Description: "ATM Withdrawal",
    Amount: "-200.00",
    Fee: "2.00",
    Currency: "NOK",
    State: "COMPLETED",
    Balance: "1245.48",
  },
];

export const genericCSVData1: Generic_CSV_Data = parsedFile1;

export const genericCSVRecord1: Generic_CSV_Record = parsedFile1[0];

export const correctlyExtractedHeaders1: Headers = [
  "Type",
  "Product",
  "Started Date",
  "Completed Date",
  "Description",
  "Amount",
  "Fee",
  "Currency",
  "State",
  "Balance",
];

export const fullyMappedHeaders1: MappedHeaders = {
  ["Started Date"]: "date",
  ["Description"]: "title",
  ["Amount"]: "amount",
};

export const partialMappedHeaders1: MappedHeaders = {
  ["Started Date"]: "date",
  ["Description"]: "title",
};
