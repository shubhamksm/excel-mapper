import { useState } from "react";
import Papa from "papaparse";
import { UploadFile } from "antd";
import { ExcelMappingScreens } from "../types";

const useExcelMappingScreens = () => {
  const [currentScreen, setCurrentScreen] = useState<ExcelMappingScreens>(
    ExcelMappingScreens.UPLOAD_FILE
  );
  const [rawFile, setRawFile] = useState<UploadFile>();
  const [parsedFile, setParsedFile] = useState<unknown[]>();

  const handleUpload = () => {
    Papa.parse(rawFile as unknown as File, {
      header: true,
      complete: (results) => {
        const data = results.data;
        setParsedFile(data);
        console.log(data);
        setCurrentScreen(ExcelMappingScreens.HEADER_MAPPING);
      },
    });
  };

  return {
    rawFile,
    setRawFile,
    handleUpload,
    currentScreen,
  };
};

export default useExcelMappingScreens;
