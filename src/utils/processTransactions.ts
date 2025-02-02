import { Transaction } from "@/types";
import { db } from "@/database";

export class TransactionProcessor {
  async processAndSaveTransactions(
    accountId: string,
    newTransactions: Omit<
      Transaction,
      "id" | "linkedTransactionId" | "accountId"
    >[]
  ) {
    const processedTransactions = newTransactions.map((transaction) => ({
      ...transaction,
      id: this.generateTransactionId({
        accountId,
        date: transaction.date,
        amount: transaction.amount,
        currency: transaction.currency,
        year: transaction.year,
        title: transaction.title,
      }),
      accountId,
    }));

    try {
      await db.transactions.bulkAdd(processedTransactions);
    } catch (error) {
      console.error("Failed to bulk add transactions:", error);
    }
    await this.linkTransactions();

    return processedTransactions;
  }

  private generateTransactionId({
    accountId,
    date,
    amount,
    currency,
    year,
    title,
  }: {
    accountId: string;
    date: Date;
    amount: number;
    currency: string;
    year: number;
    title: string;
  }): string {
    return `id_${accountId}_${date.getTime()}_${amount}_${currency}_${year}_${title}`;
  }

  private isWithinFiveDays(date1: Date, date2: Date) {
    const differenceInTime = Math.abs(date2.getTime() - date1.getTime());
    const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24);
    return differenceInDays <= 5;
  }

  private checkMultiCurrency(source: Transaction, target: Transaction) {
    return target.currency === source.currency
      ? Math.abs(target.amount) === Math.abs(source.amount)
      : this.isWithinFiveDays(target.date, source.date) &&
          source.referenceAmount &&
          Math.abs(target.amount) === Math.abs(source.referenceAmount);
  }

  private async linkTransactions() {
    const transferTransactions = await db.transactions
      .where("referenceAccountId")
      .notEqual("")
      .filter((t) => t.referenceAccountId !== undefined)
      .toArray();

    const updates: Transaction[] = [];
    const processedIds = new Set<string>();

    for (const transaction of transferTransactions) {
      if (transaction.linkedTransactionId || processedIds.has(transaction.id))
        continue;

      const matchingTransaction = transferTransactions.find(
        (t) =>
          t.accountId === transaction.referenceAccountId &&
          t.referenceAccountId === transaction.accountId &&
          t.id !== transaction.id &&
          !t.linkedTransactionId &&
          !processedIds.has(t.id) &&
          this.checkMultiCurrency(transaction, t)
      );

      if (matchingTransaction) {
        const transactionExchangeRate =
          transaction.amount !== 0
            ? Number(
                Math.abs(
                  matchingTransaction.amount / transaction.amount
                ).toFixed(4)
              )
            : 1;

        const matchingTransactionExchangeRate =
          matchingTransaction.amount !== 0
            ? Number(
                Math.abs(
                  transaction.amount / matchingTransaction.amount
                ).toFixed(4)
              )
            : 1;

        processedIds.add(transaction.id);
        processedIds.add(matchingTransaction.id);

        updates.push(
          {
            ...transaction,
            linkedTransactionId: matchingTransaction.id,
            exchangeRate: transactionExchangeRate,
          },
          {
            ...matchingTransaction,
            linkedTransactionId: transaction.id,
            exchangeRate: matchingTransactionExchangeRate,
          }
        );
      }
    }

    if (updates.length > 0) {
      await db.transactions.bulkPut(updates);
    }
  }
}

export const transactionProcessor = new TransactionProcessor();
