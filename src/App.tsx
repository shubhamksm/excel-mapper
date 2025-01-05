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
    <div className="h-96 flex items-center justify-center">
      <Page
        title="Upload File"
        content={
          <UploadNewFile
            fileList={fileList}
            setFileList={setFileList}
            handleNextClick={handleUpload}
            uploading={uploading}
          />
        }
        type="primary"
        nextLabel="Next"
        disabled={fileList.length === 0}
        loading={uploading}
        handleNextClick={handleUpload}
      />
    </div>
  );
};

export default App;
