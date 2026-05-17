'use client';

import React, { useMemo } from 'react';
import { useFormContext, Path, FieldValues, useFormState } from 'react-hook-form';
import { SelectOrCreate } from './SelectOrCreate';
import { Input, InputType } from './Input';
import { ComputedProps, useDependentField } from '../../../hooks/useDependentField';

export interface DependentInputProps<T extends FieldValues> {
  name: Path<T>;
  type?: InputType | 'select-or-create';
  label?: string;
  placeholder?: string;
  required?: boolean;
  // Dependency configuration
  dependsOn?: Path<T>[];
  compute?: (values: Record<Path<T>, any>) => ComputedProps | Promise<ComputedProps>;
  // Additional props for specific types
  options?: { value: string; label: string }[];       // for static select
  createTitle?: string;                               // for select-or-create
  renderCreateForm?: (onSuccess: (val: string, item: any) => void, onCancel: () => void) => React.ReactNode;
  // Other input props
  rows?: number;
  accept?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function DependentInput<T extends FieldValues>({
  name,
  type = 'text',
  label,
  placeholder,
  required = false,
  dependsOn = [],
  compute,
  options: staticOptions = [],
  createTitle = 'إضافة جديد',
  renderCreateForm,
  rows,
  accept,
  min,
  max,
  step,
}: DependentInputProps<T>) {
  const { setValue, getValues, control } = useFormContext<T>();
  
  // Use useFormState to subscribe only to this field's errors
  // This prevents the component from rerendering when other fields have errors
  const { errors } = useFormState({ control, name });
  const error = errors[name]?.message as string | undefined;

  // We use watch(name) here to get the current value and trigger rerenders only when THIS field changes
  const { watch } = useFormContext<T>();
  const currentValue = watch(name);

  // If dependencies are provided, compute dynamic props
  const hasDependencies = dependsOn.length > 0 && compute;
  
  // hookResult is called inside the component, but we need to be careful with its internal effects
  const { computed: dynamicProps, loading } = useDependentField(
    name,
    dependsOn,
    compute || (() => ({}))
  );

  // Merge static and dynamic props (dynamic take precedence)
  // Use useMemo to prevent unnecessary object creation on every render
  const finalProps = useMemo(() => ({
    disabled: dynamicProps.disabled,
    hidden: dynamicProps.hidden,
    placeholder: dynamicProps.placeholder ?? placeholder,
    required: dynamicProps.required ?? required,
    value: dynamicProps.value !== undefined ? dynamicProps.value : currentValue,
    options: dynamicProps.options ?? staticOptions,
  }), [dynamicProps, placeholder, required, currentValue, staticOptions]);

  if (finalProps.hidden) return null;

  if (loading && !finalProps.value && hasDependencies) {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-text">{label}</label>}
        <div className="h-10 w-full bg-primary-light/5 animate-pulse rounded-lg border border-border flex items-center px-4">
          <span className="text-xs text-text-muted">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  const handleChange = (val: any) => {
    setValue(name, val, { shouldValidate: true, shouldDirty: true });
  };

  const commonProps = {
    name,
    label,
    placeholder: finalProps.placeholder,
    required: finalProps.required,
    disabled: finalProps.disabled,
    error,
  };

  // Render based on type
  switch (type) {
    case 'select-or-create':
      return (
        <SelectOrCreate
          value={finalProps.value}
          onChange={handleChange}
          options={finalProps.options}
          label={label}
          placeholder={finalProps.placeholder}
          required={finalProps.required}
          disabled={finalProps.disabled}
          error={error}
          createTitle={createTitle}
          renderCreateForm={renderCreateForm || ((onSuccess, onCancel) => (
            <div className="p-4 text-danger text-sm">يجب توفير renderCreateForm</div>
          ))}
        />
      );

    case 'textarea':
      return (
        <Input
          type="textarea"
          rows={rows}
          {...commonProps}
          value={finalProps.value}
          onChange={handleChange}
        />
      );

    case 'select':
      return (
        <Input
          type="select"
          options={finalProps.options}
          {...commonProps}
          value={finalProps.value}
          onChange={handleChange}
        />
      );

    case 'file':
    case 'image':
      return (
        <Input
          type={type}
          accept={accept}
          {...commonProps}
          value={finalProps.value}
          onChange={handleChange}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          min={min}
          max={max}
          step={step}
          {...commonProps}
          value={finalProps.value}
          onChange={handleChange}
        />
      );

    default:
      return (
        <Input
          type={type as InputType}
          {...commonProps}
          value={finalProps.value}
          onChange={handleChange}
        />
      );
  }
}