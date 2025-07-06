export const TEMPLATE_COLUMNS = [
  "date",
  "amount",
  "category",
  "title",
  "currency",
  "note",
] as const;

export const REQUIRED_TEMPLATE_COLUMNS = ["date", "amount", "title"];

export enum Category_Enum {
  GROCERIES = "GROCERIES",
  SHOPPING = "SHOPPING",
  BILLS_AND_FEES = "BILLS_AND_FEES",
  TRAVEL = "TRAVEL",
  INCOME = "INCOME",
  BALANCE_CORRECTION = "BALANCE_CORRECTION",
  HEALTH = "HEALTH",
  DINING = "DINING",
  EXTRAS = "EXTRAS",
  INVESTMENT = "INVESTMENT",
}

export enum Currency_Enum {
  NOK = "NOK",
  INR = "INR",
  EUR = "EUR",
  USD = "USD",
}

export const CATEGORY_LIST = [
  "GROCERIES",
  "SHOPPING",
  "BILLS_AND_FEES",
  "TRAVEL",
  "INCOME",
  "BALANCE_CORRECTION",
  "HEALTH",
  "DINING",
  "EXTRAS",
  "INVESTMENT",
] as const;

export const DEFAULT_FOLDER_NAME = "EXCEL_MAPPER";

export const DEFAULT_TITLE_MAP_FILE = "TITLE_MAP.json";

export const PathEnum = {
  Dashboard: "/",
  Accounts: "/accounts",
  Transactions: "/transactions",
  Budgets: "/budgets",
  Goals: "/goals",
} as const;

export const Paths = {
  [PathEnum.Dashboard]: "Dashboard",
  [PathEnum.Accounts]: "Accounts",
  [PathEnum.Transactions]: "Transactions",
  [PathEnum.Budgets]: "Budgets",
  [PathEnum.Goals]: "Goals",
};
