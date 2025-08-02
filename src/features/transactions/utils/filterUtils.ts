import { Transaction } from "@/types";
import { TransactionFilters } from "../types/filters";

/**
 * Filters transactions based on the provided filter criteria
 */
export const filterTransactions = (
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] => {
  return transactions.filter((transaction) => {
    // Category filter
    if (!filters.categories.includes(transaction.category)) {
      return false;
    }

    // Search query filter (title-based)
    if (filters.searchQuery.trim()) {
      const searchLower = filters.searchQuery.toLowerCase();
      if (!transaction.title.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Date range filter
    const transactionDate = new Date(transaction.date);
    if (filters.dateRange.from && transactionDate < filters.dateRange.from) {
      return false;
    }
    if (filters.dateRange.to && transactionDate > filters.dateRange.to) {
      return false;
    }

    // Amount range filter
    const absoluteAmount = Math.abs(transaction.amount);
    if (
      filters.amountRange.min !== undefined &&
      absoluteAmount < filters.amountRange.min
    ) {
      return false;
    }
    if (
      filters.amountRange.max !== undefined &&
      absoluteAmount > filters.amountRange.max
    ) {
      return false;
    }

    return true;
  });
};

/**
 * Gets filter summary for display purposes
 */
export const getFilterSummary = (
  filters: TransactionFilters,
  totalTransactions: number,
  filteredCount: number
): string => {
  const parts: string[] = [];

  if (filters.searchQuery.trim()) {
    parts.push(`matching "${filters.searchQuery}"`);
  }

  if (filters.categories.length === 0) {
    parts.push("no categories");
  } else if (filters.categories.length === 1) {
    parts.push(`in ${filters.categories[0].toLowerCase()}`);
  } else if (filters.categories.length < 5) {
    parts.push(`in ${filters.categories.length} categories`);
  }

  if (filters.dateRange.from || filters.dateRange.to) {
    if (filters.dateRange.from && filters.dateRange.to) {
      parts.push(
        `from ${filters.dateRange.from.toLocaleDateString()} to ${filters.dateRange.to.toLocaleDateString()}`
      );
    } else if (filters.dateRange.from) {
      parts.push(`from ${filters.dateRange.from.toLocaleDateString()}`);
    } else if (filters.dateRange.to) {
      parts.push(`until ${filters.dateRange.to.toLocaleDateString()}`);
    }
  }

  if (
    filters.amountRange.min !== undefined ||
    filters.amountRange.max !== undefined
  ) {
    if (
      filters.amountRange.min !== undefined &&
      filters.amountRange.max !== undefined
    ) {
      parts.push(
        `amount ${filters.amountRange.min}-${filters.amountRange.max}`
      );
    } else if (filters.amountRange.min !== undefined) {
      parts.push(`amount ≥ ${filters.amountRange.min}`);
    } else if (filters.amountRange.max !== undefined) {
      parts.push(`amount ≤ ${filters.amountRange.max}`);
    }
  }

  let summary = `Showing ${filteredCount} of ${totalTransactions} transactions`;
  if (parts.length > 0) {
    summary += ` ${parts.join(", ")}`;
  }

  return summary;
};
