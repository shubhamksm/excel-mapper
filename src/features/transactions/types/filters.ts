import { Category_Type } from "@/types";

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface AmountRange {
  min?: number;
  max?: number;
}

export interface TransactionFilters {
  categories: Category_Type[];
  dateRange: DateRange;
  amountRange: AmountRange;
  searchQuery: string;
}

export interface FilterState extends TransactionFilters {
  resetFilters: () => void;
  updateCategories: (categories: Category_Type[]) => void;
  updateDateRange: (dateRange: DateRange) => void;
  updateAmountRange: (amountRange: AmountRange) => void;
  updateSearchQuery: (query: string) => void;
  hasActiveFilters: boolean;
}
