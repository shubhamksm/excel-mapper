import { useState, useEffect } from "react";
import { Transaction, Category_Type } from "@/types";
import { Category_Enum, CATEGORY_LIST } from "@/constants";
import { toTitleCase } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  updateTransactionCategory,
  getTransactionTitleStats,
} from "@/utils/transactionUtils";

interface CategoryChangeDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryChanged: () => void;
}

interface TitleStats {
  title: string;
  normalizedTitle: string;
  totalCount: number;
  currentCategory: Category_Type;
  transactions: Transaction[];
}

export const CategoryChangeDialog = ({
  transaction,
  open,
  onOpenChange,
  onCategoryChanged,
}: CategoryChangeDialogProps) => {
  const [selectedCategory, setSelectedCategory] = useState<Category_Type | "">(
    ""
  );
  const [titleStats, setTitleStats] = useState<TitleStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (open && transaction) {
      loadTitleStats();
      setSelectedCategory(transaction.category);
    }
  }, [open, transaction]);

  const loadTitleStats = async () => {
    if (!transaction) return;

    try {
      setIsLoading(true);
      setError("");
      const stats = await getTransactionTitleStats(transaction.id);
      setTitleStats(stats);
    } catch (err) {
      setError(`Failed to load transaction statistics: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = async () => {
    if (
      !transaction ||
      !selectedCategory ||
      selectedCategory === transaction.category
    ) {
      return;
    }

    try {
      setIsUpdating(true);
      setError("");

      const result = await updateTransactionCategory(
        transaction.id,
        selectedCategory
      );

      if (result.success) {
        onCategoryChanged();
        onOpenChange(false);

        // Show success message
        if (result.updatedCount > 1) {
          alert(
            `Successfully updated ${
              result.updatedCount
            } transactions with the same title to "${toTitleCase(
              selectedCategory
            )}"`
          );
        } else {
          alert(
            `Successfully updated transaction category to "${toTitleCase(
              selectedCategory
            )}"`
          );
        }
      } else {
        setError(`Failed to update category: ${result.errors.join(", ")}`);
      }
    } catch (err) {
      setError(`Failed to update category: ${err}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setSelectedCategory("");
    setTitleStats(null);
    setError("");
    onOpenChange(false);
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change Transaction Category</DialogTitle>
          <DialogDescription>
            Change the category for this transaction and all other transactions
            with the same title.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction Details */}
          <div className="p-3 bg-muted rounded-md">
            <div className="text-sm font-medium">{transaction.title}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(transaction.date).toLocaleDateString()} •{" "}
              {transaction.currency} {transaction.amount}
            </div>
          </div>

          {/* Title Statistics */}
          {isLoading ? (
            <div className="text-sm text-muted-foreground">
              Loading transaction statistics...
            </div>
          ) : titleStats ? (
            <div className="space-y-2">
              <div className="text-sm font-medium">
                Transactions with same title:
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {titleStats.totalCount} transactions
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Current category: {toTitleCase(titleStats.currentCategory)}
                </span>
              </div>

              {titleStats.totalCount > 1 && (
                <div className="text-xs text-muted-foreground">
                  This will update all {titleStats.totalCount} transactions with
                  the title "{titleStats.title}"
                </div>
              )}
            </div>
          ) : null}

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">New Category</label>
            <Select
              value={selectedCategory}
              onValueChange={(value) =>
                setSelectedCategory(value as Category_Type)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_LIST.map((category) => (
                  <SelectItem key={category} value={category}>
                    {toTitleCase(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={handleCategoryChange}
            disabled={
              !selectedCategory ||
              selectedCategory === transaction.category ||
              isUpdating
            }
          >
            {isUpdating ? "Updating..." : "Update Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
