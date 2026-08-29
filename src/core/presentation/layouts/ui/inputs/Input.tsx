import React, { useContext, useMemo, useState } from 'react';
import { CustomSelect } from './CustomSelect';
import { SelectOrCreate } from './SelectOrCreate';
import { MultiSelectOrCreate } from './MultiSelectOrCreate';
import { MultiSelect } from './MultiSelect';
import { DatePicker } from './DatePicker';
import { TimePicker } from './TimePicker';
import { DateTimePicker } from './DateTimePicker';
import { DataMatrixInput, type MatrixFieldConfig } from './DataMatrixInput';
import { TablePickerInput } from './TablePickerInput';
import type { PickerComponent } from '../picker/pickerTypes';
import { Toggle, type ToggleSize, type ToggleVariant } from './Toggle';
import { Info, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../../../../infrastructure/auth/AuthProvider';
export type InputType = 'text' | 'number' | 'numeric' | 'alpha' | 'alphanumeric' | 'decimal' | 'email' | 'password' | 'textarea' | 'date' | 'time' | 'datetime' | 'select' | 'select-or-create' | 'multi-select' | 'multi-select-or-create' | 'data-matrix' | 'table-picker' | 'checkbox' | 'toggle';

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
  // For decimal
  decimalPlaces?: number;
  allowNegative?: boolean;
  // For text-like inputs: only characters matching this regex can be typed/pasted
  // e.g. no whitespace: /\S/ — letters only: /^\p{L}$/u
  regex?: RegExp;
  baseClasses?: string;
  className?: string;
  // data-matrix
  matrixFields?: MatrixFieldConfig[];
  numberOfRows?: number;
  minRows?: number;
  maxRows?: number;
  matrixErrors?: Record<number, Record<string, string>>;
  rowSchema?: { safeParse: (data: any) => { success: boolean; error?: { flatten: () => { fieldErrors: Record<string, string[]> } } } };
  // For table-picker
  picker?: PickerComponent | null;
  pickerProps?: Record<string, any>;
  valueKey?: string;
  labelKey?: string;
  displayLabel?: string | ((value: any) => string);
  onSelectionChange?: (items: any[]) => void;
  infoButton?: () => void | null;
  requiredPermission?: string | string[];
  createButtonPermission?: string | string[];
  // toggle
  toggleVariant?: ToggleVariant;
  toggleSize?: ToggleSize;
  toggleLabel?: string;
}

function sanitizeDecimal(raw: string, decimalPlaces?: number, allowNegative?: boolean): string {
  let v = raw.replace(/[^\d.-]/g, '')
  const negative = !!allowNegative && v.startsWith('-')
  v = v.replace(/-/g, '')
  if (negative) v = '-' + v
  const dotIdx = v.indexOf('.')
  if (dotIdx !== -1) {
    v = v.slice(0, dotIdx + 1) + v.slice(dotIdx + 1).replace(/\./g, '')
  }
  if (decimalPlaces !== undefined && decimalPlaces >= 0) {
    const d = v.indexOf('.')
    if (d !== -1) {
      v = v.slice(0, d + 1 + decimalPlaces)
    }
  }
  return v
}

