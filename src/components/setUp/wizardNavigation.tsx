import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface WizardNavigationProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isSubmitting?: boolean;
  nextLabel?: string;
  previousLabel?: string;
  submitLabel?: string;
}

const WizardNavigation = ({
  onPrevious,
  onNext,
  onSubmit,
  isFirstStep = false,
  isLastStep = false,
  isSubmitting = false,
  nextLabel = "Continue",
  previousLabel = "Back",
  submitLabel = "Submit",
}: WizardNavigationProps) => {
  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
      <div>
        {!isFirstStep && (
          <Button
            variant="ghost"
            onClick={onPrevious}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {previousLabel}
          </Button>
        )}
      </div>
      <div>
        {isLastStep ? (
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
          >
            {isSubmitting ? "Submitting..." : submitLabel}
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
          >
            {nextLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default WizardNavigation;
