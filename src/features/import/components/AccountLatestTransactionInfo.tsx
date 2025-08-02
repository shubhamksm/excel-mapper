import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, CreditCard, TrendingUp } from "lucide-react";
import {
  AccountInfoService,
  AccountLatestTransaction,
} from "../services/accountInfoService";
import { formatCurrency } from "@/utils";

interface AccountLatestTransactionInfoProps {
  className?: string;
}

export const AccountLatestTransactionInfo = ({
  className,
}: AccountLatestTransactionInfoProps) => {
  const [accountInfos, setAccountInfos] = useState<AccountLatestTransaction[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use live query to automatically update when data changes
  const accounts = useLiveQuery(() =>
    import("@/database").then(({ db }) => db.accounts.toArray())
  );
  const transactions = useLiveQuery(() =>
    import("@/database").then(({ db }) => db.transactions.toArray())
  );

  useEffect(() => {
    const fetchAccountInfos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const infos = await AccountInfoService.getLatestTransactionPerAccount();
        setAccountInfos(infos);
      } catch (err) {
        console.error("Failed to fetch account information:", err);
        setError("Failed to load account information");
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch when we have accounts and transactions data available
    if (accounts !== undefined && transactions !== undefined) {
      fetchAccountInfos();
    }
  }, [accounts, transactions]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Latest transaction dates for your accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (accountInfos.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            No accounts found. Please add accounts first.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Account Information
        </CardTitle>
        <CardDescription>
          Latest transaction dates to help you determine what to import
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {accountInfos.map((accountInfo) => (
          <AccountInfoItem
            key={accountInfo.account.id}
            accountInfo={accountInfo}
          />
        ))}
      </CardContent>
    </Card>
  );
};

interface AccountInfoItemProps {
  accountInfo: AccountLatestTransaction;
}

const AccountInfoItem = ({ accountInfo }: AccountInfoItemProps) => {
  const {
    account,
    latestTransactionDate,
    latestTransaction,
    totalTransactions,
  } = accountInfo;

  // Add defensive checks
  if (!account) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
        <div className="text-sm text-destructive">
          Error: Account information missing
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm">{account.name}</h4>
            <Badge variant="outline" className="text-xs">
              {account.currency}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              <span>
                Latest:{" "}
                {AccountInfoService.formatDisplayDate(latestTransactionDate)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{totalTransactions} transactions</span>
            </div>
          </div>

          {latestTransaction && (
            <div className="text-xs text-muted-foreground">
              Last: {latestTransaction.title} -{" "}
              {formatCurrency(
                latestTransaction.currency,
                latestTransaction.amount
              )}
            </div>
          )}

          <p className="text-xs text-primary font-medium">
            {AccountInfoService.getImportSuggestion(latestTransactionDate)}
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering AccountInfoItem:", error, accountInfo);
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
        <div className="text-sm text-destructive">
          Error displaying account: {account.name}
        </div>
      </div>
    );
  }
};
