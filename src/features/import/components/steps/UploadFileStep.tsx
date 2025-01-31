import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBoundStore } from "@/features/import/store/useBoundStore";
import { FileSpreadsheet, Upload } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Generic_CSV_Data } from "@/types";
import Papa from "papaparse";
import { ModalFooter } from "../ModalFooter";

export const UploadFileStep = () => {
  const [rawFile, setRawFile] = useBoundStore(
    useShallow((state) => [state.rawFile, state.setRawFile])
  );
  const setParsedFile = useBoundStore(
    useShallow((state) => state.setParsedFile)
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
    <>
      <div className="space-y-4 h-full flex-1 overflow-y-auto w-full">
        <p className="text-sm text-muted-foreground text-center">
          Upload your CSV or Excel file to get started.
        </p>
        {rawFile ? (
          <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70">
            <FileSpreadsheet className="w-10 h-10 mb-3 text-muted-foreground" />
            <div className="flex flex-col items-center justify-between w-full">
              <p className="mb-2 text-sm text-muted-foreground">
                {rawFile.name}
              </p>
              <Button onClick={handleRemove} variant="destructive" size="sm">
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-muted-foreground">
                CSV or Excel file (MAX. 10MB)
              </p>
            </div>
            <Input
              ref={inputRef}
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={(e) => {
                setRawFile(e.target.files ? e.target.files[0] : undefined);
              }}
              accept=".csv,.xlsx,.xls"
            />
          </label>
        )}
      </div>
      <ModalFooter isNextDisabled={!rawFile} onNext={handleUpload} />
    </>
  );
};
