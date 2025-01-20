export const TEMPLATE_COLUMNS = [
  "Date",
  "Amount",
  "Category",
  "Title",
  "Note",
  "Account",
] as const;

export const REQUIRED_TEMPLATE_COLUMNS = ["Date", "Amount", "Title"];

export const CATEGORY_LIST = [
  "Groceries",
  "Non Groceries",
  "Entertainment",
  "Shopping",
  "Transit",
  "Bills & Fees",
  "Gifts",
  "Travel",
  "Income",
  "Balance Correction",
  "Health",
  "Dining",
  "Salary",
  "Extras",
  "Uncategorized",
] as const;

export const DEFAULT_FOLDER_NAME = "EXCEL_MAPPER";
