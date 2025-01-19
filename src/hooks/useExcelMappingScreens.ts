import { useState } from "react";
import Papa from "papaparse";
import {
  ExcelMappingScreens,
  MappedHeaders,
  Headers,
  CSV_Data,
  Generic_CSV_Data,
} from "@/types";
import { extractHeaders, mapRowWithHeaders } from "@/utils";
import { REQUIRED_TEMPLATE_COLUMNS } from "@/constants";

const useExcelMappingScreens = () => {
  const [currentScreen, setCurrentScreen] = useState<ExcelMappingScreens>(
    ExcelMappingScreens.UPLOAD_FILE
  );
  const [rawFile, setRawFile] = useState<File>();
  const [parsedFile, setParsedFile] = useState<Generic_CSV_Data>();
  const [headers, setHeaders] = useState<Headers>([]);
  const [mappedHeaders, setMappedHeaders] = useState<MappedHeaders>({});
  const [mappedData, setMappedData] = useState<CSV_Data>([]);
  const isHeaderMappingNextButtonDisabled =
    Object.values(mappedHeaders).filter((val) =>
      REQUIRED_TEMPLATE_COLUMNS.includes(val)
    ).length < REQUIRED_TEMPLATE_COLUMNS.length;

  const handleUpload = () => {
    if (rawFile)
      Papa.parse(rawFile, {
        header: true,
        complete: (results) => {
          const data = results.data;
          if (!data || data.length === 0) {
            throw new Error("No data found in the file");
          }
          setParsedFile(data as Generic_CSV_Data);
          const headers = extractHeaders(data[0] as Record<string, unknown>);
          setHeaders(headers);
          setCurrentScreen(ExcelMappingScreens.HEADER_MAPPING);
        },
      });
  };

  const handleHeadersMappingNext = () => {
    if (!parsedFile) {
      throw new Error("No file uploaded");
    }
    const mappedData = mapRowWithHeaders(parsedFile, mappedHeaders);
    setMappedData(mappedData);
    const titleList: Record<string, number> = {};
    for (const row of mappedData) {
      if (titleList[row.Title]) {
        titleList[row.Title] += 1;
      } else {
        titleList[row.Title] = 1;
      }
    }
    console.log(titleList);
    setCurrentScreen(ExcelMappingScreens.TITLE_MAPPING);
  };

  const handleHeadersMappingPrevious = () => {
    setCurrentScreen(ExcelMappingScreens.UPLOAD_FILE);
  };

  return {
    rawFile,
    setRawFile,
    handleUpload,
    currentScreen,
    headers,
    setMappedHeaders,
    isHeaderMappingNextButtonDisabled,
    handleHeadersMappingNext,
    handleHeadersMappingPrevious,
  };
};

export default useExcelMappingScreens;
