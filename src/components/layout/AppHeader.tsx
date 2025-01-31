import { useLocation } from "react-router";
import { SidebarTrigger } from "../ui/sidebar";
import { Paths } from "@/constants";

export const AppHeader = () => {
  const location = useLocation();

  return (
    <header className="flex items-center gap-x-2">
      <SidebarTrigger />
      <h1 className="text-2xl font-bold">
        {Paths[location.pathname as keyof typeof Paths]}
      </h1>
    </header>
  );
};
