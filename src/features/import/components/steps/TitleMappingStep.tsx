import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/containers/DataTable";
import { useBoundStore } from "@/features/import/store/useBoundStore";
import type { Category_Type } from "@/types";
import {
  getTitleRecords,
  mapRowWithCategory,
  toTitleCase,
  updatePreMappedTitles,
} from "@/utils";
import { CATEGORY_LIST } from "@/constants";
import { Loader2, Wand2 } from "lucide-react";
import { CategoryMappingService } from "@/features/import/services";
import { ColumnDef } from "@tanstack/react-table";
import { useShallow } from "zustand/react/shallow";
import { ModalFooter } from "../ModalFooter";
import { db } from "@/database";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { transactionProcessor } from "@/utils/processTransactions";

export type TitleRecords = {
  title: string;
  category: Category_Type;
  count: number;
};

export type PreMappedTitles = Record<string, Category_Type>;

const OptionsFromDefaultCategory = CATEGORY_LIST.map((name) => {
  return (
    <SelectItem key={name} value={name}>
      {toTitleCase(name)}
    </SelectItem>
  );
});

const columns: ColumnDef<TitleRecords>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "count",
    header: "Count",
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = getValue<string>();
      const [value, setValue] = useState(initialValue);

      useEffect(() => {
        setValue(initialValue);
      }, [initialValue]);

      return (
        <Select
          value={value}
          onValueChange={(category: Category_Type) => {
            // @ts-ignore
            table.options.meta?.updateData(index, id, category);
            setValue(category);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>{OptionsFromDefaultCategory}</SelectContent>
        </Select>
      );
    },
  },
];

function useSkipper() {
  const shouldSkipRef = React.useRef(true);
  const shouldSkip = shouldSkipRef.current;

  const skip = React.useCallback(() => {
    shouldSkipRef.current = false;
  }, []);

  React.useEffect(() => {
    shouldSkipRef.current = true;
  });

  return [shouldSkip, skip] as const;
}

export const TitleMappingStep = () => {
  const [titleMappedData, setTitleMappedData] = useBoundStore(
    useShallow((state) => [state.titleMappedData, state.setTitleMappedData])
  );
  const accounts = useLiveQuery(() => db.accounts.toArray());
  const [selectedAccountId, setSelectedAccountId] = useState<
    string | undefined
  >(undefined);
  const [titleRecords, setTitleRecords] = useState<TitleRecords[]>([]);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  useEffect(() => {
    if (titleMappedData) {
      skipAutoResetPageIndex();
      setTitleRecords(getTitleRecords({}, titleMappedData));
    }
  }, [titleMappedData]);

  const handleAutoAssign = async () => {
    setIsAutoAssigning(true);
    const categoryMappingService = new CategoryMappingService();
    const mapping = await categoryMappingService.getCategoryMapping(
      titleRecords
    );
    const updatedTitleRecords = titleRecords.map((record) => ({
      ...record,
      category: mapping[record.title] || record.category,
    }));
    setTitleRecords(updatedTitleRecords);
    setIsAutoAssigning(false);
  };

  const handleNext = async () => {
    if (titleMappedData && accounts && selectedAccountId) {
      const updatedPreMappedTitles = updatePreMappedTitles(titleRecords);
      const categoryMappedData = mapRowWithCategory(
        titleMappedData,
        updatedPreMappedTitles,
        accounts.find((account) => account.id === selectedAccountId)
          ?.currency ?? "NOK"
      );
      console.log(categoryMappedData);
      await transactionProcessor.processAndSaveTransactions(
        selectedAccountId,
        categoryMappedData
      );
      // [TODO]: Category Mapped data is final now, upload to google drive
    }
  };

  return (
    <>
      <div className="space-y-4 h-full flex flex-col flex-1 w-full overflow-y-hidden">
        <p className="text-sm text-muted-foreground text-center">
          Assign categories to your transaction titles.
        </p>
        <div className="flex justify-between gap-x-4 items-center">
          <Select
            onValueChange={(value) => {
              setSelectedAccountId(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Account for Transaction" />
            </SelectTrigger>
            <SelectContent>
              {accounts?.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAutoAssign} disabled={isAutoAssigning}>
            {isAutoAssigning ? (
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            Auto Assign
          </Button>
        </div>
        <div className="overflow-y-auto flex-1">
          <DataTable
            columns={columns}
            data={titleRecords}
            tableOptions={{
              autoResetPageIndex,
              meta: {
                updateData: (
                  rowIndex: number,
                  columnId: string,
                  value: string
                ) => {
                  skipAutoResetPageIndex();
                  setTitleRecords((old) =>
                    old.map((row, index) => {
                      if (index === rowIndex) {
                        return {
                          ...old[rowIndex]!,
                          [columnId]: value,
                        };
                      }
                      return row;
                    })
                  );
                },
              },
            }}
          />
        </div>
      </div>
      <ModalFooter isNextDisabled={!selectedAccountId} onNext={handleNext} />
    </>
  );
};
