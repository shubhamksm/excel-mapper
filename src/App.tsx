import React, { useEffect, useState } from "react";
import { Button, Flex, Upload, UploadFile, UploadProps } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Papa from "papaparse";

const App = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    console.log(fileList);
  }, [fileList]);

  const props: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);

      return false;
    },
    fileList,
    disabled: fileList.length === 1,
  };

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

  const handleRemove = () => {
    console.log("Remove File");
    setFileList([]);
  };

  return (
    <div className="App flex flex-col items-center justify-center">
      <Upload {...props}>
        <Flex gap="small" wrap>
          <Button icon={<UploadOutlined />}>Select File</Button>
          <Button danger disabled={fileList.length < 1} onClick={handleRemove}>
            Remove File
          </Button>
        </Flex>
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        style={{ marginTop: 16 }}
      >
        {uploading ? "Uploading" : "Start Upload"}
      </Button>
    </div>
  );
};

export default App;
