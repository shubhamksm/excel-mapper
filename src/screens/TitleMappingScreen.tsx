import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_LIST, DEFAULT_TITLE_MAP_FILE } from "@/constants";
import { DataTable } from "@/containers/DataTable";
import Page from "@/layouts/Page";
import {
  createJsonFile,
  getJsonFileByName,
  readJsonFileContent,
  sortAndDivideTransactions,
  updateJsonFile,
} from "@/services/drive";
import { useBoundStore } from "@/store/useBoundStore";
import { Category_Type, CSV_Data } from "@/types";
import { mapRowWithCategory, updatePreMappedTitles } from "@/utils";
import { normalizeTitle } from "@/utils/titleNormalization";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryMappingService } from "@/services/gemini";

export type TitleRecords = {
  title: string;
  category: Category_Type;
  count: number;
};

export type PreMappedTitles = Record<string, Category_Type>;

const OptionsFromDefaultCategory = CATEGORY_LIST.map((name) => {
  return (
    <SelectItem key={name} value={name}>
      {name}
    </SelectItem>
  );
});

const getPreMappedTitles = async (
  rootFolderId: string
): Promise<
  | {
      fileId: string;
      data: PreMappedTitles;
    }
  | undefined
> => {
  // check if json file already exists
  const titleMapFileId = await getJsonFileByName(DEFAULT_TITLE_MAP_FILE);
  // yes => read and return json and fileId
  if (titleMapFileId) {
    const titleMap =
      (await readJsonFileContent<PreMappedTitles>(titleMapFileId)) ?? {};
    return {
      fileId: titleMapFileId,
      data: titleMap,
    };
  }
  // no => create and return empty json and fileId
  const newTitleMapFileId = await createJsonFile(
    DEFAULT_TITLE_MAP_FILE,
    {},
    rootFolderId
  );
  if (newTitleMapFileId) {
    return {
      fileId: newTitleMapFileId,
      data: {},
    };
  }
};

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

const getTitleRecords = (
  preMappedTitles: PreMappedTitles,
  titleMappedData?: CSV_Data
) => {
  console.count("getTitleRecords !!");
  console.log("getTitleRecords :: ", { preMappedTitles, titleMappedData });
  if (titleMappedData) {
    const _titleRecords: Record<
      string,
      { count: number; category: Category_Type }
    > = {};
    for (const row of titleMappedData) {
      const normalizedTitle = normalizeTitle(row.Title as string);
      if (
        _titleRecords[normalizedTitle] &&
        _titleRecords[normalizedTitle].count
      ) {
        _titleRecords[normalizedTitle].count += 1;
      } else {
        _titleRecords[normalizedTitle] = {
          count: 1,
          category: preMappedTitles[normalizedTitle] ?? "Uncategorized",
        };
      }
    }
    const finalList = Object.keys(_titleRecords).map((key) => {
      return {
        title: key,
        count: _titleRecords[key].count,
        category: _titleRecords[key].category,
      };
    });
    return finalList;
  }
  return [];
};

export const TitleMappingScreen = () => {
  const titleMappedData = useBoundStore(
    useShallow((state) => state.titleMappedData)
  );
  const rootFolderId = useBoundStore(useShallow((state) => state.rootFolderId));
  const [preMappedTitles, setPreMappedTitles] = useState<PreMappedTitles>();
  const [preMappedTitlesFileId, setPreMappedTitlesFileId] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
  const [isGeminiLoading, setIsGeminiLoading] = useState<boolean>(false);
  const categoryMappingService = new CategoryMappingService();

  const [titleRecords, setTitleRecords] = useState<TitleRecords[]>([]);

  const handleNext = async () => {
    console.log("Handle Next => ", { titleRecords });
    if (titleMappedData && preMappedTitlesFileId && rootFolderId) {
      const updatedPreMappedTitles = updatePreMappedTitles(titleRecords);
      const categoryMappedData = mapRowWithCategory(
        titleMappedData,
        updatedPreMappedTitles
      );
      await updateJsonFile(preMappedTitlesFileId, updatedPreMappedTitles);
      console.log("Output :: ", { categoryMappedData, updatedPreMappedTitles });
      // [TODO]: Remove this hard coded mapping
      const temporayHardCodedAccountNameData = categoryMappedData.map((row) => {
        return {
          ...row,
          Account: "shubham_spare",
        };
      });
      // [TODO] Assign data, distribute it into yearly, and upload in their respective csv file in the drive
      await sortAndDivideTransactions(
        temporayHardCodedAccountNameData,
        rootFolderId
      );
    }
  };

  useEffect(() => {
    const prepareData = async () => {
      if (rootFolderId) {
        const response = await getPreMappedTitles(rootFolderId);
        if (response) {
          console.warn("Initial fetch of pre mapped Titles");
          setPreMappedTitles(response.data ?? {});
          setPreMappedTitlesFileId(response.fileId);
          setIsLoading(false);
        }
      }
    };
    prepareData();
  }, []);

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
          preMappedTitles[key] !== "Uncategorized" &&
          preMappedTitles[key] !== undefined
            ? preMappedTitles[key]
            : mapping[key];
      }
      console.log("Mapping Data => ", {
        mergedMapping,
        preMappedTitles,
        mapping,
      });
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
      }}
      previousLabel="Previous"
    >
      {!titleMappedData || isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
      ) : (
        <div>
          <Button
            onClick={getMappingWithAI}
            disabled={isGeminiLoading}
            size={"xs"}
            className="bg-gradient-to-r from-purple-400 to-pink-600 hover:from-purple-500 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transform transition duration-500 hover:scale-101 float-right"
          >
            {isGeminiLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
            Auto Assign Categories
          </Button>
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
