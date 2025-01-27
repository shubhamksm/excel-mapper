import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Page from "@/layouts/Page";
import { useBoundStore } from "@/features/import/store/useBoundStore";
import Papa from "papaparse";
import { ExcelMappingScreens, Generic_CSV_Data } from "@/types";
import { useShallow } from "zustand/react/shallow";

export const UploadFileStep = () => {
  const [rawFile, setRawFile] = useBoundStore(
    useShallow((state) => [state.rawFile, state.setRawFile])
  );
  const setParsedFile = useBoundStore(
    useShallow((state) => state.setParsedFile)
  );
  const changeCurrentScreen = useBoundStore(
    useShallow((state) => state.changeCurrentScreen)
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRemove = () => {
    setRawFile(undefined);
  };

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
          changeCurrentScreen(ExcelMappingScreens.HEADER_MAPPING);
        },
      });
  };

  useEffect(() => {
    if (inputRef.current) {
      const dataTransfer = new DataTransfer();
      rawFile && dataTransfer.items.add(rawFile);
      inputRef.current.files = dataTransfer.files;
    }
  }, [rawFile]);

  return (
    <Page
      title="Upload File"
      nextLabel="Next"
      nextButtonProps={{
        onClick: () => {
          handleUpload();
        },
        disabled: !rawFile,
      }}
    >
      <div className="flex w-2/3 mx-auto items-center gap-1.5">
        <Input
          ref={inputRef}
          type="file"
          onChange={(e) =>
            setRawFile(e.target.files ? e.target.files[0] : undefined)
          }
        />
        <Button
          onClick={handleRemove}
          variant={"destructive"}
          disabled={!rawFile}
        >
          Remove File
        </Button>
      </div>
    </Page>
  );
};
