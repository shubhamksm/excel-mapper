import { ExcelMappingScreens, Template_Columns } from "@/types";
import { REQUIRED_TEMPLATE_COLUMNS, TEMPLATE_COLUMNS } from "@/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Page from "@/layouts/Page";
import { useBoundStore } from "@/store/useBoundStore";
import { extractHeaders, mapRowWithHeaders } from "@/utils";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

const OptionsFromTemplateColumns = TEMPLATE_COLUMNS.map((column) => {
  return (
    <SelectItem key={column} value={column}>
      {column}
    </SelectItem>
  );
});

export const HeaderMappingScreen = () => {
  const [mappedHeaders, setMappedHeaders] = useBoundStore(
    useShallow((state) => [state.mappedHeaders, state.setMappedHeaders])
  );
  const parsedFile = useBoundStore(useShallow((state) => state.parsedFile));
  const changeCurrentScreen = useBoundStore(
    useShallow((state) => state.changeCurrentScreen)
  );
  const setTitleMappedData = useBoundStore(
    useShallow((state) => state.setTitleMappedData)
  );
  const headers = useMemo(() => {
    if (parsedFile) {
      return extractHeaders(parsedFile[0]);
    }
    return [];
  }, []);
  const isHeaderMappingNextButtonDisabled = useMemo(() => {
    return (
      Object.values(mappedHeaders).filter((val) =>
        REQUIRED_TEMPLATE_COLUMNS.includes(val)
      ).length < REQUIRED_TEMPLATE_COLUMNS.length
    );
  }, [mappedHeaders]);

  const handleChange = (header: string, value: Template_Columns) => {
    setMappedHeaders({ [header]: value });
  };

  const handleHeadersMappingNext = () => {
    if (!parsedFile) {
      throw new Error("No file uploaded");
    }
    const mappedData = mapRowWithHeaders(parsedFile, mappedHeaders);
    setTitleMappedData(mappedData);
    changeCurrentScreen(ExcelMappingScreens.TITLE_MAPPING);
  };

  const handleHeadersMappingPrevious = () => {
    changeCurrentScreen(ExcelMappingScreens.UPLOAD_FILE);
  };

  return (
    <Page
      title="Header Mapping"
      nextLabel="Next"
      nextButtonProps={{
        onClick: handleHeadersMappingNext,
        disabled: isHeaderMappingNextButtonDisabled,
      }}
      previousLabel="Previous"
      previousButtonProps={{
        onClick: handleHeadersMappingPrevious,
      }}
    >
      <div className="flex w-2/3 mx-auto flex-col gap-y-4">
        {headers.map((header) => {
          return (
            <div
              className="flex justify-between items-center gap-x-4"
              key={header}
            >
              <h3>{header}</h3>
              <Select
                onValueChange={(value) =>
                  handleChange(header, value as Template_Columns)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Add Mapping" />
                </SelectTrigger>
                <SelectContent>{OptionsFromTemplateColumns}</SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </Page>
  );
};
