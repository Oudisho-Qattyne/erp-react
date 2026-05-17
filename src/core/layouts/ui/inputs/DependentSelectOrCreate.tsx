'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { SelectOrCreate } from './SelectOrCreate';

interface DependentSelectOrCreateProps {
  name: string;                      // field name in react-hook-form
  dependsOn: string[];              // fields whose changes trigger reload
  loadOptions: (formValues: Record<string, any>) => Promise<{ value: string; label: string }[]> | { value: string; label: string }[];
  createTitle: string;
  renderCreateForm: (
    onSuccess: (newValue: string, newItem: any) => void,
    onCancel: () => void,
    dependentData: Record<string, any>  // current values of dependsOn
  ) => React.ReactNode;
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
  const { watch, setValue, getValues } = useFormContext();
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const currentValue = watch(name);

  // Watch all dependent fields
  const dependentValues = watch(dependsOn);

  // Reload options when dependencies change
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      const formValues = getValues();
      const result = await loadOptions(formValues);
      setOptions(result);
      setLoading(false);
    };
    fetchOptions();
  }, [dependentValues, loadOptions, getValues]);

  // If current value is no longer in options, clear it
  useEffect(() => {
    if (currentValue && !options.some(opt => opt.value === currentValue)) {
      setValue(name, '', { shouldValidate: true });
    }
  }, [options, currentValue, name, setValue]);

  const handleChange = (val: string) => {
    setValue(name, val, { shouldValidate: true });
  };

  const handleCreateSuccess = (newValue: string, newItem: any) => {
    setValue(name, newValue, { shouldValidate: true });
    // Optionally, add new option to the list
    setOptions(prev => [...prev, { value: newValue, label: newItem.label }]);
  };

  // Pass dependent values to the creation form
  const currentFormValues = getValues();
  const dependentData = dependsOn.reduce((acc, field) => {
    acc[field] = currentFormValues[field];
    return acc;
  }, {} as Record<string, any>);

  if (loading && options.length === 0) {
    return <div className="text-sm text-text-muted">جار التحميل...</div>;
  }

  return (
    <SelectOrCreate
      value={currentValue}
      onChange={handleChange}
      options={options}
      label={label}
      placeholder={placeholder}
      required={required}
      disabled={disabled || loading}
      createTitle={createTitle}
      renderCreateForm={(onSuccess, onCancel) =>
        renderCreateForm(onSuccess, onCancel, dependentData)
      }
    />
  );
}