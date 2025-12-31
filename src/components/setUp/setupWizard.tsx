import { useState } from "react";
import WizardHeader from "./wizardheader";
import StepIndicator from "./stepindicator";
import WizardNavigation from "./wizardNavigation";
import ProjectInfoStep from "./steps/projectinfostep";
import TeamSetupStep from "./steps/teamsetupstep";
import BudgetStep from "./steps/budgetSteps";
import ReviewStep from "./steps/reviewStep";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

const steps = [
  { id: 1, label: "Project Info" },
  { id: 2, label: "Team Setup" },
  { id: 3, label: "Budget" },
  { id: 4, label: "Review" },
];

const SetupWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [projectInfo, setProjectInfo] = useState({
    projectName: "",
    projectType: "",
    description: "",
    startDate: "",
  });

  const [teamSetup, setTeamSetup] = useState({
    teamSize: "",
    leadName: "",
    leadEmail: "",
    department: "",
  });

  const [budget, setBudget] = useState({
    budgetRange: "",
    currency: "",
    timeline: "",
    notes: "",
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsCompleted(true);
    toast.success("Project setup completed successfully!");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ProjectInfoStep data={projectInfo} onChange={setProjectInfo} />;
      case 2:
        return <TeamSetupStep data={teamSetup} onChange={setTeamSetup} />;
      case 3:
        return <BudgetStep data={budget} onChange={setBudget} />;
      case 4:
        return (
          <ReviewStep
            data={{
              projectInfo,
              teamSetup,
              budget,
            }}
          />
        );
      default:
        return null;
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background">
        <WizardHeader />
        <div className="max-w-lg mx-auto px-4 py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Setup Complete!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your project has been successfully configured. You can now start
              working on it.
            </p>
            <button
              onClick={() => {
                setIsCompleted(false);
                setCurrentStep(1);
                setProjectInfo({
                  projectName: "",
                  projectType: "",
                  description: "",
                  startDate: "",
                });
                setTeamSetup({
                  teamSize: "",
                  leadName: "",
                  leadEmail: "",
                  department: "",
                });
                setBudget({
                  budgetRange: "",
                  currency: "",
                  timeline: "",
                  notes: "",
                });
              }}
              className="text-primary hover:underline text-sm font-medium"
            >
              Start a new project
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <WizardHeader />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <StepIndicator steps={steps} currentStep={currentStep} />
        {renderStep()}
        <WizardNavigation
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
          isFirstStep={currentStep === 1}
          isLastStep={currentStep === steps.length}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default SetupWizard;
