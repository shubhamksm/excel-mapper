import { useState } from "react";
import { UploadNewFile } from "./screens/UploadNewFile";

import { UploadFile } from "antd";
import Page from "./layouts/Page";

const App = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  return (
    <div className="h-96 flex items-center justify-center">
      <Page
        title="Upload File"
        content={
          <UploadNewFile fileList={fileList} setFileList={setFileList} />
        }
        nextLabel="Next"
      />
    </div>
  );
};

export default App;
