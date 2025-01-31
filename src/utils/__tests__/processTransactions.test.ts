import { Category_Enum } from "@/constants";
import { TransactionProcessor } from "../processTransactions";
import { db } from "@/database";

jest.mock("@/database", () => ({
  db: {
    transactions: {
      bulkAdd: jest.fn(),
      bulkPut: jest.fn(),
      toArray: jest.fn(),
      where: jest.fn(() => ({
        notEqual: jest.fn(() => ({
          filter: jest.fn(() => ({
            toArray: jest.fn().mockResolvedValue([]),
          })),
        })),
      })),
      clear: jest.fn(),
    },
  },
}));

describe("TransactionProcessor", () => {
  let processor: TransactionProcessor;
  const mockedDb = db as jest.Mocked<typeof db>;

  beforeEach(() => {
    processor = new TransactionProcessor();
    jest.clearAllMocks();
  });

  test("should process transactions and attempt to link them", async () => {
    const transaction = {
      title: "Transfer to Monthly Norway",
      amount: -1000,
      currency: "NOK",
      date: new Date("2024-10-01"),
      category: Category_Enum.BALANCE_CORRECTION,
      year: 2024,
      referenceAccountId: "monthly_norway",
    };

    await processor.processAndSaveTransactions("main_norway", [transaction]);

    // Verify transaction was added with correct data
    expect(mockedDb.transactions.bulkAdd).toHaveBeenCalledWith([
      expect.objectContaining({
        ...transaction,
        accountId: "main_norway",
        id: expect.any(String),
      }),
    ]);

    // Verify linking was attempted
    expect(mockedDb.transactions.where).toHaveBeenCalledWith(
      "referenceAccountId"
    );
  });

  test("should link matching transactions with correct exchange rates", async () => {
    const trans1 = {
      id: "id1",
      accountId: "account1",
      title: "Send Money",
      amount: -1000,
      currency: "NOK",
      date: new Date("2024-10-01"),
      category: Category_Enum.BALANCE_CORRECTION,
      referenceAccountId: "account2",
      referenceAmount: 12000,
      year: 2024,
    };

    const trans2 = {
      id: "id2",
      accountId: "account2",
      title: "Receive Money",
      amount: 12000,
      currency: "INR",
      date: new Date("2024-10-01"),
      category: Category_Enum.BALANCE_CORRECTION,
      referenceAccountId: "account1",
      referenceAmount: 1000,
      year: 2024,
    };

    // Mock finding potential matches
    // @ts-ignore
    mockedDb.transactions.where.mockReturnValue({
      notEqual: jest.fn().mockReturnValue({
        filter: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([trans1, trans2]),
        }),
      }),
    });

    await processor.processAndSaveTransactions("account1", [trans1]);

    // Verify transactions were linked with correct exchange rates
    expect(mockedDb.transactions.bulkPut).toHaveBeenCalledTimes(1);

    const bulkPutCalls = (mockedDb.transactions.bulkPut as jest.Mock).mock
      .calls[0][0];
    expect(bulkPutCalls).toHaveLength(2);

    // Check both transactions are present with correct exchange rates
    expect(bulkPutCalls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...trans1,
          linkedTransactionId: "id2",
          exchangeRate: 12.0,
        }),
        expect.objectContaining({
          ...trans2,
          linkedTransactionId: "id1",
          exchangeRate: 0.0833,
        }),
      ])
    );
  });
});
