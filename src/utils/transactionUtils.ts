import { db } from "@/database";
import { Category_Type } from "@/types";
import { normalizeTitle } from "./titleNormalization";

export interface CategoryUpdateResult {
  success: boolean;
  updatedCount: number;
  errors: string[];
}

/**
 * Updates the category of a transaction and all other transactions with the same title
 */
export const updateTransactionCategory = async (
  transactionId: string,
  newCategory: Category_Type
): Promise<CategoryUpdateResult> => {
  const result: CategoryUpdateResult = {
    success: false,
    updatedCount: 0,
    errors: [],
  };

  try {
    // Get the transaction to find its title
    const transaction = await db.transactions.get(transactionId);
    if (!transaction) {
      result.errors.push(`Transaction with ID ${transactionId} not found`);
      return result;
    }

    const transactionTitle = transaction.title;
    const normalizedTitle = normalizeTitle(transactionTitle);

    // Find all transactions with the same normalized title
    const allTransactions = await db.transactions.toArray();
    const transactionsToUpdate = allTransactions.filter(
      (t) => normalizeTitle(t.title) === normalizedTitle
    );

    // Update all matching transactions
    let updatedCount = 0;
    for (const txn of transactionsToUpdate) {
      try {
        await db.transactions.update(txn.id, {
          category: newCategory,
        });
        updatedCount++;
      } catch (error) {
        const errorMsg = `Failed to update transaction ${txn.id}: ${error}`;
        result.errors.push(errorMsg);
      }
    }

    result.updatedCount = updatedCount;
    result.success = true;

    return result;
  } catch (error) {
    const errorMsg = `Category update failed: ${error}`;
    result.errors.push(errorMsg);
    return result;
  }
};

/**
 * Gets statistics about transactions with the same title as a given transaction
 */
export const getTransactionTitleStats = async (transactionId: string) => {
  try {
    const transaction = await db.transactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }

    const normalizedTitle = normalizeTitle(transaction.title);
    const allTransactions = await db.transactions.toArray();
    const transactionsWithSameTitle = allTransactions.filter(
      (t) => normalizeTitle(t.title) === normalizedTitle
    );

    return {
      title: transaction.title,
      normalizedTitle,
      totalCount: transactionsWithSameTitle.length,
      currentCategory: transaction.category,
      transactions: transactionsWithSameTitle,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Gets all unique transaction titles and their current categories
 */
export const getAllTransactionTitles = async () => {
  try {
    const transactions = await db.transactions.toArray();
    const titleMap = new Map<
      string,
      { title: string; category: Category_Type; count: number }
    >();

    for (const transaction of transactions) {
      const normalizedTitle = normalizeTitle(transaction.title);
      const existing = titleMap.get(normalizedTitle);

      if (existing) {
        existing.count++;
      } else {
        titleMap.set(normalizedTitle, {
          title: transaction.title,
          category: transaction.category,
          count: 1,
        });
      }
    }

    return Array.from(titleMap.values()).sort((a, b) => b.count - a.count);
  } catch (error) {
    throw error;
  }
};
