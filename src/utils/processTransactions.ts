class LocalTransactionProcessor {
  private userId: string;
  private transactions: Transaction[] = [];

  constructor(userId: string) {
    this.userId = userId;
  }

  processAndSaveTransactions(
    accountId: string,
    newTransactions: Omit<
      Transaction,
      "id" | "userId" | "linkedTransactionId" | "accountId"
    >[]
  ) {
    // Generate unique transactions with user context
    const processedTransactions = newTransactions.map((transaction) => ({
      ...transaction,
      id: this.generateTransactionId(),
      userId: this.userId,
      accountId,
      linkedTransactionId: null,
    }));

    // Save transactions locally
    this.transactions.push(...processedTransactions);

    // Link transfer transactions
    this.linkTransactions();

    return this.transactions;
  }

  private generateTransactionId(): string {
    return `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
        console.warn(
          `Matching :: ${matchingTransaction.title}|${matchingTransaction.amount} of ${matchingTransaction.accountId} with ${transaction.title}|${transaction.amount} of ${transaction.accountId} having transactionLinkId:${transaction.linkedTransactionId} and matchingTransactionLinkId:${matchingTransaction.linkedTransactionId}`
        );
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

// Example Transaction Interface
interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  year?: number; // need to decide whether we need this or not
  title: string;
  amount: number;
  currency: string;
  date: Date;
  category: string;
  exchangeRate?: number;
  referenceAccountId?: string;
  referenceAmount?: number;
  linkedTransactionId?: string | null;
}

// Usage Example
function testTransactionProcessor() {
  const userId = "user_123";
  const processor = new LocalTransactionProcessor(userId);

  const monthlyNorwayTransactions = [
    {
      title: "Topup from Main Norway",
      amount: 1000,
      currency: "NOK",
      date: new Date("2024-10-01"),
      category: "Transfer",
      referenceAccountId: "main_norway",
    },
    {
      title: "Extra Topup",
      amount: 500,
      currency: "NOK",
      date: new Date("2024-10-22"),
      category: "Transfer",
      referenceAccountId: "main_norway",
    },
  ];

  processor.processAndSaveTransactions(
    "monthly_norway",
    monthlyNorwayTransactions
  );

  // Upload Main Norway transactions
  const mainNorwayTransactions = [
    {
      title: "Transfer to Monthly Norway",
      amount: -1000,
      currency: "NOK",
      date: new Date("2024-10-01"),
      category: "Transfer",
      referenceAccountId: "monthly_norway",
    },
    {
      title: "Extra Topup",
      amount: -500,
      currency: "NOK",
      date: new Date("2024-10-22"),
      category: "Transfer",
      referenceAccountId: "monthly_norway",
    },
    {
      title: "Transfer to Main India",
      amount: -10000,
      currency: "NOK",
      date: new Date("2024-10-15"),
      category: "Transfer",
      referenceAccountId: "main_india",
      referenceAmount: 118000,
    },
    {
      title: "Transfer to Main India",
      amount: -5000,
      currency: "NOK",
      date: new Date("2024-10-20"),
      category: "Transfer",
      referenceAccountId: "main_india",
      referenceAmount: 59000,
    },
    {
      title: "International Transfer",
      amount: -5000,
      currency: "NOK",
      date: new Date("2024-10-18"),
      category: "Transfer",
      referenceAccountId: "multi_currency",
    },
    {
      title: "Transfer to Multi Currency",
      amount: -2500,
      currency: "NOK",
      date: new Date("2024-10-08"),
      category: "Transfer",
      referenceAccountId: "multi_currency",
    },
  ];
  processor.processAndSaveTransactions("main_norway", mainNorwayTransactions);

  // Upload Main India transactions
  const mainIndiaTransactions = [
    {
      title: "Received from Norway",
      amount: 118000,
      currency: "INR",
      date: new Date("2024-10-16"),
      category: "Transfer",
      referenceAccountId: "main_norway",
      referenceAmount: 10000,
    },
    {
      title: "Transfer to Credit Card",
      amount: -5000,
      currency: "INR",
      date: new Date("2024-10-20"),
      category: "Transfer",
      referenceAccountId: "credit_card_india",
    },
    {
      title: "Received from Norway",
      amount: 59000,
      currency: "INR",
      date: new Date("2024-10-20"),
      category: "Transfer",
      referenceAccountId: "main_norway",
      referenceAmount: 5000,
    },
  ];
  processor.processAndSaveTransactions("main_india", mainIndiaTransactions);

  const creditCardIndiaTransactions = [
    {
      title: "Received from Main India",
      amount: 5000,
      currency: "INR",
      date: new Date("2024-10-20"),
      category: "Transfer",
      referenceAccountId: "main_india",
    },
  ];
  processor.processAndSaveTransactions(
    "credit_card_india",
    creditCardIndiaTransactions
  );

  const multiCurrencyTransactions = [
    {
      title: "International Transfer",
      amount: 5000,
      currency: "NOK",
      date: new Date("2024-10-18"),
      category: "Transfer",
      referenceAccountId: "main_norway",
    },
    {
      title: "Transfer to Main Norway",
      amount: 2500,
      currency: "NOK",
      date: new Date("2024-10-08"),
      category: "Transfer",
      referenceAccountId: "main_norway",
    },
  ];
  processor.processAndSaveTransactions(
    "multi_currency",
    multiCurrencyTransactions
  );

  // Retrieve and log transactions
  const processedTrans = processor.getTransactions();
  console.log(
    "All Transactions:",
    processedTrans,
    "Length : ",
    processedTrans.length
  );
}

// Run the test
testTransactionProcessor();
