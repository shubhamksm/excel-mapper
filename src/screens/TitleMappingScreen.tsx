import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_LIST } from "@/constants";
import Page from "@/layouts/Page";
import { useBoundStore } from "@/store/useBoundStore";
import { Category_Type } from "@/types";
import { useMemo } from "react";
import { useShallow } from "zustand/shallow";

type TitleRecords = Record<string, { category: Category_Type; count: number }>;

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

export const TitleMappingScreen = () => {
  const titleMappedData = useBoundStore(
    useShallow((state) => state.titleMappedData)
  );
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
            category: "Uncategorized",
          };
        }
      }
      console.log(_titleRecords);
      const titleSortedList = Object.keys(_titleRecords).sort(
        (a, b) => _titleRecords[b].count - _titleRecords[a].count
      );
      console.log(titleSortedList);
      return [_titleRecords, titleSortedList];
    }
    return [{}, []];
  }, []);

  const handleNext = () => {
    console.log("Finish :: ", { titleRecords, titleSortedList });
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
      <div className="flex flex-wrap gap-1.5">
        {titleSortedList.map((title) => {
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
                defaultValue="Uncategorized"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Add Mapping" />
                </SelectTrigger>
                <SelectContent>{OptionsFromDefaultCategory}</SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </Page>
  );
};
