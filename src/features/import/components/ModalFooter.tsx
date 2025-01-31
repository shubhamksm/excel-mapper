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
  const setOpen = useBoundStore(useShallow((state) => state.setOpen));
  const currentStepIndex = steps.findIndex(
    (step) => step.screen === currentScreen
  );

  const handleNext = async () => {
    onNext && (await onNext());
    if (currentStepIndex < steps.length - 1) {
      changeCurrentScreen(steps[currentStepIndex + 1].screen);
    } else {
      setOpen(false);
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
