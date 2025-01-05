import { useState } from "react";
import Papa from "papaparse";
import { UploadFile } from "antd";
import { ExcelMappingScreens, MappedHeaders, Headers } from "../types";
import { extractHeaders } from "../utils";
import { REQUIRED_TEMPLATE_COLUMNS } from "../constants";

const useExcelMappingScreens = () => {
  const [currentScreen, setCurrentScreen] = useState<ExcelMappingScreens>(
    ExcelMappingScreens.UPLOAD_FILE
  );
  const [rawFile, setRawFile] = useState<UploadFile>();
  const [parsedFile, setParsedFile] = useState<unknown[]>();
  const [headers, setHeaders] = useState<Headers>([]);
  const [mappedHeaders, setMappedHeaders] = useState<MappedHeaders>({});
  const isHeaderMappingNextButtonDisabled =
    Object.values(mappedHeaders).filter((val) =>
      REQUIRED_TEMPLATE_COLUMNS.includes(val)
    ).length < REQUIRED_TEMPLATE_COLUMNS.length;

  const handleUpload = () => {
    Papa.parse(rawFile as unknown as File, {
      header: true,
      complete: (results) => {
        const data = results.data;
        if (!data || data.length === 0) {
          throw new Error("No data found in the file");
        }
        setParsedFile(data);
        const headers = extractHeaders(data[0] as Record<string, unknown>);
        setHeaders(headers);
        setCurrentScreen(ExcelMappingScreens.HEADER_MAPPING);
      },
    });
  };

  return {
    rawFile,
    setRawFile,
    handleUpload,
    currentScreen,
    headers,
    setMappedHeaders,
    isHeaderMappingNextButtonDisabled,
  };
};

export default useExcelMappingScreens;
