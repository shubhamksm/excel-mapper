import { CATEGORY_LIST, TEMPLATE_COLUMNS } from "./constants";

export type StateAction<T> = React.Dispatch<React.SetStateAction<T>>;

export type Headers = string[];

export type Template_Columns = (typeof TEMPLATE_COLUMNS)[number];

export type Category_Type = (typeof CATEGORY_LIST)[number];

export type MappedHeaders = Record<string, Template_Columns>;

export type Generic_CSV_Record = Record<string, string>;
export type Generic_CSV_Data = Generic_CSV_Record[];

export type CSV_Record = Record<Template_Columns, string | number>;
export type CSV_Data = CSV_Record[];

export enum ExcelMappingScreens {
  UPLOAD_FILE = "UPLOAD_FILE",
  HEADER_MAPPING = "HEADER_MAPPING",
  TITLE_MAPPING = "TITLE_MAPPING",
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  year: number;
  title: string;
  amount: number;
  currency: string;
  date: Date;
  category: string;
  exchangeRate?: number;
  referenceAccountId?: string;
  referenceAmount?: number;
  linkedTransactionId?: string;
}
