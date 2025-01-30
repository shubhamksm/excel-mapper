import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useShallow } from "zustand/react/shallow";
import { ExcelImportModal } from "@/features/import/components/ExcelImportModal";
import { getFolderByName } from "@/services/drive";
import { createFolder } from "@/services/drive";
import { Button } from "@/components/ui/button";
import { DEFAULT_FOLDER_NAME } from "@/constants";
import { initClient, signIn } from "@/services/auth";
import { initializeDriveSync } from "./database";

const App = () => {
  const [isLoggedIn, updateIsLoggedIn] = useState<boolean>(false);
  const setRootFolderId = useAppStore(
    useShallow((state) => state.setRootFolderId)
  );

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
    const initializeApp = async () => {
      const folderId = await getFolderByName(DEFAULT_FOLDER_NAME);
      if (!folderId) {
        const newFolderId = await createFolder(DEFAULT_FOLDER_NAME);
        setRootFolderId(newFolderId);
      } else {
        setRootFolderId(folderId);
      }
      initializeDriveSync().catch((error) => {
        console.error("Error initializing drive sync:", error);
      });
    };
    if (isLoggedIn) {
      initializeApp();
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
          <ExcelImportModal />
        )}
      </div>
    </div>
  );
};

export default App;
