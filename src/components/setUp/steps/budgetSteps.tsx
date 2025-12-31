import { SelectInput, TextAreaInput, TextInput } from "../formfield";
import WizardCard from "../wizardcard";

interface BudgetData {
  budgetRange: string;
  currency: string;
  timeline: string;
  notes: string;
}

interface BudgetStepProps {
  data: BudgetData;
  onChange: (data: BudgetData) => void;
}

const budgetRanges = [
  { value: "5k-10k", label: "$5,000 - $10,000" },
  { value: "10k-25k", label: "$10,000 - $25,000" },
  { value: "25k-50k", label: "$25,000 - $50,000" },
  { value: "50k-100k", label: "$50,000 - $100,000" },
  { value: "100k+", label: "$100,000+" },
];

const currencies = [
  { value: "usd", label: "USD ($)" },
  { value: "eur", label: "EUR (€)" },
  { value: "gbp", label: "GBP (£)" },
  { value: "cad", label: "CAD ($)" },
];

const timelines = [
  { value: "1-2months", label: "1-2 months" },
  { value: "3-6months", label: "3-6 months" },
  { value: "6-12months", label: "6-12 months" },
  { value: "12months+", label: "12+ months" },
];

const BudgetStep = ({ data, onChange }: BudgetStepProps) => {
  const updateField = <K extends keyof BudgetData>(
    field: K,
    value: BudgetData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <WizardCard
      title="Budget & Timeline"
      description="Set your project budget and timeline expectations"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectInput
            label="Budget Range"
            placeholder="Select budget range"
            value={data.budgetRange}
            onChange={(value) => updateField("budgetRange", value)}
            options={budgetRanges}
            required
          />
          <SelectInput
            label="Currency"
            placeholder="Select currency"
            value={data.currency}
            onChange={(value) => updateField("currency", value)}
            options={currencies}
            required
          />
        </div>
        <SelectInput
          label="Project Timeline"
          placeholder="Select expected timeline"
          value={data.timeline}
          onChange={(value) => updateField("timeline", value)}
          options={timelines}
          required
        />
        <TextAreaInput
          label="Additional Notes"
          placeholder="Any additional budget or timeline considerations..."
          value={data.notes}
          onChange={(value) => updateField("notes", value)}
          rows={3}
        />
      </div>
    </WizardCard>
  );
};

export default BudgetStep;
