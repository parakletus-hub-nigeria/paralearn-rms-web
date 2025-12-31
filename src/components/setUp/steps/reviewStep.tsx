import WizardCard from "../wizardcard";
import { Separator } from "@/components/ui/separator";

interface ReviewData {
  projectInfo: {
    projectName: string;
    projectType: string;
    description: string;
    startDate: string;
  };
  teamSetup: {
    teamSize: string;
    leadName: string;
    leadEmail: string;
    department: string;
  };
  budget: {
    budgetRange: string;
    currency: string;
    timeline: string;
    notes: string;
  };
}

interface ReviewStepProps {
  data: ReviewData;
}

const ReviewItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between py-2">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value || "—"}</span>
  </div>
);

const ReviewStep = ({ data }: ReviewStepProps) => {
  return (
    <WizardCard
      title="Review & Submit"
      description="Review your information before submitting"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Project Information
          </h3>
          <div className="bg-muted/50 rounded-lg p-4 space-y-1">
            <ReviewItem
              label="Project Name"
              value={data.projectInfo.projectName}
            />
            <ReviewItem
              label="Project Type"
              value={data.projectInfo.projectType}
            />
            <ReviewItem
              label="Description"
              value={data.projectInfo.description}
            />
            <ReviewItem label="Start Date" value={data.projectInfo.startDate} />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Team Setup
          </h3>
          <div className="bg-muted/50 rounded-lg p-4 space-y-1">
            <ReviewItem label="Team Size" value={data.teamSetup.teamSize} />
            <ReviewItem label="Department" value={data.teamSetup.department} />
            <ReviewItem label="Team Lead" value={data.teamSetup.leadName} />
            <ReviewItem label="Lead Email" value={data.teamSetup.leadEmail} />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Budget & Timeline
          </h3>
          <div className="bg-muted/50 rounded-lg p-4 space-y-1">
            <ReviewItem label="Budget Range" value={data.budget.budgetRange} />
            <ReviewItem label="Currency" value={data.budget.currency} />
            <ReviewItem label="Timeline" value={data.budget.timeline} />
            <ReviewItem label="Notes" value={data.budget.notes} />
          </div>
        </div>
      </div>
    </WizardCard>
  );
};

export default ReviewStep;
