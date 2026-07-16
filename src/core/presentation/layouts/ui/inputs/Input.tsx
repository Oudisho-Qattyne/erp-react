import React, { useContext, useMemo } from 'react';
import { CustomSelect } from './CustomSelect';
import { SelectOrCreate } from './SelectOrCreate';
import { MultiSelectOrCreate } from './MultiSelectOrCreate';
import { DatePicker } from './DatePicker';
import { TimePicker } from './TimePicker';
import { DateTimePicker } from './DateTimePicker';
import { DataMatrixInput, type MatrixFieldConfig } from './DataMatrixInput';
import { Info } from 'lucide-react';
import { AuthContext } from '../../../../infrastructure/auth/AuthProvider';
export type InputType = 'text' | 'number' | 'numeric' | 'alpha' | 'email' | 'password' | 'textarea' | 'date' | 'time' | 'datetime' | 'select' | 'select-or-create' | 'multi-select-or-create' | 'data-matrix' | 'checkbox';

interface InputProps {
  type: InputType;
  value?: any;
  onChange: (value: any) => void;
  options?: { value: number | string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  rows?: number;
  createTitle?: string;
  labelPath?: string
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
  className?: string;
  // data-matrix
  matrixFields?: MatrixFieldConfig[];
  numberOfRows?: number;
  minRows?: number;
  maxRows?: number;
  matrixErrors?: Record<number, Record<string, string>>;
  rowSchema?: { safeParse: (data: any) => { success: boolean; error?: { flatten: () => { fieldErrors: Record<string, string[]> } } } };
  infoButton?: () => void | null;
  requiredPermission?: string | string[];
  createButtonPermission?: string | string[];
}

const InputTypes: React.FC<InputProps> = ({
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
  className = "",
  matrixFields,
  numberOfRows,
  minRows,
  maxRows,
  matrixErrors,
  rowSchema,
  createButtonPermission,
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
          createButtonPermission={createButtonPermission}
        />
      )
    case 'multi-select-or-create':
      return (
        <MultiSelectOrCreate
          value={value ?? []}
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
          createButtonPermission={createButtonPermission}
        />
      );

    case 'multi-select-or-create':
      return (
        <MultiSelectOrCreate
          value={value ?? []}
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

    case 'checkbox':
      return (
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          disabled={finalDisabled}
          required={finalRequired}
          className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
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

    case 'time':
      return (
        <TimePicker
          value={value}
          onChange={onChange}
          placeholder={finalPlaceholder}
          disabled={finalDisabled}
          required={finalRequired}
          className={localClass}
        />
      );

    case 'datetime':
      return (
        <DateTimePicker
          value={value}
          onChange={onChange}
          placeholder={finalPlaceholder}
          disabled={finalDisabled}
          required={finalRequired}
          className={localClass}
        />
      );

    case 'alpha':
      return (
        <input
          type="text"
          value={finalValue}
          onChange={(e) => onChange(e.target.value.replace(/[^\p{L}\s]/gu, ''))}
          onKeyDown={(e) => {
            const allowed = [
              'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
              'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
              'Home', 'End',
            ];
            if (allowed.includes(e.key)) return;
            if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
            if (/^\p{L}$/u.test(e.key) || e.key === ' ') return;
            e.preventDefault();
          }}
          placeholder={finalPlaceholder}
          disabled={finalDisabled}
          className={localClass}
        />
      );

    case 'numeric':
      return (
        <input
          type="text"
          inputMode="numeric"
          value={finalValue}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => {
            const allowed = [
              'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
              'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
              'Home', 'End',
            ];
            if (allowed.includes(e.key)) return;
            if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
            if (/^\d$/.test(e.key)) return;
            e.preventDefault();
          }}
          placeholder={finalPlaceholder}
          disabled={finalDisabled}
          className={localClass}
        />
      );

    default:
      // text, number, or any other HTML input type
      return (
        <input
          type={type}
          value={type === 'number' ? finalValue : finalValue}
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


const Input: React.FC<InputProps> = (props) => {
  const auth = useContext(AuthContext);
  const hasAccess = useMemo(() => {
    if (!props.requiredPermission) return true;
    return auth?.hasPermission(props.requiredPermission) ?? false;
  }, [props.requiredPermission, auth]);

  return <div className='relative flex gap-3 justify-center items-center'>
    <InputTypes {...props} disabled={props.disabled || !hasAccess} />
    {
      props.infoButton &&
      <Info className='text-primary hover:text-primary-dark cursor-pointer' onClick={() => props.infoButton ? props.infoButton() : undefined} />
    }
  </div>
}
export default Input;