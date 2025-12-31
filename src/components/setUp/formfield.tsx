import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  required?: boolean;
  description?: string;
  error?: string;
  children?: React.ReactNode;
  className?: string;
}

export const FormFieldWrapper = ({
  label,
  required,
  description,
  error,
  children,
  className,
}: FormFieldProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

interface TextInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  description?: string;
  error?: string;
  type?: "text" | "email" | "password" | "url";
}

export const TextInput = ({
  label,
  placeholder,
  value,
  onChange,
  required,
  description,
  error,
  type = "text",
}: TextInputProps) => {
  return (
    <FormFieldWrapper
      label={label}
      required={required}
      description={description}
      error={error}
    >
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 bg-background border-input focus:ring-2 focus:ring-primary/20 focus:border-primary",
          error && "border-destructive focus:ring-destructive/20"
        )}
      />
    </FormFieldWrapper>
  );
};

interface TextAreaInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  description?: string;
  error?: string;
  rows?: number;
}

export const TextAreaInput = ({
  label,
  placeholder,
  value,
  onChange,
  required,
  description,
  error,
  rows = 4,
}: TextAreaInputProps) => {
  return (
    <FormFieldWrapper
      label={label}
      required={required}
      description={description}
      error={error}
    >
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={cn(
          "bg-background border-input focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none",
          error && "border-destructive focus:ring-destructive/20"
        )}
      />
    </FormFieldWrapper>
  );
};

interface SelectInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  description?: string;
  error?: string;
}

export const SelectInput = ({
  label,
  placeholder = "Select an option",
  value,
  onChange,
  options,
  required,
  description,
  error,
}: SelectInputProps) => {
  return (
    <FormFieldWrapper
      label={label}
      required={required}
      description={description}
      error={error}
    >
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            "h-10 bg-background border-input focus:ring-2 focus:ring-primary/20",
            error && "border-destructive focus:ring-destructive/20"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormFieldWrapper>
  );
};
