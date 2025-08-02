import { db } from "@/database";
import { Account, Transaction } from "@/types";

export interface AccountLatestTransaction {
  account: Account;
  latestTransactionDate: Date | null;
  latestTransaction: Transaction | null;
  totalTransactions: number;
}

export class AccountInfoService {
  /**
   * Retrieves the latest transaction information for each account
   * @returns Promise<AccountLatestTransaction[]> Array of account info with latest transaction data
   */
  static async getLatestTransactionPerAccount(): Promise<
    AccountLatestTransaction[]
  > {
    try {
      // Get all accounts
      const accounts = await db.accounts.toArray();

      // For each account, get the latest transaction
      const accountInfoPromises = accounts.map(
        async (account): Promise<AccountLatestTransaction> => {
          // Get all transactions for this account, ordered by date desc
          const transactions = await db.transactions
            .where("accountId")
            .equals(account.id)
            .reverse()
            .sortBy("date");

          const latestTransaction =
            transactions.length > 0 ? transactions[0] : null;

          // Ensure the date is properly converted to a Date object
          let latestTransactionDate: Date | null = null;
          if (latestTransaction?.date) {
            if (latestTransaction.date instanceof Date) {
              latestTransactionDate = latestTransaction.date;
            } else {
              // Try to convert string/number to Date
              try {
                latestTransactionDate = new Date(latestTransaction.date);
                // Validate the converted date
                if (isNaN(latestTransactionDate.getTime())) {
                  console.warn(
                    `Invalid date found for transaction ${latestTransaction.id}:`,
                    latestTransaction.date
                  );
                  latestTransactionDate = null;
                }
              } catch (error) {
                console.error(
                  `Error converting date for transaction ${latestTransaction.id}:`,
                  error
                );
                latestTransactionDate = null;
              }
            }
          }

          return {
            account,
            latestTransactionDate,
            latestTransaction,
            totalTransactions: transactions.length,
          };
        }
      );

      // Wait for all promises to resolve
      const accountInfos = await Promise.all(accountInfoPromises);

      // Sort by account name for consistent display
      return accountInfos.sort((a, b) =>
        a.account.name.localeCompare(b.account.name)
      );
    } catch (error) {
      console.error("Error fetching latest transaction per account:", error);
      throw error;
    }
  }

  /**
   * Formats a date for display in the UI
   * @param date Date to format
   * @returns Formatted date string
   */
  static formatDisplayDate(date: Date | null): string {
    if (!date) return "No transactions";

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid date received:", date);
      return "Invalid date";
    }

    try {
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error, date);
      return "Invalid date";
    }
  }

  /**
   * Gets a user-friendly message about when to start importing from
   * @param latestDate Latest transaction date
   * @returns Formatted message for the user
   */
  static getImportSuggestion(latestDate: Date | null): string {
    if (!latestDate) {
      return "You can import all transactions for this account.";
    }

    // Check if the date is valid
    if (isNaN(latestDate.getTime())) {
      console.warn("Invalid latest date received:", latestDate);
      return "Unable to determine import suggestion due to invalid date.";
    }

    const nextDay = new Date(latestDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Double-check that the calculated next day is also valid
    if (isNaN(nextDay.getTime())) {
      console.warn("Invalid next day calculated:", nextDay);
      return "Unable to calculate next day for import suggestion.";
    }

    const formattedNextDay = this.formatDisplayDate(nextDay);
    return `Consider importing transactions from ${formattedNextDay} onwards.`;
  }
}
