import { cn } from "@/lib/utils";

interface WizardCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const WizardCard = ({
  title,
  description,
  children,
  className,
}: WizardCardProps) => {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-6 shadow-sm",
        className
      )}
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
};

export default WizardCard;
