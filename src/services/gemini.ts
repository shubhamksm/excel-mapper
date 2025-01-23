import { CATEGORY_LIST } from "@/constants";
import { PreMappedTitles } from "@/screens/TitleMappingScreen";
import { Category_Type, CSV_Data } from "@/types";

export const getCategoryMapping = async (
  transactions: CSV_Data
): Promise<PreMappedTitles> => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${
      import.meta.env.VITE_GEMINI_API_KEY
    }`,
    {
      method: "POST",
      headers: {
        contentType: "application/json",
      },
      body: getRequestBody(transactions) as unknown as BodyInit,
    }
  );

  const data = await response.json();

  const rawData: { category: Category_Type; title: string }[] =
    data?.candidates[0]?.content?.parts[0]?.functionCall?.args?.transactions ??
    [];
  return rawData.map((row) => ({
    [row.title]: row.category,
  })) as unknown as PreMappedTitles;
};

const getRequestBody = (transactions: CSV_Data) => {
  return {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Help categorize the transaction descriptions. 
            *Important* Only use these categories: ${CATEGORY_LIST.join(", ")}. 
            Be precise and consistent in your categorization. 
            If description contains any name assign those to Personal Category, 
            Here's the transactions list: ${transactions
              .map((t) => t.Title)
              .join(",\n")}`,
          },
        ],
      },
    ],
    tools: {
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
};
