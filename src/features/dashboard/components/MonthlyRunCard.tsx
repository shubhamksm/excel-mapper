import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/database";
import { SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { Select } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { Category_Enum, Currency_Enum } from "@/constants";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, CartesianGrid, XAxis, YAxis, Legend, BarChart } from "recharts";
import { compareAsc } from "date-fns";
import { formatCurrency } from "@/utils";

// Color palette for different categories
const categoryColors: Record<Category_Enum, string> = {
  [Category_Enum.GROCERIES]: "#8884d8",
  [Category_Enum.SHOPPING]: "#ff7300",
  [Category_Enum.BILLS_AND_FEES]: "#ff8042",
  [Category_Enum.TRAVEL]: "#00c49f",
  [Category_Enum.INCOME]: "#ff6b6b",
  [Category_Enum.BALANCE_CORRECTION]: "#4ecdc4",
  [Category_Enum.HEALTH]: "#ff6b6b",
  [Category_Enum.DINING]: "#4ecdc4",
  [Category_Enum.EXTRAS]: "#45b7d1",
  [Category_Enum.INVESTMENT]: "#9b59b6",
};

const chartConfig = {
  month: {
    label: "Month",
  },
  amount: {
    label: "Amount",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export const MonthlyRunCard = () => {
  const transactions = useLiveQuery(() => db.transactions.toArray());
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

  const monthlyData = useMemo(() => {
    if (!transactions || !selectedCurrency) return [];

    // Filter transactions
    const filteredTransactions = transactions.filter(
      (transaction) =>
        transaction.amount < 0 &&
        transaction.category !== Category_Enum.BALANCE_CORRECTION &&
        transaction.category !== Category_Enum.INCOME &&
        transaction.currency === selectedCurrency
    );

    // Group by month and category
    const groupedData = filteredTransactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const year = date.getFullYear();
      const month = date.toLocaleString("default", { month: "short" });
      const key = `${year}-${month}`;
      const category = transaction.category;
      const amount = Math.abs(transaction.amount);

      if (!acc[key]) {
        acc[key] = { month: key };
      }

      acc[key][category] = (acc[key][category] || 0) + amount;
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort by date
    return Object.values(groupedData).sort((a, b) =>
      compareAsc(new Date(a.month), new Date(b.month))
    );
  }, [selectedCurrency, transactions]);

  // Get unique categories for legend
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    monthlyData.forEach((data) => {
      Object.keys(data).forEach((key) => {
        if (key !== "month" && data[key] > 0) {
          categorySet.add(key);
        }
      });
    });
    return Array.from(categorySet);
  }, [monthlyData]);

  return (
    <div className="col-span-4">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Monthly Run for</span>
            <Select onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Currency_Enum).map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedCurrency && (
            <ChartContainer
              config={chartConfig}
              className="min-h-[200px] w-full"
            >
              <BarChart data={monthlyData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(value) =>
                    formatCurrency(selectedCurrency, value)
                  }
                />
                <ChartTooltip
                  cursor={{ fill: "var(--chart-2)", opacity: 0.75 }}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) =>
                        `${name}: ${formatCurrency(
                          selectedCurrency,
                          Number(value)
                        )}`
                      }
                    />
                  }
                />
                <Legend />
                {categories.map((category) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    stackId="a"
                    fill={categoryColors[category as Category_Enum]}
                    name={category}
                  />
                ))}
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
