import { UploadFileScreen } from "./screens/UploadFileScreen";
import { HeaderMappingScreen } from "./screens/HeaderMappingScreen";
import { TitleMappingScreen } from "./screens/TitleMappingScreen";

import Page from "./layouts/Page";
import useExcelMappingScreens from "./hooks/useExcelMappingScreens";
import { ExcelMappingScreens } from "./types";

const App = () => {
  const {
    rawFile,
    setRawFile,
    handleUpload,
    currentScreen,
    headers,
    setMappedHeaders,
    isHeaderMappingNextButtonDisabled,
  } = useExcelMappingScreens();

  const screens = {
    [ExcelMappingScreens.UPLOAD_FILE]: {
      title: "Upload File",
      mainContent: <UploadFileScreen file={rawFile} setFile={setRawFile} />,
      nextLabel: "Next",
      nextButtonProps: {
        onClick: () => {
          handleUpload();
        },
        disabled: !rawFile,
      },
    },
    [ExcelMappingScreens.HEADER_MAPPING]: {
      title: "Header Mapping",
      mainContent: (
        <HeaderMappingScreen
          headers={headers}
          setMappedHeaders={setMappedHeaders}
        />
      ),
      nextLabel: "Next",
      nextButtonProps: {
        onClick: () => {
          console.log("Next");
        },
        disabled: isHeaderMappingNextButtonDisabled,
      },
      previousLabel: "Previous",
      previousButtonProps: {
        onClick: () => {
          console.log("Previous");
        },
      },
    },
    [ExcelMappingScreens.TITLE_MAPPING]: {
      title: "Title Mapping",
      mainContent: <TitleMappingScreen />,
      nextLabel: "Next",
      nextButtonProps: {
        onClick: () => {
          console.log("Next");
        },
      },
      previousLabel: "Previous",
      previousButtonProps: {
        onClick: () => {
          console.log("Previous");
        },
      },
    },
  };

  return (
    <div className="h-screen w-screen bg-slate-500 flex items-center justify-center">
      <div className="p-4 h-2/3 w-2/3 bg-slate-50 rounded-md">
        <Page {...screens[currentScreen]} />
      </div>
    </div>
  );
};

export default App;
