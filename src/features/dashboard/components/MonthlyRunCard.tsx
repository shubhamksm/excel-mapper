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
import { Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { BarChart } from "recharts";
import { compareAsc } from "date-fns";
import { formatCurrency } from "@/utils";

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

  const monthlyAverage = useMemo(() => {
    return transactions
      ?.filter(
        (transaction) =>
          transaction.amount < 0 &&
          transaction.category !== Category_Enum.BALANCE_CORRECTION &&
          transaction.currency === selectedCurrency
      )
      .reduce((acc, transaction) => {
        const date = new Date(transaction.date);
        const year = date.getFullYear();
        const month = date.toLocaleString("default", { month: "short" });
        const key = `${year}-${month}`;
        const amount = transaction.amount;
        acc[key] = (acc[key] || 0) + amount;
        return acc;
      }, {} as Record<string, number>);
  }, [selectedCurrency, transactions]);

  const chartData = useMemo(
    () =>
      Object.entries(monthlyAverage || {}).map(([key, amount]) => ({
        month: key,
        amount: Math.abs(amount),
      })),
    [monthlyAverage]
  ).sort((a, b) => compareAsc(new Date(a.month), new Date(b.month)));

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
              <BarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  dataKey="amount"
                  tickFormatter={(value) =>
                    formatCurrency(selectedCurrency, value)
                  }
                />
                <ChartTooltip
                  cursor={{ fill: "var(--chart-2)", opacity: 0.75 }}
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        formatCurrency(selectedCurrency, Number(value))
                      }
                    />
                  }
                />
                <Bar dataKey="amount" fill={`var(--chart-1)`} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
