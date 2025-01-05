import { Button, Flex, Upload, UploadProps, UploadFile } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { StateAction } from "../types";

type UploadFileScreenProps = {
  file?: UploadFile;
  setFile: StateAction<UploadFile | undefined>;
};
export const UploadFileScreen = ({ file, setFile }: UploadFileScreenProps) => {
  const props: UploadProps = {
    beforeUpload: (file) => {
      setFile(file);
      return false;
    },
    fileList: file ? [file] : [],
    disabled: !!file,
  };

  const handleRemove = () => {
    setFile(undefined);
  };

  return (
    <Upload {...props}>
      <Flex gap="large" wrap>
        <Button icon={<UploadOutlined />}>Select File</Button>
        <Button danger disabled={!file} onClick={handleRemove}>
          Remove File
        </Button>
      </Flex>
    </Upload>
  );
};
