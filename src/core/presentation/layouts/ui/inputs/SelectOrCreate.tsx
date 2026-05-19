/**
 * @deprecated Use <TheInput type="select-or-create" /> instead.
 */
import type { ReactNode } from 'react';
import { TheInput, type SelectOption } from './TheInput';

interface SelectOrCreateProps {
  value?: string;
  onChange: (value: string, newItem?: unknown) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  createTitle: string;
  renderCreateForm: (
    onSuccess: (newValue: string, newItem: unknown) => void,
    onCancel: () => void
  ) => ReactNode;
}

export function SelectOrCreate({
  value,
  onChange,
  options,
  placeholder,
  label,
  required,
  error,
  disabled,
  searchable,
  createTitle,
  renderCreateForm,
}: SelectOrCreateProps) {
  return (
    <TheInput
      type="select-or-create"
      value={value}
      onChange={(val, item) => onChange(val as string, item)}
      options={options}
      placeholder={placeholder}
      label={label}
      required={required}
      error={error}
      disabled={disabled}
      searchable={searchable}
      createTitle={createTitle}
      renderCreateForm={(onSuccess, onCancel) =>
        renderCreateForm(onSuccess, onCancel)
      }
    />
  );
}
