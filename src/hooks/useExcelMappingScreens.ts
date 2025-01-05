import { useState } from "react";
import Papa from "papaparse";
import { UploadFile } from "antd";

const useExcelMappingScreens = () => {
  const [rawFile, setRawFile] = useState<UploadFile>();
  const [parsedFile, setParsedFile] = useState<unknown[]>();

  const handleUpload = () => {
    Papa.parse(rawFile as unknown as File, {
      header: true,
      complete: (results) => {
        const data = results.data;
        setParsedFile(data);
        console.log(data);
      },
    });
  };

  return {
    rawFile,
    setRawFile,
    handleUpload,
  };
};

export default useExcelMappingScreens;
