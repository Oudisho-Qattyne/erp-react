import type { ReactNode } from "react";
import { CustomSelect } from "../inputs/CustomSelect";
import { inputBaseClasses } from "../inputs/styles";

export interface FactorOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface FactorSelectProps {
  options: FactorOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function FactorSelect({
  options,
  value,
  onChange,
  label,
  disabled,
  className,
}: FactorSelectProps) {
  return (
    <div className={`w-full sm:w-52 ${className ?? ""}`}>
      {label && (
        <label className="block text-xs font-semibold text-text-muted mb-1.5">{label}</label>
      )}
      <CustomSelect
        baseClasses={inputBaseClasses}
        options={options}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}