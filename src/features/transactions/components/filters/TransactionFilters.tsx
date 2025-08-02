import { Search, Filter, X } from "lucide-react";
import { CategoryFilter } from "./CategoryFilter";
import { DateRangeFilter } from "./DateRangeFilter";
import { AmountRangeFilter } from "./AmountRangeFilter";
import { FilterState } from "../../types/filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TransactionFiltersProps {
  filterState: FilterState;
  currency?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export const TransactionFilters = ({
  filterState,
  currency = "NOK",
  isCollapsed = false,
  onToggleCollapse,
}: TransactionFiltersProps) => {
  const {
    categories,
    dateRange,
    amountRange,
    searchQuery,
    updateCategories,
    updateDateRange,
    updateAmountRange,
    updateSearchQuery,
    resetFilters,
    hasActiveFilters,
  } = filterState;

  const handleToggleCollapse = () => {
    onToggleCollapse?.(!isCollapsed);
  };

  return (
    <div className="space-y-4">
      {/* Search Input - Always visible */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions by title..."
          value={searchQuery}
          onChange={(e) => updateSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <CardTitle className="text-base">Filters</CardTitle>
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs h-7"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
              {onToggleCollapse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleCollapse}
                  className="text-xs h-7"
                >
                  {isCollapsed ? "Show" : "Hide"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {!isCollapsed && (
          <CardContent className="space-y-4">
            {/* Category Filter */}
            <div>
              <CategoryFilter
                selectedCategories={categories}
                onCategoriesChange={updateCategories}
              />
            </div>

            <Separator />

            {/* Date Range Filter */}
            <DateRangeFilter
              dateRange={dateRange}
              onDateRangeChange={updateDateRange}
            />

            <Separator />

            {/* Amount Range Filter */}
            <AmountRangeFilter
              amountRange={amountRange}
              onAmountRangeChange={updateAmountRange}
              currency={currency}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
};
