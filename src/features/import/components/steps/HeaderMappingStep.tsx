import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBoundStore } from "@/features/import/store/useBoundStore";
import { extractHeaders, mapRowWithHeaders } from "@/utils";
import { REQUIRED_TEMPLATE_COLUMNS, TEMPLATE_COLUMNS } from "@/constants";
import type { Template_Columns } from "@/types";
import { useShallow } from "zustand/react/shallow";
import { ModalFooter } from "../ModalFooter";

export const HeaderMappingStep = () => {
  const [mappedHeaders, setMappedHeaders, parsedFile, setTitleMappedData] =
    useBoundStore(
      useShallow((state) => [
        state.mappedHeaders,
        state.setMappedHeaders,
        state.parsedFile,
        state.setTitleMappedData,
      ])
    );

  const isHeaderMappingNextButtonDisabled = useMemo(() => {
    return (
      Object.values(mappedHeaders).filter((val) =>
        REQUIRED_TEMPLATE_COLUMNS.includes(val)
      ).length < REQUIRED_TEMPLATE_COLUMNS.length
    );
  }, [mappedHeaders]);

  const headers = useMemo(() => {
    if (parsedFile) {
      return extractHeaders(parsedFile[0]);
    }
    return [];
  }, [parsedFile]);

  const handleChange = (header: string, value: Template_Columns) => {
    setMappedHeaders({ ...mappedHeaders, [header]: value });
  };

  const handleNext = () => {
    if (!parsedFile) {
      throw new Error("No file uploaded");
    }
    const mappedData = mapRowWithHeaders(parsedFile, mappedHeaders);
    setTitleMappedData(mappedData);
  };

  return (
    <>
      <div className="space-y-4 h-full flex-1 overflow-y-auto w-full">
        <p className="text-sm text-muted-foreground text-center">
          Map your file headers to the corresponding fields in our system.
        </p>
        {headers.map((header) => (
          <div key={header} className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium">{header}</span>
            <Select
              value={mappedHeaders[header]}
              onValueChange={(value) =>
                handleChange(header, value as Template_Columns)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_COLUMNS.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column.charAt(0).toUpperCase() + column.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      <ModalFooter
        isNextDisabled={isHeaderMappingNextButtonDisabled}
        onNext={handleNext}
      />
    </>
  );
};
