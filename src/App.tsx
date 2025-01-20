import { UploadFileScreen } from "@/screens/UploadFileScreen";
import { HeaderMappingScreen } from "@/screens/HeaderMappingScreen";
import { TitleMappingScreen } from "@/screens/TitleMappingScreen";

import { useState, useEffect, useCallback } from "react";
import { initClient, signIn } from "@/services/auth";
import { createFolder, getFolderByName } from "@/services/drive";
import { Button } from "@/components/ui/button";
import { useBoundStore } from "./store/useBoundStore";
import { ExcelMappingScreens } from "./types";
import { useShallow } from "zustand/react/shallow";
import { DEFAULT_FOLDER_NAME } from "./constants";

const App = () => {
  const currentScreen = useBoundStore(
    useShallow((state) => state.currentScreen)
  );
  const [isLoggedIn, updateIsLoggedIn] = useState<boolean>(false);
  const [appFolderId, setAppFolderId] = useState<string | undefined>();

  const getCurrentScreen = useCallback(() => {
    switch (currentScreen) {
      case ExcelMappingScreens.UPLOAD_FILE:
        return <UploadFileScreen />;
      case ExcelMappingScreens.HEADER_MAPPING:
        return <HeaderMappingScreen />;
      case ExcelMappingScreens.TITLE_MAPPING:
        return <TitleMappingScreen />;
      default:
        return <UploadFileScreen />;
    }
  }, [currentScreen]);

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
      const folderId = await getFolderByName(DEFAULT_FOLDER_NAME);
      if (!folderId) {
        const newFolderId = await createFolder(DEFAULT_FOLDER_NAME);
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
          getCurrentScreen()
        )}
      </div>
    </div>
  );
};

export default App;
