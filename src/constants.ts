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
  NON_GROCERIES = "NON_GROCERIES",
  ENTERTAINMENT = "ENTERTAINMENT",
  SHOPPING = "SHOPPING",
  TRANSIT = "TRANSIT",
  BILLS_AND_FEES = "BILLS_AND_FEES",
  GIFTS = "GIFTS",
  TRAVEL = "TRAVEL",
  INCOME = "INCOME",
  BALANCE_CORRECTION = "BALANCE_CORRECTION",
  HEALTH = "HEALTH",
  DINING = "DINING",
  SALARY = "SALARY",
  EXTRAS = "EXTRAS",
  PERSONAL = "PERSONAL",
  UNCATEGORIZED = "UNCATEGORIZED",
}

export const CATEGORY_LIST = [
  "GROCERIES",
  "NON_GROCERIES",
  "ENTERTAINMENT",
  "SHOPPING",
  "TRANSIT",
  "BILLS_AND_FEES",
  "GIFTS",
  "TRAVEL",
  "INCOME",
  "BALANCE_CORRECTION",
  "HEALTH",
  "DINING",
  "SALARY",
  "EXTRAS",
  "PERSONAL",
  "UNCATEGORIZED",
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
