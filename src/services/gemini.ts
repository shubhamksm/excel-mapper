import { CATEGORY_LIST } from "@/constants";
import { PreMappedTitles, TitleRecords } from "@/screens/TitleMappingScreen";
import { Category_Type } from "@/types";
import {
  GenerateContentRequest,
  GoogleGenerativeAI,
} from "@google/generative-ai";

interface CategoryMappingResult {
  category: Category_Type;
  title: string;
}

export class CategoryMappingService {
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(
      process.env.VITE_GEMINI_API_KEY as string
    );
  }

  private async processBatch(
    batch: TitleRecords[]
  ): Promise<CategoryMappingResult[]> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
      const result = await model.generateContent(this.getRequestBody(batch));
      const data = result.response;

      const rawData = ((data?.candidates ?? [{}])[0]?.content?.parts[0]
        ?.functionCall?.args ?? {}) as { transactions: [] };

      return rawData?.transactions ?? [];
    } catch (error) {
      console.error("Failed to process batch:", error);
      throw new Error(
        `Batch processing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private getRequestBody(transactions: TitleRecords[]): GenerateContentRequest {
    return {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Help categorize the transaction descriptions. 
            **Only Respond by Calling categorize_transactions function**
            *Important* Only use these categories: ${CATEGORY_LIST.filter(
              (t) => t !== "Uncategorized"
            ).join(", ")}. 
            Be precise and consistent in your categorization. 
            If description contains any name assign those to Personal Category, 
            Here's the transactions list: ${transactions
              .map((t) => t.title)
              .join(",\n")}`,
            },
          ],
        },
      ],
      tools: {
        // @ts-ignore
        function_declarations: [
          {
            name: "categorize_transactions",
            description:
              "Assign categories to transaction descriptions or merchant names",
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
                        description: "Transaction merchant or description",
                      },
                      category: {
                        type: "string",
                        description: "Suggested transaction category",
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
    };
  }

  public async getCategoryMapping(
    transactions: TitleRecords[]
  ): Promise<PreMappedTitles> {
    if (!transactions?.length) {
      throw new Error("Transactions array is empty");
    }

    const batchToProcess = transactions.filter(
      (t) => t.category === "Uncategorized"
    );

    try {
      const results = await this.processBatch(batchToProcess);

      return results.reduce((acc, { title, category }) => {
        acc[title] = category;
        return acc;
      }, {} as PreMappedTitles);
    } catch (error) {
      console.error("Category mapping failed:", error);
      throw new Error("Failed to map categories for transactions");
    }
  }
}
