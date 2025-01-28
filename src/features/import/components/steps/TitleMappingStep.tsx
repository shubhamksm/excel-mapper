import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Category_Enum, CATEGORY_LIST } from "@/constants";
import { DataTable } from "@/containers/DataTable";
import Page from "@/layouts/Page";
// import { sortAndDivideTransactions } from "@/services/drive";
import { useBoundStore } from "@/features/import/store/useBoundStore";
import { Category_Type } from "@/types";
import {
  // getPreMappedTitles,
  getTitleRecords,
  mapRowWithCategory,
  updatePreMappedTitles,
  toTitleCase,
} from "@/utils";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryMappingService } from "@/features/import/services";
import { useAppStore } from "@/store/useAppStore";

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
      const [value, setValue] = React.useState(initialValue);

      React.useEffect(() => {
        setValue(initialValue);
      }, [initialValue]);

      return (
        <Select
          onValueChange={(category: Category_Type) => {
            // @ts-ignore
            table.options.meta?.updateData(index, id, category);
            setValue(category);
          }}
          value={value}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Add Mapping" />
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
  const titleMappedData = useBoundStore(
    useShallow((state) => state.titleMappedData)
  );
  const rootFolderId = useAppStore(useShallow((state) => state.rootFolderId));
  const accounts = useAppStore(useShallow((state) => state.accounts));
  const [preMappedTitles, setPreMappedTitles] = useState<PreMappedTitles>({});
  // const [isLoading, setIsLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<
    string | undefined
  >(undefined);
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
  const [isGeminiLoading, setIsGeminiLoading] = useState<boolean>(false);
  const categoryMappingService = new CategoryMappingService();

  const [titleRecords, setTitleRecords] = useState<TitleRecords[]>([]);

  const handleNext = async () => {
    if (
      titleMappedData &&
      // preMappedTitlesFileId &&
      // rootFolderId &&
      selectedAccountId
    ) {
      const updatedPreMappedTitles = updatePreMappedTitles(titleRecords);
      const categoryMappedData = mapRowWithCategory(
        titleMappedData,
        updatedPreMappedTitles,
        selectedAccountId,
        accounts.find((account) => account.id === selectedAccountId)
          ?.currency ?? "NOK"
      );
      // [TODO: Get all transactions for current user, and create a titleMapping]
      console.log(categoryMappedData);
      // [TODO: Upload transactions to firebase]
    }
  };

  // useEffect(() => {
  //   const prepareData = async () => {
  //     if (rootFolderId) {
  //       const response = await getPreMappedTitles(rootFolderId);
  //       if (response) {
  //         setPreMappedTitles(response.data ?? {});
  //         setIsLoading(false);
  //       }
  //     }
  //   };
  //   prepareData();
  // }, []);

  useEffect(() => {
    if (titleMappedData && preMappedTitles) {
      skipAutoResetPageIndex();
      setTitleRecords(getTitleRecords(preMappedTitles, titleMappedData));
    }
  }, [preMappedTitles, titleMappedData]);

  const getMappingWithAI = async () => {
    if (titleRecords && preMappedTitles) {
      setIsGeminiLoading(true);
      const mapping = await categoryMappingService.getCategoryMapping(
        titleRecords
      );
      const mergedMapping: PreMappedTitles = {};
      for (const key of Object.keys(mapping)) {
        mergedMapping[key] =
          preMappedTitles[key] !== Category_Enum.UNCATEGORIZED &&
          preMappedTitles[key] !== undefined
            ? preMappedTitles[key]
            : mapping[key];
      }
      setPreMappedTitles(mergedMapping);
      setIsGeminiLoading(false);
    }
  };

  return (
    <Page
      title="Title Mapping"
      nextLabel="Finish"
      nextButtonProps={{
        onClick: handleNext,
        disabled: selectedAccountId === undefined,
      }}
      previousLabel="Previous"
    >
      {!titleMappedData ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
      ) : (
        <div>
          <div className="flex justify-between w-full">
            <Select
              onValueChange={(value) => {
                setSelectedAccountId(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={getMappingWithAI}
              disabled={isGeminiLoading}
              size={"xs"}
              className="bg-gradient-to-r from-purple-400 to-pink-600 hover:from-purple-500 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transform transition duration-500 hover:scale-101"
            >
              {isGeminiLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Wand2 />
              )}
              Auto Assign Categories
            </Button>
          </div>
          <DataTable
            data={titleRecords}
            columns={columns}
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
      )}
    </Page>
  );
};
