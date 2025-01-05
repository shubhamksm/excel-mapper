import { UploadFileScreen } from "./screens/UploadFileScreen";

import Page from "./layouts/Page";
import useExcelMappingScreens from "./hooks/useExcelMappingScreens";

const App = () => {
  const { rawFile, setRawFile, handleUpload } = useExcelMappingScreens();

  return (
    <div className="h-screen w-screen bg-slate-500 flex items-center justify-center">
      <div className="p-4 h-2/3 w-2/3 bg-slate-50 rounded-md">
        <Page
          title="Upload File"
          mainContent={<UploadFileScreen file={rawFile} setFile={setRawFile} />}
          nextLabel="Next"
          nextButtonProps={{
            onClick: () => {
              handleUpload();
            },
            disabled: !rawFile,
          }}
        />
      </div>
    </div>
  );
};

export default App;
