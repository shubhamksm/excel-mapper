import React, { useEffect } from "react";
import { Button, Flex, Upload, UploadProps, UploadFile } from "antd";
import { UploadOutlined } from "@ant-design/icons";

type UploadNewFileProps = {
  fileList: UploadFile[];
  setFileList: React.Dispatch<React.SetStateAction<UploadFile[]>>;
  handleNextClick: () => void;
  uploading: boolean;
};
export const UploadNewFile = ({
  fileList,
  setFileList,
}: UploadNewFileProps) => {
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

  const handleRemove = () => {
    console.log("Remove File");
    setFileList([]);
  };

  return (
    <div>
      <Upload {...props}>
        <Flex gap="large" wrap>
          <Button icon={<UploadOutlined />}>Select File</Button>
          <Button danger disabled={fileList.length < 1} onClick={handleRemove}>
            Remove File
          </Button>
        </Flex>
      </Upload>
      {/* <Button
        type="primary"
        onClick={handleNextClick}
        disabled={fileList.length === 0}
        loading={uploading}
        style={{ marginTop: 16 }}
      >
        {uploading ? "Uploading" : "Start Upload"}
      </Button> */}
    </div>
  );
};
