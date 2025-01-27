import { useState, useEffect } from "react";
import { initClient, signIn } from "@/services/auth";
import { createFolder, getFolderByName } from "@/services/drive";
import { Button } from "@/components/ui/button";
import { useBoundStore } from "@/store/useBoundStore";
import { useShallow } from "zustand/react/shallow";
import { DEFAULT_FOLDER_NAME } from "@/constants";
import { ExcelImportModal } from "@/features/import";

const App = () => {
  const [isLoggedIn, updateIsLoggedIn] = useState<boolean>(false);
  const setRootFolderId = useBoundStore(
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
    const checkFolderPresent = async () => {
      const folderId = await getFolderByName(DEFAULT_FOLDER_NAME);
      if (!folderId) {
        const newFolderId = await createFolder(DEFAULT_FOLDER_NAME);
        setRootFolderId(newFolderId);
      } else {
        setRootFolderId(folderId);
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
          <ExcelImportModal isOpen={true} onClose={() => {}} />
        )}
      </div>
    </div>
  );
};

export default App;
