import { CategoryMappingService } from "../gemini";
import { CATEGORY_LIST } from "@/constants";
import { TitleRecords } from "@/features/import/components/steps/TitleMappingStep";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Mock the Google Generative AI package
jest.mock("@google/generative-ai");

describe("CategoryMappingService", () => {
  let service: CategoryMappingService;
  let mockGenerateContent: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateContent = jest.fn();
    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent,
      }),
    }));
    service = new CategoryMappingService();
  });

  it("should successfully map categories from API response", async () => {
    const titleRecords: TitleRecords[] = [
      { title: "REMA 1000", category: "Uncategorized", count: 1 },
      { title: "Netflix", category: "Uncategorized", count: 1 },
    ];

    // Mock successful API response
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        candidates: [
          {
            content: {
              parts: [
                {
                  functionCall: {
                    args: {
                      transactions: [
                        { title: "REMA 1000", category: "Groceries" },
                        { title: "Netflix", category: "Entertainment" },
                      ],
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    });

    const result = await service.getCategoryMapping(titleRecords);

    // Verify the result
    expect(result).toEqual({
      "REMA 1000": "Groceries",
      Netflix: "Entertainment",
    });

    // Verify generateContent was called with correct parameters
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        contents: expect.arrayContaining([
          expect.objectContaining({
            role: "user",
            parts: expect.arrayContaining([
              expect.objectContaining({
                text: expect.stringContaining(
                  CATEGORY_LIST.filter((t) => t !== "Uncategorized").join(", ")
                ),
              }),
            ]),
          }),
        ]),
      })
    );
  });

  it("should handle empty API response", async () => {
    const titleRecords: TitleRecords[] = [
      { title: "REMA 1000", category: "Uncategorized", count: 1 },
    ];

    // Mock empty API response
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        candidates: [
          {
            content: {
              parts: [
                {
                  functionCall: {
                    args: {
                      transactions: [],
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    });

    const result = await service.getCategoryMapping(titleRecords);

    // Verify empty result
    expect(result).toEqual({});
  });

  it("should handle API error", async () => {
    const titleRecords: TitleRecords[] = [
      { title: "REMA 1000", category: "Uncategorized", count: 1 },
    ];

    // Mock API error
    mockGenerateContent.mockRejectedValueOnce(new Error("API Error"));

    await expect(service.getCategoryMapping(titleRecords)).rejects.toThrow(
      "Failed to map categories for transactions"
    );
  });

  it("should throw error for empty transactions array", async () => {
    await expect(service.getCategoryMapping([])).rejects.toThrow(
      "Transactions array is empty"
    );
  });

  it("should only process uncategorized transactions", async () => {
    const titleRecords: TitleRecords[] = [
      { title: "REMA 1000", category: "Uncategorized", count: 1 },
      { title: "Netflix", category: "Entertainment", count: 1 }, // Already categorized
    ];

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        candidates: [
          {
            content: {
              parts: [
                {
                  functionCall: {
                    args: {
                      transactions: [
                        { title: "REMA 1000", category: "Groceries" },
                      ],
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    });

    const result = await service.getCategoryMapping(titleRecords);

    expect(result).toEqual({
      "REMA 1000": "Groceries",
    });

    // Verify that the request only included the uncategorized transaction
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        contents: [
          expect.objectContaining({
            parts: [
              expect.objectContaining({
                text: expect.stringContaining("REMA 1000"),
              }),
            ],
          }),
        ],
      })
    );
  });
});
