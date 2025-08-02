import { DollarSign, X } from "lucide-react";
import { AmountRange } from "../../types/filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils";

interface AmountRangeFilterProps {
  amountRange: AmountRange;
  onAmountRangeChange: (amountRange: AmountRange) => void;
  currency?: string;
}

export const AmountRangeFilter = ({
  amountRange,
  onAmountRangeChange,
  currency = "NOK",
}: AmountRangeFilterProps) => {
  const handleMinAmountChange = (value: string) => {
    const minAmount = value ? parseFloat(value) : undefined;
    onAmountRangeChange({ ...amountRange, min: minAmount });
  };

  const handleMaxAmountChange = (value: string) => {
    const maxAmount = value ? parseFloat(value) : undefined;
    onAmountRangeChange({ ...amountRange, max: maxAmount });
  };

  const clearAmountRange = () => {
    onAmountRangeChange({ min: undefined, max: undefined });
  };

  const hasAmountRange =
    amountRange.min !== undefined || amountRange.max !== undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Amount Range</Label>
        {hasAmountRange && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 ml-auto"
            onClick={clearAmountRange}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="minAmount" className="text-xs text-muted-foreground">
            Min Amount
          </Label>
          <Input
            id="minAmount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={
              amountRange.min !== undefined ? amountRange.min.toString() : ""
            }
            onChange={(e) => handleMinAmountChange(e.target.value)}
            className="text-sm"
            max={
              amountRange.max !== undefined
                ? amountRange.max.toString()
                : undefined
            }
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="maxAmount" className="text-xs text-muted-foreground">
            Max Amount
          </Label>
          <Input
            id="maxAmount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={
              amountRange.max !== undefined ? amountRange.max.toString() : ""
            }
            onChange={(e) => handleMaxAmountChange(e.target.value)}
            className="text-sm"
            min={
              amountRange.min !== undefined
                ? amountRange.min.toString()
                : undefined
            }
          />
        </div>
      </div>

      {/* Display active amount range */}
      {hasAmountRange && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {amountRange.min !== undefined
              ? formatCurrency(currency, amountRange.min)
              : "Min"}
            {" → "}
            {amountRange.max !== undefined
              ? formatCurrency(currency, amountRange.max)
              : "Max"}
          </Badge>
        </div>
      )}
    </div>
  );
};
