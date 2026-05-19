/**
 * @deprecated Use <TheInput type="select-or-create" name="..." dependsOn loadOptions /> instead.
 */
import { useFormContext } from 'react-hook-form';
import { TheInput, type SelectOption } from './TheInput';
import type { ReactNode } from 'react';

interface DependentSelectOrCreateProps {
  name: string;
  dependsOn: string[];
  loadOptions: (
    formValues: Record<string, unknown>
  ) => Promise<SelectOption[]> | SelectOption[];
  createTitle: string;
  renderCreateForm: (
    onSuccess: (newValue: string, newItem: unknown) => void,
    onCancel: () => void,
    dependentData: Record<string, unknown>
  ) => ReactNode;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function DependentSelectOrCreate({
  name,
  dependsOn,
  loadOptions,
  createTitle,
  renderCreateForm,
  label,
  placeholder,
  required,
  disabled,
}: DependentSelectOrCreateProps) {
  const { getValues } = useFormContext();

  return (
    <TheInput
      name={name as never}
      type="select-or-create"
      dependsOn={dependsOn as never}
      loadOptions={loadOptions}
      label={label}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      createTitle={createTitle}
      renderCreateForm={(onSuccess, onCancel, dependentData) =>
        renderCreateForm(
          onSuccess,
          onCancel,
          dependentData ?? getDependentSnapshot(getValues, dependsOn)
        )
      }
    />
  );
}

function getDependentSnapshot(
  getValues: () => Record<string, unknown>,
  dependsOn: string[]
) {
  const values = getValues();
  return dependsOn.reduce(
    (acc, field) => {
      acc[field] = values[field];
      return acc;
    },
    {} as Record<string, unknown>
  );
}
