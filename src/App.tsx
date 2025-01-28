import { useAuth } from "@/contexts/AuthContext";
import { Login } from "@/containers/Login";
import { accountService } from "./services/accountService";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useShallow } from "zustand/react/shallow";
import { ExcelImportModal } from "./features/import/components/ExcelImportModal";

const App = () => {
  const { user } = useAuth();
  const setAccounts = useAppStore(useShallow((state) => state.setAccounts));

  useEffect(() => {
    if (user) {
      const fetchAccounts = async () => {
        const accounts = await accountService.getUserAccounts(user.uid);
        setAccounts(accounts);
      };
      fetchAccounts();
    }
  }, [user]);

  if (!user) {
    return <Login />;
  }

  return (
    <div className="h-screen w-screen bg-slate-500 flex items-center justify-center">
      <div className="p-4 h-2/3 w-2/3 bg-slate-50 rounded-md">
        <ExcelImportModal />
      </div>
    </div>
  );
};

export default App;
