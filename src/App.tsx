import { UploadFileScreen } from "./screens/UploadFileScreen";
import { HeaderMappingScreen } from "./screens/HeaderMappingScreen";
import { TitleMappingScreen } from "./screens/TitleMappingScreen";

import Page from "./layouts/Page";
import useExcelMappingScreens from "./hooks/useExcelMappingScreens";
import { ExcelMappingScreens } from "./types";
import { useState, useEffect } from "react";
import { Button } from "antd";
import { initClient, signIn } from "./services/auth";
import { createFolder, getFolderByName } from "./services/drive";

const App = () => {
  const {
    rawFile,
    setRawFile,
    handleUpload,
    currentScreen,
    headers,
    setMappedHeaders,
    isHeaderMappingNextButtonDisabled,
    handleHeadersMappingNext,
    handleHeadersMappingPrevious,
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
        onClick: handleHeadersMappingNext,
        disabled: isHeaderMappingNextButtonDisabled,
      },
      previousLabel: "Previous",
      previousButtonProps: {
        onClick: handleHeadersMappingPrevious,
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

  const [isLoggedIn, updateIsLoggedIn] = useState<boolean>(false);
  const [appFolderId, setAppFolderId] = useState<string | undefined>();

  useEffect(() => {
    gapi.load("client:auth2", () =>
      initClient({
        updateLoggedInStatus: (status) => {
          updateIsLoggedIn(status);
        },
      })
    );
  }, []);

  useEffect(() => {
    const checkFolderPresent = async () => {
      const folderId = await getFolderByName();
      if (!folderId) {
        const newFolderId = await createFolder();
        setAppFolderId(newFolderId);
      } else {
        setAppFolderId(folderId);
      }
    };
    if (isLoggedIn) {
      checkFolderPresent();
    }
  }, [isLoggedIn]);

  return (
    <div className="h-screen w-screen bg-slate-500 flex items-center justify-center">
      <div className="p-4 h-2/3 w-2/3 bg-slate-50 rounded-md">
        {!isLoggedIn ? (
          <div className="w-full h-full flex flex-col justify-center items-center gap-y-4">
            <Button onClick={() => signIn(updateIsLoggedIn)}>Login</Button>
          </div>
        ) : (
          <Page {...screens[currentScreen]} />
        )}
      </div>
    </div>
  );
};

export default App;
