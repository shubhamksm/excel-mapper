import { getCategoryMapping } from "../gemini";
import { CSV_Data } from "@/types";
import { CATEGORY_LIST } from "@/constants";

// Mock fetch globally
global.fetch = jest.fn();

describe("getCategoryMapping", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully map categories from API response", async () => {
    // Mock test data
    const testTransactions = [
      { Title: "REMA 1000", Amount: "100", Date: "2024-03-20" },
      { Title: "Netflix", Amount: "150", Date: "2024-03-21" },
    ] as CSV_Data;

    // Mock successful API response
    const mockResponse = {
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
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    const result = await getCategoryMapping(testTransactions);

    // Verify the result
    expect(result).toEqual([
      { "REMA 1000": "Groceries" },
      { Netflix: "Entertainment" },
    ]);

    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("generativelanguage.googleapis.com"),
      expect.objectContaining({
        method: "POST",
        headers: expect.any(Object),
        body: expect.any(Object),
      })
    );
  });

  it("should handle empty API response", async () => {
    const testTransactions = [
      { Title: "REMA 1000", Amount: "100", Date: "2024-03-20" },
    ] as CSV_Data;

    // Mock empty API response
    const mockResponse = {
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
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    const result = await getCategoryMapping(testTransactions);

    // Verify empty result
    expect(result).toEqual([]);
  });

  it("should handle API error response", async () => {
    const testTransactions = [
      { Title: "REMA 1000", Amount: "100", Date: "2024-03-20" },
    ] as CSV_Data;

    // Mock API error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

    await expect(getCategoryMapping(testTransactions)).rejects.toThrow(
      "API Error"
    );
  });

  it("should send correct request body format", async () => {
    const testTransactions = [
      { Title: "REMA 1000", Amount: "100", Date: "2024-03-20" },
    ] as CSV_Data;

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ candidates: [] }),
    });

    await getCategoryMapping(testTransactions);

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestBody = fetchCall[1].body;

    // Verify request body structure
    expect(requestBody).toMatchObject({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: expect.stringContaining(CATEGORY_LIST.join(", ")),
            },
          ],
        },
      ],
      tools: {
        function_declarations: [
          {
            name: "categorize_transactions",
            parameters: expect.any(Object),
          },
        ],
      },
    });
  });

  it("should properly format request with masked titles and categories", async () => {
    const testTransactions = [
      { Title: "REMA 1000 123456", Amount: "100", Date: "2024-03-20" },
      { Title: "John Smith Transfer", Amount: "150", Date: "2024-03-21" },
      { Title: "Netflix #9876", Amount: "150", Date: "2024-03-21" },
    ] as CSV_Data;

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ candidates: [] }),
    });

    await getCategoryMapping(testTransactions);

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestBody = fetchCall[1].body;
    const requestText = requestBody.contents[0].parts[0].text;

    // Verify categories are properly included
    expect(requestText).toContain(`categories: ${CATEGORY_LIST.join(", ")}`);

    // Verify titles are properly masked (numbers replaced with X)
    expect(requestText).toContain("REMA XXXX XXXXXX");
    expect(requestText).toContain("Netflix #XXXX");

    // Verify the instruction about personal category for names
    expect(requestText).toContain(
      "If description contains any name assign those to Personal Category"
    );

    // Verify the complete request structure
    expect(requestBody).toMatchObject({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: expect.stringMatching(
                /Help categorize.*Personal Category.*REMA XXXX XXXXXX.*Netflix #XXXX/s
              ),
            },
          ],
        },
      ],
      tools: {
        function_declarations: [
          {
            name: "categorize_transactions",
            description: expect.any(String),
            parameters: {
              type: "object",
              properties: {
                transactions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: {
                        type: "string",
                        description: expect.any(String),
                      },
                      category: {
                        type: "string",
                        description: expect.any(String),
                      },
                    },
                    required: ["title"],
                  },
                },
              },
              required: ["transactions"],
            },
          },
        ],
      },
    });
  });
});
