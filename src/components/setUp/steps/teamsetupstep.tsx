import { TextInput, SelectInput } from "../FormField";
import WizardCard from "../wizardcard";

interface TeamSetupData {
  teamSize: string;
  leadName: string;
  leadEmail: string;
  department: string;
}

interface TeamSetupStepProps {
  data: TeamSetupData;
  onChange: (data: TeamSetupData) => void;
}

const teamSizes = [
  { value: "1-5", label: "1-5 members" },
  { value: "6-10", label: "6-10 members" },
  { value: "11-25", label: "11-25 members" },
  { value: "26-50", label: "26-50 members" },
  { value: "50+", label: "50+ members" },
];

const departments = [
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "product", label: "Product" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "other", label: "Other" },
];

const TeamSetupStep = ({ data, onChange }: TeamSetupStepProps) => {
  const updateField = <K extends keyof TeamSetupData>(
    field: K,
    value: TeamSetupData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <WizardCard title="Team Setup" description="Configure your team settings">
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectInput
            label="Team Size"
            placeholder="Select team size"
            value={data.teamSize}
            onChange={(value) => updateField("teamSize", value)}
            options={teamSizes}
            required
          />
          <SelectInput
            label="Department"
            placeholder="Select department"
            value={data.department}
            onChange={(value) => updateField("department", value)}
            options={departments}
            required
          />
        </div>
        <TextInput
          label="Team Lead Name"
          placeholder="Enter team lead name"
          value={data.leadName}
          onChange={(value) => updateField("leadName", value)}
          required
        />
        <TextInput
          label="Team Lead Email"
          placeholder="lead@company.com"
          value={data.leadEmail}
          onChange={(value) => updateField("leadEmail", value)}
          type="email"
          required
        />
      </div>
    </WizardCard>
  );
};

export default TeamSetupStep;
