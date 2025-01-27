import { HeaderMappingStep, TitleMappingStep, UploadFileStep } from "./steps";
import { useShallow } from "zustand/react/shallow";
import { useBoundStore } from "@/features/import/store/useBoundStore";
import { ExcelMappingScreens } from "@/types";
import { useCallback } from "react";

export const ExcelImportModal = () => {
  const currentScreen = useBoundStore(
    useShallow((state) => state.currentScreen)
  );

  const getCurrentScreen = useCallback(() => {
    switch (currentScreen) {
      case ExcelMappingScreens.UPLOAD_FILE:
        return <UploadFileStep />;
      case ExcelMappingScreens.HEADER_MAPPING:
        return <HeaderMappingStep />;
      case ExcelMappingScreens.TITLE_MAPPING:
        return <TitleMappingStep />;
      default:
        return <UploadFileStep />;
    }
  }, [currentScreen]);

  return getCurrentScreen();
};
