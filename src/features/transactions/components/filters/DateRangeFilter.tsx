import { Calendar, X } from "lucide-react";
import { DateRange } from "../../types/filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}

export const DateRangeFilter = ({
  dateRange,
  onDateRangeChange,
}: DateRangeFilterProps) => {
  const handleFromDateChange = (value: string) => {
    const fromDate = value ? new Date(value) : undefined;
    onDateRangeChange({ ...dateRange, from: fromDate });
  };

  const handleToDateChange = (value: string) => {
    const toDate = value ? new Date(value) : undefined;
    onDateRangeChange({ ...dateRange, to: toDate });
  };

  const clearDateRange = () => {
    onDateRangeChange({ from: undefined, to: undefined });
  };

  const formatDateForInput = (date?: Date): string => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const hasDateRange = dateRange.from || dateRange.to;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Date Range</Label>
        {hasDateRange && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 ml-auto"
            onClick={clearDateRange}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="fromDate" className="text-xs text-muted-foreground">
            From
          </Label>
          <Input
            id="fromDate"
            type="date"
            value={formatDateForInput(dateRange.from)}
            onChange={(e) => handleFromDateChange(e.target.value)}
            className="text-sm"
            max={formatDateForInput(dateRange.to)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="toDate" className="text-xs text-muted-foreground">
            To
          </Label>
          <Input
            id="toDate"
            type="date"
            value={formatDateForInput(dateRange.to)}
            onChange={(e) => handleToDateChange(e.target.value)}
            className="text-sm"
            min={formatDateForInput(dateRange.from)}
          />
        </div>
      </div>

      {/* Display active date range */}
      {hasDateRange && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {dateRange.from ? dateRange.from.toLocaleDateString() : "Start"}
            {" → "}
            {dateRange.to ? dateRange.to.toLocaleDateString() : "End"}
          </Badge>
        </div>
      )}
    </div>
  );
};
