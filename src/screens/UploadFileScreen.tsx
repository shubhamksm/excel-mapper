import { Input } from "@/components/ui/input";
import { StateAction } from "@/types";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type UploadFileScreenProps = {
  file?: File;
  setFile: StateAction<File | undefined>;
};
export const UploadFileScreen = ({ file, setFile }: UploadFileScreenProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRemove = () => {
    setFile(undefined);
  };

  useEffect(() => {
    if (inputRef.current) {
      const dataTransfer = new DataTransfer();
      file && dataTransfer.items.add(file);
      inputRef.current.files = dataTransfer.files;
    }
  }, [file]);

  return (
    <div className="flex w-2/3 mx-auto items-center gap-1.5">
      <Input
        ref={inputRef}
        type="file"
        onChange={(e) =>
          setFile(e.target.files ? e.target.files[0] : undefined)
        }
      />
      <Button onClick={handleRemove} variant={"destructive"} disabled={!file}>
        Remove File
      </Button>
    </div>
  );
};
