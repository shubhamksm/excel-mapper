import { Transaction } from "@/types";

export class LocalTransactionProcessor {
  private transactions: Transaction[] = [];

  processAndSaveTransactions(
    accountId: string,
    newTransactions: Omit<
      Transaction,
      "id" | "linkedTransactionId" | "accountId"
    >[]
  ) {
    const processedTransactions = newTransactions.map((transaction) => ({
      ...transaction,
      id: this.generateRandomId(),
      accountId,
    }));

    // Save transactions locally
    this.transactions.push(...processedTransactions);

    // Link transfer transactions
    this.linkTransactions();

    return this.transactions;
  }

  private generateRandomId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isWithinFiveDays(date1: Date, date2: Date) {
    // @ts-ignore
    const differenceInTime = Math.abs(date2 - date1); // Get the absolute difference in milliseconds
    const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24); // Convert milliseconds to days

    return differenceInDays <= 5; // Return true if the difference is within 5 days
  }

  private checkMultiCurrency(source: Transaction, target: Transaction) {
    return target.currency === source.currency
      ? Math.abs(target.amount) === Math.abs(source.amount)
      : this.isWithinFiveDays(target.date, source.date) &&
          source.referenceAmount &&
          Math.abs(target.amount) === Math.abs(source.referenceAmount);
  }

  private linkTransactions() {
    // Fetch transfer transactions
    const transferTransactions = this.transactions.filter(
      (t) => t.referenceAccountId
    );

    // Find and link transactions
    for (const transaction of transferTransactions) {
      const matchingTransaction = transferTransactions.find(
        (t) =>
          t.accountId === transaction.referenceAccountId &&
          t.referenceAccountId === transaction.accountId &&
          t.id !== transaction.id &&
          !transaction.linkedTransactionId &&
          this.checkMultiCurrency(transaction, t)
      );

      if (matchingTransaction) {
        // Update both transactions with linked IDs
        transaction.linkedTransactionId = matchingTransaction.id;
        matchingTransaction.linkedTransactionId = transaction.id;

        const transactionExchangeRate =
          transaction.amount !== 0
            ? Math.abs(matchingTransaction.amount / transaction.amount)
            : 1;

        const matchingTransactionExchangeRate =
          matchingTransaction.amount !== 0
            ? Math.abs(transaction.amount / matchingTransaction.amount)
            : 1;

        transaction.exchangeRate = transactionExchangeRate;
        matchingTransaction.exchangeRate = matchingTransactionExchangeRate;
      }
    }
  }

  // Utility methods for testing and retrieval
  getTransactions(): Transaction[] {
    return this.transactions;
  }

  getTransactionsByAccount(accountId: string): Transaction[] {
    return this.transactions.filter((t) => t.accountId === accountId);
  }
}
