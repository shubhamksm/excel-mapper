import { useState } from "react";
import { Check, ChevronDown, X, Filter } from "lucide-react";
import { Category_Type } from "@/types";
import { CATEGORY_LIST } from "@/constants";
import { toTitleCase } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface CategoryFilterProps {
  selectedCategories: Category_Type[];
  onCategoriesChange: (categories: Category_Type[]) => void;
}

export const CategoryFilter = ({
  selectedCategories,
  onCategoriesChange,
}: CategoryFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryToggle = (category: Category_Type) => {
    const isSelected = selectedCategories.includes(category);
    if (isSelected) {
      onCategoriesChange(selectedCategories.filter((cat) => cat !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const handleSelectAll = () => {
    onCategoriesChange([...CATEGORY_LIST]);
  };

  const handleClearAll = () => {
    onCategoriesChange([]);
  };

  const allSelected = selectedCategories.length === CATEGORY_LIST.length;
  const noneSelected = selectedCategories.length === 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Categories</Label>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            size="sm"
          >
            <span className="truncate">
              {allSelected
                ? "All Categories"
                : noneSelected
                ? "No Categories"
                : `${selectedCategories.length} Categories`}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[400px]">
          <SheetHeader>
            <SheetTitle>Select Categories</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                disabled={allSelected}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={noneSelected}
              >
                Clear All
              </Button>
            </div>

            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {CATEGORY_LIST.map((category) => {
                const isSelected = selectedCategories.includes(category);
                return (
                  <div
                    key={category}
                    className="flex items-center space-x-2 p-2 rounded border cursor-pointer hover:bg-accent"
                    onClick={() => handleCategoryToggle(category)}
                  >
                    <div className="flex h-4 w-4 items-center justify-center border rounded">
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span className="flex-1">{toTitleCase(category)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Show selected categories as badges */}
      {!allSelected && selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
          {selectedCategories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="text-xs flex items-center gap-1"
            >
              {toTitleCase(category)}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => handleCategoryToggle(category)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
