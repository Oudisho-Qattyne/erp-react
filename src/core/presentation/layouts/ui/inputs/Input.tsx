import React from 'react';
import { CustomSelect } from './CustomSelect';
import { SelectOrCreate } from './SelectOrCreate';
import { DatePicker } from './DatePicker';
import { DataMatrixInput, type MatrixFieldConfig } from './DataMatrixInput';
export type InputType = 'text' | 'number' | 'email' | 'password' | 'textarea' | 'date' | 'select' | 'select-or-create' | 'data-matrix';

interface InputProps {
  type:InputType;
  value?: any;
  onChange: (value: any) => void;
  options?: { value: number | string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  rows?: number;
  createTitle?: string;
  labelPath?:string
  renderCreateForm?: (
    onSuccess: (newValue: any, newItem: any) => void,
    onCancel: () => void,
    dependentData?: any
  ) => React.ReactNode;
  dependentData?: any;
  min?: number;
  max?: number;
  step?: number;
  baseClasses?: string;
  className?:string;
  // data-matrix
  matrixFields?: MatrixFieldConfig[];
  numberOfRows?: number;
  minRows?: number;
  maxRows?: number;
  matrixErrors?: Record<number, Record<string, string>>;
  rowSchema?: { safeParse: (data: any) => { success: boolean; error?: { flatten: () => { fieldErrors: Record<string, string[]> } } } };
}

const Input: React.FC<InputProps> = ({
  type,
  value,
  onChange,
  options = [],
  placeholder,
  disabled,
  required,
  searchable,
  rows = 3,
  createTitle,
  labelPath,
  renderCreateForm,
  dependentData,
  min,
  max,
  step,
  baseClasses = '',
  className="",
  matrixFields,
  numberOfRows,
  minRows,
  maxRows,
  matrixErrors,
  rowSchema,
}) => {
  const finalValue = value ?? '';
  const finalPlaceholder = placeholder ?? '';
  const finalDisabled = disabled ?? false;
  const finalRequired = required ?? false;
  const finalOptions = options;
  const localClass = `${baseClasses} ${className}`
  switch (type) {
    case 'textarea':
      return (
        <textarea
          value={finalValue}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={finalPlaceholder}
          disabled={finalDisabled}
          className={`${localClass} resize-y`}
        />
      );

    case 'select':
      return (
        <CustomSelect
          options={finalOptions}
          value={value}
          onChange={onChange}
          placeholder={finalPlaceholder}
          disabled={finalDisabled}
          required={finalRequired}
          searchable={searchable}
          baseClasses={localClass}
        />
      );

    case 'select-or-create':
      return (
        <SelectOrCreate
          value={value}
          onChange={onChange}
          options={finalOptions}
          placeholder={finalPlaceholder}
          disabled={finalDisabled}
          required={finalRequired}
          searchable={searchable}
          createTitle={createTitle}
          renderCreateForm={renderCreateForm}
          dependentData={dependentData}
          baseClasses={localClass}
          labelPath={labelPath}
        />
      );

    case 'data-matrix':
      return (
        <DataMatrixInput
          value={value ?? []}
          onChange={onChange}
          matrixFields={matrixFields ?? []}
          numberOfRows={numberOfRows}
          minRows={minRows}
          maxRows={maxRows}
          disabled={finalDisabled}
          baseClasses={localClass}
          errors={matrixErrors}
          rowSchema={rowSchema}
        />
      );

    case 'date':
      return (
        <DatePicker
          value={value}
          onChange={onChange}
          placeholder={finalPlaceholder}
          disabled={finalDisabled}
          required={finalRequired}
          className={localClass}
        />
      );

    default:
      // text, number, or any other HTML input type
      return (
        <input
          type={type}
          value={finalValue}
          onChange={(e) =>
            onChange(type === 'number' ? Number(e.target.value) : e.target.value)
          }
          placeholder={finalPlaceholder}
          disabled={finalDisabled}
          min={min}
          max={max}
          step={step}
          className={localClass}
        />
      );
  }
};

export default Input;