import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_LIST, DEFAULT_TITLE_MAP_FILE } from "@/constants";
import Page from "@/layouts/Page";
import {
  createJsonFile,
  getJsonFileByName,
  readJsonFileContent,
  sortAndDivideTransactions,
  updateJsonFile,
} from "@/services/drive";
import { useBoundStore } from "@/store/useBoundStore";
import { Category_Type } from "@/types";
import { mapRowWithCategory, updatePreMappedTitles } from "@/utils";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";

export type TitleRecords = Record<
  string,
  { category: Category_Type; count: number }
>;

export type PreMappedTitles = Record<string, Category_Type>;

const colors = [
  "border-red-200",
  "border-blue-200",
  "border-green-200",
  "border-yellow-200",
  "border-purple-200",
  "border-pink-200",
  "border-indigo-200",
  "border-gray-200",
];

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

export const TitleMappingScreen = () => {
  const titleMappedData = useBoundStore(
    useShallow((state) => state.titleMappedData)
  );
  const rootFolderId = useBoundStore(useShallow((state) => state.rootFolderId));
  const [preMappedTitles, setPreMappedTitles] = useState<PreMappedTitles>({});
  const [preMappedTitlesFileId, setPreMappedTitlesFileId] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [titleRecords, titleSortedList] = useMemo<
    [TitleRecords, string[]]
  >(() => {
    if (titleMappedData) {
      const _titleRecords: TitleRecords = {};
      for (const row of titleMappedData) {
        if (_titleRecords[row.Title] && _titleRecords[row.Title].count) {
          _titleRecords[row.Title].count += 1;
        } else {
          _titleRecords[row.Title] = {
            count: 1,
            category: preMappedTitles[row.Title] ?? "Uncategorized",
          };
        }
      }
      const titleSortedList = Object.keys(_titleRecords).sort(
        (a, b) => _titleRecords[b].count - _titleRecords[a].count
      );
      return [_titleRecords, titleSortedList];
    }
    return [{}, []];
  }, [preMappedTitles, titleMappedData]);

  const handleNext = async () => {
    if (titleMappedData && preMappedTitlesFileId && rootFolderId) {
      const categoryMappedData = mapRowWithCategory(
        titleMappedData,
        titleRecords
      );
      const updatedPreMappedTitles = updatePreMappedTitles(titleRecords);
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
          setPreMappedTitles(response.data);
          setPreMappedTitlesFileId(response.fileId);
          setIsLoading(false);
        }
      }
    };
    prepareData();
  }, []);

  const renderContent = useMemo(() => {
    return titleSortedList.map((title) => {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      return (
        <div
          key={title}
          className={`flex items-center justify-center rounded-lg border-2 ${randomColor} p-1.5 gap-1.5`}
        >
          <label>{`${title} (${titleRecords[title].count})`}</label>
          <Select
            onValueChange={(category: Category_Type) => {
              titleRecords[title].category = category;
            }}
            defaultValue={titleRecords[title].category}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Add Mapping" />
            </SelectTrigger>
            <SelectContent>{OptionsFromDefaultCategory}</SelectContent>
          </Select>
        </div>
      );
    });
  }, [preMappedTitles, titleMappedData]);

  return (
    <Page
      title="Title Mapping"
      nextLabel="Finish"
      nextButtonProps={{
        onClick: handleNext,
      }}
      previousLabel="Previous"
    >
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">{renderContent}</div>
      )}
    </Page>
  );
};