function sanitizeRegex(raw: string, regex: RegExp): string {
  return raw
    .split('')
    .filter((c) => {
      regex.lastIndex = 0;
      return regex.test(c);
    })
    .join('');
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
  decimalPlaces,
  allowNegative,
  regex,
  baseClasses = '',
  className = "",
  matrixFields,
  numberOfRows,
  minRows,
  maxRows,
  matrixErrors,
  rowSchema,
  picker,
  pickerProps,
  valueKey,
  labelKey,
  displayLabel,
  onSelectionChange,
  createButtonPermission,
  toggleVariant,
  toggleSize,
  toggleLabel,
}) => {
  const finalValue = value ?? '';
  const finalPlaceholder = placeholder ?? '';
  const finalDisabled = disabled ?? false;
  const finalRequired = required ?? false;
  const finalOptions = options;
  const localClass = `${baseClasses} ${className}`
  const [showPassword, setShowPassword] = useState(false);
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

    case 'multi-select':
      return (
        <MultiSelect
          value={value ?? []}
          onChange={onChange}
          options={finalOptions}
          placeholder={finalPlaceholder}
          disabled={finalDisabled}
          required={finalRequired}
          searchable={searchable}
          baseClasses={localClass}
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
          dependentData={dependentData}
        />
      );

    case 'table-picker':
      return (
        <TablePickerInput
          value={value}
          onChange={onChange}
          picker={picker}
          pickerProps={pickerProps}
          valueKey={valueKey}
          labelKey={labelKey}
          displayLabel={displayLabel}
          onSelectionChange={onSelectionChange}
          placeholder={finalPlaceholder}
          disabled={finalDisabled}
          baseClasses={localClass}
        />
      );

    case 'checkbox':
      return (
        <Toggle
          value={!!value}
          onChange={onChange}
          disabled={finalDisabled}
          variant={toggleVariant}
          size={toggleSize}
          label={toggleLabel}
        />
      );

    case 'toggle':
      return (
        <Toggle
          value={!!value}
          onChange={onChange}
          disabled={finalDisabled}
          variant={toggleVariant}
          size={toggleSize}
          label={toggleLabel}
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

    case 'alphanumeric':
      return (
        <input
          type="text"
          value={finalValue}
          onChange={(e) => onChange(e.target.value.replace(/\s/g, ''))}
          onKeyDown={(e) => {
            const allowed = [
              'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
              'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
              'Home', 'End',
            ];
            if (allowed.includes(e.key)) return;
            if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
            if (/^\p{L}$/u.test(e.key) || /^\d$/.test(e.key)) return;
            e.preventDefault();
          }}
          placeholder={finalPlaceholder}
          disabled={finalDisabled}
          className={localClass}
        />
      );

    case 'decimal':
      return (
        <input
          type="text"
          inputMode="decimal"
          value={finalValue}
          onChange={(e) => onChange(sanitizeDecimal(e.target.value, decimalPlaces, allowNegative))}
          onKeyDown={(e) => {
            const allowed = [
              'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
              'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
              'Home', 'End',
            ];
            if (allowed.includes(e.key)) return;
            if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
            if (/^\d$/.test(e.key)) return;
            if (e.key === '.') {
              const el = e.target as HTMLInputElement;
              if (el.value.includes('.')) e.preventDefault();
              return;
            }
            if (allowNegative && e.key === '-') {
              const el = e.target as HTMLInputElement;
              if (el.selectionStart !== 0 || el.value.includes('-')) e.preventDefault();
              return;
            }
            e.preventDefault();
          }}
          placeholder={finalPlaceholder}
          disabled={finalDisabled}
          className={localClass}
        />
      );

    default:
      // text, number, or any other HTML input type
      if (type === 'password') {
        return (
          <div className="relative w-full">
            <input
              type={showPassword ? 'text' : 'password'}
              value={finalValue}
              onChange={(e) => {
                const raw = e.target.value;
                const filtered = regex ? sanitizeRegex(raw, regex) : raw;
                onChange(filtered);
              }}
              onKeyDown={(e) => {
                if (!regex) return;
                const allowed = [
                  'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                  'Home', 'End',
                ];
                if (allowed.includes(e.key)) return;
                if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
                regex.lastIndex = 0;
                if (regex.test(e.key)) return;
                e.preventDefault();
              }}
              placeholder={finalPlaceholder}
              disabled={finalDisabled}
              className={`${localClass} pe-9`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 end-2 flex items-center text-text-muted hover:text-text transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        );
      }
      return (
        <input
          type={type}
          value={type === 'number' ? finalValue : finalValue}
          onChange={(e) => {
            const raw = e.target.value;
            const filtered = regex ? sanitizeRegex(raw, regex) : raw;
            onChange(type === 'number' ? Number(filtered) : filtered);
          }}
          onKeyDown={(e) => {
            if (!regex) return;
            const allowed = [
              'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
              'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
              'Home', 'End',
            ];
            if (allowed.includes(e.key)) return;
            if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
            regex.lastIndex = 0;
            if (regex.test(e.key)) return;
            e.preventDefault();
          }}
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