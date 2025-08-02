import { useState, useCallback, useMemo } from "react";
import { Category_Type } from "@/types";
import { CATEGORY_LIST } from "@/constants";
import {
  TransactionFilters,
  DateRange,
  AmountRange,
  FilterState,
} from "../types/filters";

const DEFAULT_FILTERS: TransactionFilters = {
  categories: [...CATEGORY_LIST], // Start with all categories selected
  dateRange: {},
  amountRange: {},
  searchQuery: "",
};

export const useTransactionFilters = (): FilterState => {
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS);

  const updateCategories = useCallback((categories: Category_Type[]) => {
    setFilters((prev) => ({ ...prev, categories }));
  }, []);

  const updateDateRange = useCallback((dateRange: DateRange) => {
    setFilters((prev) => ({ ...prev, dateRange }));
  }, []);

  const updateAmountRange = useCallback((amountRange: AmountRange) => {
    setFilters((prev) => ({ ...prev, amountRange }));
  }, []);

  const updateSearchQuery = useCallback((searchQuery: string) => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = useMemo(() => {
    const { categories, dateRange, amountRange, searchQuery } = filters;

    return (
      // Not all categories selected
      categories.length !== CATEGORY_LIST.length ||
      // Date range is set
      dateRange.from !== undefined ||
      dateRange.to !== undefined ||
      // Amount range is set
      amountRange.min !== undefined ||
      amountRange.max !== undefined ||
      // Search query is set
      searchQuery.trim() !== ""
    );
  }, [filters]);

  return {
    ...filters,
    updateCategories,
    updateDateRange,
    updateAmountRange,
    updateSearchQuery,
    resetFilters,
    hasActiveFilters,
  };
};
