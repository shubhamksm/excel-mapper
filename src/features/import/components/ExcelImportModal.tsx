import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadFileStep } from "./steps/UploadFileStep";
import { HeaderMappingStep } from "./steps/HeaderMappingStep";
import { TitleMappingStep } from "./steps/TitleMappingStep";
import { StepIndicator } from "./StepIndicator";
import { useBoundStore } from "@/features/import/store/useBoundStore";
import { ExcelMappingScreens } from "@/types";
import { useShallow } from "zustand/react/shallow";

export const steps = [
  { title: "Upload File", screen: ExcelMappingScreens.UPLOAD_FILE },
  { title: "Map Headers", screen: ExcelMappingScreens.HEADER_MAPPING },
  { title: "Assign Categories", screen: ExcelMappingScreens.TITLE_MAPPING },
];

export const ExcelImportModal = () => {
  const currentScreen = useBoundStore(
    useShallow((state) => state.currentScreen)
  );
  const [open, setOpen, resetAllImportState] = useBoundStore(
    useShallow((state) => [
      state.open,
      state.setOpen,
      state.resetAllImportState,
    ])
  );

  const currentStepIndex = steps.findIndex(
    (step) => step.screen === currentScreen
  );

  const getCurrentStep = () => {
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
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Import Excel File
      </Button>
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen);
          // If dialog is being closed (newOpen is false), reset the state
          // This handles manual closes (ESC key, clicking outside, X button)
          if (!newOpen) {
            resetAllImportState();
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[80vh] h-[80vh]">
          <DialogHeader>
            <DialogTitle>Import Excel File</DialogTitle>
          </DialogHeader>
          <StepIndicator steps={steps} currentStep={currentStepIndex} />
          {getCurrentStep()}
        </DialogContent>
      </Dialog>
    </>
  );
};
