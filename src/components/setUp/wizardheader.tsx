import { Flower } from "lucide-react";

const WizardHeader = () => {
  return (
    <header className="flex items-center gap-2 px-6 py-4 border-b border-border bg-card">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Flower className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground">Acme Corp</span>
      </div>
    </header>
  );
};

export default WizardHeader;
