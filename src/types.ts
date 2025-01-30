import { CATEGORY_LIST, TEMPLATE_COLUMNS } from "./constants";

export type StateAction<T> = React.Dispatch<React.SetStateAction<T>>;

export type Headers = string[];
export type MappedHeaders = Record<string, Template_Columns>;

export type Template_Columns = (typeof TEMPLATE_COLUMNS)[number];

export type Category_Type = (typeof CATEGORY_LIST)[number];

export type Generic_CSV_Record = Record<string, string>;
export type Generic_CSV_Data = Generic_CSV_Record[];

export enum ExcelMappingScreens {
  UPLOAD_FILE = "UPLOAD_FILE",
  HEADER_MAPPING = "HEADER_MAPPING",
  TITLE_MAPPING = "TITLE_MAPPING",
}

export interface Transaction {
  id: string;
  accountId: string;
  year: number;
  title: string;
  amount: number;
  currency: string;
  date: Date;
  category: Category_Type;
  note?: string;
  exchangeRate?: number;
  referenceAccountId?: string;
  referenceAmount?: number;
  linkedTransactionId?: string;
}

export enum AccountType {
  MAIN = "MAIN",
  PROXY = "PROXY",
}

export enum AccountSubType {
  SAVINGS = "SAVINGS",
}
export interface Account {
  id: string;
  name: string;
  currency: string;
  balance: number;
  type: AccountType;
  subType: AccountSubType;
  parentAccountId?: string;
}

// {
//   "date": "2024-12-25T23:00:00.000Z",
//   "title": "Vipps:Ruter",
//   "amount": 65.55,
//   "category": "SHOPPING",
//   "year": 2024,
//   "accountId": "cM3JGt7bYZ3YGlLgI14k",
//   "currency": "NOK"
// }

// {
//   "date": "2024-12-19T23:00:00.000Z",
//   "title": "Lyse Tele As",
//   "amount": 414.5,
//   "category": "BILLS_AND_FEES",
//   "year": 2024,
//   "accountId": "cM3JGt7bYZ3YGlLgI14k",
//   "currency": "NOK"
// }
