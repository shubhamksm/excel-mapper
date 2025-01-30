import { Category_Enum } from "@/constants";
import { LocalTransactionProcessor } from "../processTransactions";

describe("LocalTransactionProcessor", () => {
  let processor: LocalTransactionProcessor;

  beforeEach(() => {
    processor = new LocalTransactionProcessor();
  });

  test("should process and link transactions correctly", () => {
    // Monthly Norway transactions
    const monthlyNorwayTransactions = [
      {
        title: "Topup from Main Norway",
        amount: 1000,
        currency: "NOK",
        date: new Date("2024-10-01"),
        year: 2024,
        category: Category_Enum.BALANCE_CORRECTION,
        referenceAccountId: "main_norway",
      },
      {
        title: "Extra Topup",
        amount: 500,
        currency: "NOK",
        date: new Date("2024-10-22"),
        year: 2024,
        category: Category_Enum.BALANCE_CORRECTION,
        referenceAccountId: "main_norway",
      },
    ];

    processor.processAndSaveTransactions(
      "monthly_norway",
      monthlyNorwayTransactions
    );

    // Main Norway transactions
    const mainNorwayTransactions = [
      {
        title: "Transfer to Monthly Norway",
        amount: -1000,
        currency: "NOK",
        date: new Date("2024-10-01"),
        category: Category_Enum.BALANCE_CORRECTION,
        year: 2024,
        referenceAccountId: "monthly_norway",
      },
      {
        title: "Extra Topup",
        amount: -500,
        currency: "NOK",
        date: new Date("2024-10-22"),
        category: Category_Enum.BALANCE_CORRECTION,
        year: 2024,
        referenceAccountId: "monthly_norway",
      },
      {
        title: "Transfer to Main India",
        amount: -10000,
        currency: "NOK",
        date: new Date("2024-10-15"),
        category: Category_Enum.BALANCE_CORRECTION,
        year: 2024,
        referenceAccountId: "main_india",
        referenceAmount: 118000,
      },
    ];

    processor.processAndSaveTransactions("main_norway", mainNorwayTransactions);

    // Main India transactions
    const mainIndiaTransactions = [
      {
        title: "Received from Norway",
        amount: 118000,
        currency: "INR",
        date: new Date("2024-10-16"),
        category: Category_Enum.INCOME,
        referenceAccountId: "main_norway",
        referenceAmount: 10000,
        year: 2024,
      },
    ];

    processor.processAndSaveTransactions("main_india", mainIndiaTransactions);

    const allTransactions = processor.getTransactions();

    // Test total number of transactions
    expect(allTransactions.length).toBe(6);

    // Test transaction linking for same currency (NOK to NOK)
    const monthlyNorwayTrans =
      processor.getTransactionsByAccount("monthly_norway");
    const mainNorwayTrans = processor.getTransactionsByAccount("main_norway");

    expect(monthlyNorwayTrans[0].linkedTransactionId).toBeDefined();
    expect(mainNorwayTrans[0].linkedTransactionId).toBeDefined();
    expect(monthlyNorwayTrans[0].linkedTransactionId).toBe(
      mainNorwayTrans[0].id
    );
    expect(mainNorwayTrans[0].linkedTransactionId).toBe(
      monthlyNorwayTrans[0].id
    );

    // Test transaction linking for different currencies (NOK to INR)
    const mainIndiaTrans = processor.getTransactionsByAccount("main_india");
    const nokToInrTransaction = mainNorwayTrans.find(
      (t) => t.referenceAmount === 118000
    );
    const inrTransaction = mainIndiaTrans[0];

    expect(nokToInrTransaction?.linkedTransactionId).toBe(inrTransaction.id);
    expect(inrTransaction.linkedTransactionId).toBe(nokToInrTransaction?.id);

    // Test exchange rates
    expect(inrTransaction.exchangeRate).toBeCloseTo(0.0847, 4); // 10000/118000 (NOK/INR)
    expect(nokToInrTransaction?.exchangeRate).toBe(11.8); // 118000/10000 (INR/NOK)
  });

  test("should not link transactions with different amounts in same currency", () => {
    const trans1 = [
      {
        title: "Send Money",
        amount: 1000,
        currency: "NOK",
        date: new Date("2024-10-01"),
        category: Category_Enum.BALANCE_CORRECTION,
        referenceAccountId: "account2",
        year: 2024,
      },
    ];

    const trans2 = [
      {
        title: "Receive Money",
        amount: 900, // Different amount
        currency: "NOK",
        date: new Date("2024-10-01"),
        category: Category_Enum.BALANCE_CORRECTION,
        referenceAccountId: "account1",
        year: 2024,
      },
    ];

    processor.processAndSaveTransactions("account1", trans1);
    processor.processAndSaveTransactions("account2", trans2);

    const allTransactions = processor.getTransactions();
    expect(allTransactions[0].linkedTransactionId).toBeUndefined();
    expect(allTransactions[1].linkedTransactionId).toBeUndefined();
  });

  test("should link transactions within 5 days for different currencies", () => {
    const trans1 = [
      {
        title: "Send Money",
        amount: -1000,
        currency: "NOK",
        date: new Date("2024-10-01"),
        category: Category_Enum.BALANCE_CORRECTION,
        referenceAccountId: "account2",
        referenceAmount: 12000,
        year: 2024,
      },
    ];

    const trans2 = [
      {
        title: "Receive Money",
        amount: 12000,
        currency: "INR",
        date: new Date("2024-10-04"), // Within 5 days
        category: Category_Enum.BALANCE_CORRECTION,
        referenceAccountId: "account1",
        referenceAmount: 1000,
        year: 2024,
      },
    ];

    processor.processAndSaveTransactions("account1", trans1);
    processor.processAndSaveTransactions("account2", trans2);

    const allTransactions = processor.getTransactions();
    expect(allTransactions[0].linkedTransactionId).toBe(allTransactions[1].id);
    expect(allTransactions[1].linkedTransactionId).toBe(allTransactions[0].id);
  });
});
