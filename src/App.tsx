import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useShallow } from "zustand/react/shallow";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { getFolderByName, createFolder } from "@/services/drive";
import { Button } from "@/components/ui/button";
import { DEFAULT_FOLDER_NAME } from "@/constants";
import { initClient, signIn } from "@/services/auth";
import { initializeDriveSync } from "@/database";
import { Dashboard } from "@/features/dashboard";
import { Accounts } from "@/features/accounts";
import { Transactions } from "@/features/transactions";
import { Budgets } from "@/features/budgets";
import { Goals } from "@/features/goals";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

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

  if (!isLoggedIn) {
    return (
      <div className="h-screen p-4 w-screen bg-slate-50">
        <div className="w-full h-full flex flex-col justify-center items-center gap-y-4">
          <Button onClick={() => signIn(updateIsLoggedIn)}>Login</Button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 p-6">
          <SidebarTrigger />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/goals" element={<Goals />} />
          </Routes>
        </main>
      </SidebarProvider>
    </BrowserRouter>
  );
};

export default App;
