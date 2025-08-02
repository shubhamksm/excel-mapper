import { Button } from "@/components/ui/button";
import { steps } from "./ExcelImportModal";
import { useShallow } from "zustand/react/shallow";
import { useBoundStore } from "../store/useBoundStore";

export const ModalFooter = ({
  onNext,
  onPrevious,
  isNextDisabled,
}: {
  onNext?: () => void;
  onPrevious?: () => void;
  isNextDisabled?: boolean;
}) => {
  const [currentScreen, changeCurrentScreen] = useBoundStore(
    useShallow((state) => [state.currentScreen, state.changeCurrentScreen])
  );
  const [setOpen, resetAllImportState] = useBoundStore(
    useShallow((state) => [state.setOpen, state.resetAllImportState])
  );
  const currentStepIndex = steps.findIndex(
    (step) => step.screen === currentScreen
  );

  const handleNext = async () => {
    if (currentStepIndex < steps.length - 1) {
      // Not the last step, just execute onNext and move to next screen
      onNext && (await onNext());
      changeCurrentScreen(steps[currentStepIndex + 1].screen);
    } else {
      // Last step - finish the import process
      try {
        onNext && (await onNext());
        // If we reach here, the upload was successful
        resetAllImportState();
        setOpen(false);
      } catch (error) {
        // If there's an error during upload, don't reset state or close modal
        console.error("Error during final import step:", error);
        // The error should be handled by the step component itself
      }
    }
  };

  const handlePrevious = () => {
    onPrevious && onPrevious();
    if (currentStepIndex > 0) {
      changeCurrentScreen(steps[currentStepIndex - 1].screen);
    }
  };

  return (
    <div className="flex justify-between mt-4">
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={currentStepIndex === 0}
      >
        Previous
      </Button>
      <Button disabled={isNextDisabled} onClick={handleNext}>
        {currentStepIndex === steps.length - 1 ? "Finish" : "Next"}
      </Button>
    </div>
  );
};
