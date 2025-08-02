import {
  Account,
  Transaction,
  AccountType,
  AccountSubType,
} from "../../src/types";
import { Category_Enum } from "../../src/constants";

// Test accounts representing different countries and currencies
export const TEST_ACCOUNTS: Account[] = [
  {
    id: "test-norway-001",
    name: "test-norway",
    currency: "NOK",
    balance: 50000,
    type: AccountType.MAIN,
    subType: AccountSubType.SAVINGS,
  },
  {
    id: "test-india-001",
    name: "test-india",
    currency: "INR",
    balance: 250000,
    type: AccountType.MAIN,
    subType: AccountSubType.SAVINGS,
  },
  {
    id: "test-savings-001",
    name: "test-savings",
    currency: "EUR",
    balance: 15000,
    type: AccountType.MAIN,
    subType: AccountSubType.SAVINGS,
  },
];

// Sample transactions with various categories - Norway account
export const NORWAY_TRANSACTIONS: Omit<Transaction, "id" | "accountId">[] = [
  {
    year: 2024,
    title: "Rema 1000 Groceries",
    amount: -450.5,
    currency: "NOK",
    date: new Date("2024-01-15"),
    category: Category_Enum.GROCERIES,
    note: "Weekly grocery shopping",
  },
  {
    year: 2024,
    title: "Netflix Subscription",
    amount: -149,
    currency: "NOK",
    date: new Date("2024-01-01"),
    category: Category_Enum.BILLS_AND_FEES,
  },
  {
    year: 2024,
    title: "Salary Deposit",
    amount: 45000,
    currency: "NOK",
    date: new Date("2024-01-01"),
    category: Category_Enum.INCOME,
  },
  {
    year: 2024,
    title: "H&M Shopping",
    amount: -899,
    currency: "NOK",
    date: new Date("2024-01-20"),
    category: Category_Enum.SHOPPING,
  },
  // Balance correction transaction - sending money to India
  {
    year: 2024,
    title: "Transfer to India Family",
    amount: -12000,
    currency: "NOK",
    date: new Date("2024-01-25"),
    category: Category_Enum.BALANCE_CORRECTION,
    referenceAccountId: "test-india-001",
    referenceAmount: 120000, // ~10 NOK = 100 INR exchange rate
    note: "Family support transfer",
  },
];

// Sample transactions for India account
export const INDIA_TRANSACTIONS: Omit<Transaction, "id" | "accountId">[] = [
  {
    year: 2024,
    title: "Big Bazaar Groceries",
    amount: -2500,
    currency: "INR",
    date: new Date("2024-01-16"),
    category: Category_Enum.GROCERIES,
  },
  {
    year: 2024,
    title: "Swiggy Food Delivery",
    amount: -850,
    currency: "INR",
    date: new Date("2024-01-18"),
    category: Category_Enum.DINING,
  },
  {
    year: 2024,
    title: "Freelance Payment",
    amount: 35000,
    currency: "INR",
    date: new Date("2024-01-05"),
    category: Category_Enum.INCOME,
  },
  {
    year: 2024,
    title: "Apollo Pharmacy",
    amount: -1200,
    currency: "INR",
    date: new Date("2024-01-22"),
    category: Category_Enum.HEALTH,
  },
  // Balance correction transaction - receiving money from Norway
  {
    year: 2024,
    title: "International Transfer from Norway",
    amount: 120000,
    currency: "INR",
    date: new Date("2024-01-26"), // 1 day later due to transfer time
    category: Category_Enum.BALANCE_CORRECTION,
    referenceAccountId: "test-norway-001",
    referenceAmount: 12000, // Original NOK amount
    note: "Family support received",
  },
];

