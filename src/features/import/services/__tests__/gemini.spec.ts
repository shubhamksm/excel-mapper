import { CategoryMappingService } from "../gemini";
import { Category_Enum } from "@/constants";
import { TitleRecords } from "../../components/steps/TitleMappingStep";

// Mock the GoogleGenerativeAI
jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn(),
    }),
  })),
}));

describe("CategoryMappingService", () => {
  let service: CategoryMappingService;
  let mockGenerateContent: jest.Mock;

  beforeEach(() => {
    mockGenerateContent = jest.fn();
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    }));
    service = new CategoryMappingService();
  });

  it("should process transactions and return category mappings", async () => {
    const mockTransactions: TitleRecords[] = [
      { title: "REMA 1000", category: Category_Enum.EXTRAS, count: 1 },
      { title: "Netflix", category: Category_Enum.EXTRAS, count: 1 },
    ];

    const mockResponse = {
      response: {
        candidates: [
          {
            content: {
              parts: [
                {
                  functionCall: {
                    args: {
                      transactions: [
                        {
                          title: "REMA 1000",
                          category: Category_Enum.GROCERIES,
                        },
                        { title: "Netflix", category: Category_Enum.EXTRAS },
                      ],
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    };

    mockGenerateContent.mockResolvedValue(mockResponse);

    const result = await service.getCategoryMapping(mockTransactions);

    expect(result).toEqual({
      "REMA 1000": Category_Enum.GROCERIES,
      Netflix: Category_Enum.EXTRAS,
    });
  });

  it("should throw error for empty transactions array", async () => {
    await expect(service.getCategoryMapping([])).rejects.toThrow(
      "Transactions array is empty"
    );
  });

  it("should handle API errors gracefully", async () => {
    const mockTransactions: TitleRecords[] = [
      { title: "REMA 1000", category: Category_Enum.EXTRAS, count: 1 },
    ];

    mockGenerateContent.mockRejectedValue(new Error("API Error"));

    await expect(service.getCategoryMapping(mockTransactions)).rejects.toThrow(
      "Failed to map categories for transactions"
    );
  });

  it("should only process uncategorized transactions", async () => {
    const mockTransactions: TitleRecords[] = [
      { title: "REMA 1000", category: Category_Enum.EXTRAS, count: 1 },
      { title: "Netflix", category: Category_Enum.EXTRAS, count: 1 }, // Already categorized
    ];

    const mockResponse = {
      response: {
        candidates: [
          {
            content: {
              parts: [
                {
                  functionCall: {
                    args: {
                      transactions: [
                        {
                          title: "REMA 1000",
                          category: Category_Enum.GROCERIES,
                        },
                        { title: "Netflix", category: Category_Enum.EXTRAS },
                      ],
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    };

    mockGenerateContent.mockResolvedValue(mockResponse);

    const result = await service.getCategoryMapping(mockTransactions);

    // Verify that the request only included the uncategorized transaction
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: expect.stringContaining("REMA 1000"),
              },
            ],
          },
        ],
      })
    );

    expect(result).toEqual({
      "REMA 1000": Category_Enum.GROCERIES,
      Netflix: Category_Enum.EXTRAS,
    });
  });
});
