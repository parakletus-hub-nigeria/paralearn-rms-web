import { TextInput, SelectInput, TextAreaInput } from "../FormField";
import WizardCard from "../wizardcard";

interface ProjectInfoData {
  projectName: string;
  projectType: string;
  description: string;
  startDate: string;
}

interface ProjectInfoStepProps {
  data: ProjectInfoData;
  onChange: (data: ProjectInfoData) => void;
}

const projectTypes = [
  { value: "web", label: "Web Application" },
  { value: "mobile", label: "Mobile Application" },
  { value: "api", label: "API Service" },
  { value: "design", label: "Design Project" },
  { value: "other", label: "Other" },
];

const ProjectInfoStep = ({ data, onChange }: ProjectInfoStepProps) => {
  const updateField = <K extends keyof ProjectInfoData>(
    field: K,
    value: ProjectInfoData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <WizardCard
      title="Project Information"
      description="Tell us about your project"
    >
      <div className="space-y-5">
        <TextInput
          label="Project Name"
          placeholder="Enter project name"
          value={data.projectName}
          onChange={(value) => updateField("projectName", value)}
          required
        />
        <SelectInput
          label="Project Type"
          placeholder="Select project type"
          value={data.projectType}
          onChange={(value) => updateField("projectType", value)}
          options={projectTypes}
          required
        />
        <TextAreaInput
          label="Project Description"
          placeholder="Describe your project in detail..."
          value={data.description}
          onChange={(value) => updateField("description", value)}
          description="Provide a brief overview of what you want to build"
          rows={4}
        />
        <TextInput
          label="Expected Start Date"
          placeholder="Select a date"
          value={data.startDate}
          onChange={(value) => updateField("startDate", value)}
          type="text"
        />
      </div>
    </WizardCard>
  );
};

export default ProjectInfoStep;
