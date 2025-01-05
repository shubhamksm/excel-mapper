import { useState } from "react";
import { UploadNewFile } from "./screens/UploadNewFile";
import Papa from "papaparse";
import { UploadFile } from "antd";
import Page from "./layouts/Page";

const App = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    setUploading(true);
    Papa.parse(fileList[0] as unknown as File, {
      header: true,
      complete: (results) => {
        const data = results.data;
        console.log(data);
        setUploading(false);
      },
    });
  };

  return (
    <div className="h-screen w-screen bg-slate-500 flex items-center justify-center">
      <div className="p-4 h-2/3 w-2/3 bg-slate-50 rounded-md">
        <Page
          title="Upload File"
          mainContent={
            <UploadNewFile
              fileList={fileList}
              setFileList={setFileList}
              handleNextClick={handleUpload}
              uploading={uploading}
            />
          }
          nextLabel="Next"
        />
      </div>
    </div>
  );
};

export default App;