// Sample transactions for EUR savings account
export const EUR_TRANSACTIONS: Omit<Transaction, "id" | "accountId">[] = [
  {
    year: 2024,
    title: "Investment Deposit",
    amount: 5000,
    currency: "EUR",
    date: new Date("2024-01-10"),
    category: Category_Enum.INVESTMENT,
  },
  {
    year: 2024,
    title: "Travel Insurance",
    amount: -120,
    currency: "EUR",
    date: new Date("2024-01-15"),
    category: Category_Enum.TRAVEL,
  },
];

// CSV data for testing Excel import - Norway transactions
export const NORWAY_CSV_DATA = [
  {
    Date: "2024-02-01",
    Description: "ICA Supermarket",
    Amount: "-520.75",
    Category: "",
  },
  {
    Date: "2024-02-02",
    Description: "Spotify Premium",
    Amount: "-99",
    Category: "",
  },
  {
    Date: "2024-02-05",
    Description: "Salary February",
    Amount: "47000",
    Category: "",
  },
  {
    Date: "2024-02-15",
    Description: "Transfer to India Emergency",
    Amount: "-8000",
    Category: "",
  },
];

// CSV data for India transactions that includes matching balance correction
export const INDIA_CSV_DATA = [
  {
    Date: "2024-02-03",
    Description: "Metro Cash & Carry",
    Amount: "-3200",
    Category: "",
  },
  {
    Date: "2024-02-04",
    Description: "Zomato Order",
    Amount: "-750",
    Category: "",
  },
  {
    Date: "2024-02-16", // Day after Norway transfer
    Description: "International Transfer from Norway Emergency",
    Amount: "80000", // ~8000 NOK at 10:1 rate
    Category: "",
  },
];

// Helper to convert CSV data to different header formats for testing
export const CSV_WITH_DIFFERENT_HEADERS = {
  // Standard format
  standard: NORWAY_CSV_DATA,

  // Alternative header names
  alternative: NORWAY_CSV_DATA.map((row) => ({
    "Transaction Date": row.Date,
    "Transaction Description": row.Description,
    "Debit/Credit": row.Amount,
    Type: row.Category,
  })),

  // Bank-specific format
  bankFormat: NORWAY_CSV_DATA.map((row) => ({
    "Posted Date": row.Date,
    Payee: row.Description,
    "Amount (NOK)": row.Amount,
    Balance: "", // Banks often include running balance
  })),
};

// Test data for category mapping
export const EXPECTED_CATEGORY_MAPPINGS = {
  "ICA Supermarket": Category_Enum.GROCERIES,
  "Rema 1000 Groceries": Category_Enum.GROCERIES,
  "Big Bazaar Groceries": Category_Enum.GROCERIES,
  "Metro Cash & Carry": Category_Enum.GROCERIES,

  "Netflix Subscription": Category_Enum.BILLS_AND_FEES,
  "Spotify Premium": Category_Enum.BILLS_AND_FEES,

  "Salary Deposit": Category_Enum.INCOME,
  "Salary February": Category_Enum.INCOME,
  "Freelance Payment": Category_Enum.INCOME,

  "H&M Shopping": Category_Enum.SHOPPING,

  "Swiggy Food Delivery": Category_Enum.DINING,
  "Zomato Order": Category_Enum.DINING,

  "Apollo Pharmacy": Category_Enum.HEALTH,

  "Travel Insurance": Category_Enum.TRAVEL,

  "Investment Deposit": Category_Enum.INVESTMENT,

  // Balance correction transactions
  "Transfer to India Family": Category_Enum.BALANCE_CORRECTION,
  "Transfer to India Emergency": Category_Enum.BALANCE_CORRECTION,
  "International Transfer from Norway": Category_Enum.BALANCE_CORRECTION,
  "International Transfer from Norway Emergency":
    Category_Enum.BALANCE_CORRECTION,
};

// Account mappings for balance correction testing
export const BALANCE_CORRECTION_MAPPINGS = {
  "Transfer to India Family": "test-india-001",
  "Transfer to India Emergency": "test-india-001",
  "International Transfer from Norway": "test-norway-001",
  "International Transfer from Norway Emergency": "test-norway-001",
};
