// src/core/presentation/layouts/ui/inputs/FormInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useFormContext, useFormState, type FieldValues, type Path } from 'react-hook-form';
import { Plus, CalendarIcon } from 'lucide-react';
import { CustomSelect } from './CustomSelect';
import { CustomCalendar } from '../calendar/Calendar';
import { Button } from '../buttons/Button';
import { Dialog } from '../dialog/Dialog';
import { useLanguage } from '../../../context/i18n/I18nProvider';
import { useDependentField, type ComputedProps } from '../../../hooks/useDependentField';
import { inputBaseClasses, labelClasses, errorClasses, hintClasses } from './styles';

type InputType = 'text' | 'number' | 'email' | 'password' | 'textarea' | 'date' | 'select' | 'select-or-create';

export interface FormInputProps<T extends FieldValues> {
  name: Path<T>;
  type?: InputType;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  hint?: string;
  className?: string;
  // For select & select-or-create
  options?: { value: string; label: string }[];
  searchable?: boolean;
  // For textarea
  rows?: number;
  // For number
  min?: number;
  max?: number;
  step?: number;
  // For select-or-create
  createTitle?: string;
  renderCreateForm?: (
    onSuccess: (value: string, item?: unknown) => void,
    onCancel: () => void,
    dependentData?: Record<string, unknown>
  ) => React.ReactNode;
  // Dependency
  dependsOn?: Path<T>[];
  compute?: (values: Record<Path<T>, any>) => ComputedProps | Promise<ComputedProps>;
}

export function FormInput<T extends FieldValues>({
  name,
  type = 'text',
  label,
  placeholder,
  required = false,
  disabled = false,
  hidden = false,
  hint,
  className,
  options = [],
  searchable = false,
  rows = 3,
  min,
  max,
  step,
  createTitle = 'إضافة جديد',
  renderCreateForm,
  dependsOn = [],
  compute,
}: FormInputProps<T>) {
  const { t, direction } = useLanguage();
  const { setValue, watch, getValues, control } = useFormContext<T>();
  const { errors } = useFormState({ control, name });
  const error = errors[name]?.message as string | undefined;
  const currentValue = watch(name);

  // Handle dynamic props from dependencies
  const hasDeps = dependsOn.length > 0 && !!compute;
  const { computed, loading } = useDependentField(name, dependsOn, compute ?? (() => ({})));

  const finalDisabled = computed.disabled ?? disabled;
  const finalHidden = computed.hidden ?? hidden;
  const finalPlaceholder = computed.placeholder ?? placeholder;
  const finalRequired = computed.required ?? required;
  const finalOptions = computed.options ?? options;
  const finalValue = computed.value !== undefined ? computed.value : currentValue;

  if (finalHidden) return null;
  if (loading && hasDeps && !finalValue) {
    return (
      <div className={`w-full mb-4 ${className || ''}`}>
        {label && <label className={labelClasses}>{label}</label>}
        <div className="h-10 w-full bg-primary-light/5 animate-pulse rounded-lg border border-border" />
      </div>
    );
  }

  const handleChange = (val: any) => {
    setValue(name, val, { shouldValidate: true, shouldDirty: true });
  };

  const baseClasses = `${inputBaseClasses} ${error ? 'border-danger ring-danger/10 animate-shake' : ''}`;

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            value={finalValue ?? ''}
            onChange={(e) => handleChange(e.target.value)}
            rows={rows}
            placeholder={finalPlaceholder}
            disabled={finalDisabled}
            className={`${baseClasses} resize-y`}
          />
        );
      case 'select':
        return (
          <CustomSelect
            options={finalOptions}
            value={finalValue}
            onChange={handleChange}
            placeholder={finalPlaceholder}
            disabled={finalDisabled}
            required={finalRequired}
            baseClasses={baseClasses}
            searchable={searchable}
          />
        );
      case 'select-or-create':
        return (
          <SelectOrCreateField
            value={finalValue}
            onChange={handleChange}
            options={finalOptions}
            placeholder={finalPlaceholder}
            disabled={finalDisabled}
            required={finalRequired}
            searchable={searchable}
            createTitle={createTitle}
            renderCreateForm={renderCreateForm}
            dependentData={getDependentData()}
            baseClasses={baseClasses}
          />
        );
      case 'date':
        return (
          <DatePicker
            value={finalValue}
            onChange={handleChange}
            placeholder={finalPlaceholder}
            disabled={finalDisabled}
            required={finalRequired}
            baseClasses={baseClasses}
            direction={direction}
          />
        );
      default:
        return (
          <input
            type={type === 'number' ? 'number' : type}
            value={finalValue ?? ''}
            onChange={(e) => handleChange(type === 'number' ? Number(e.target.value) : e.target.value)}
            placeholder={finalPlaceholder}
            disabled={finalDisabled}
            min={min}
            max={max}
            step={step}
            className={baseClasses}
          />
        );
    }
  };

  // Helper to collect dependent values for the create form
  const getDependentData = () => {
    if (!dependsOn.length) return undefined;
    const values = getValues();
    return dependsOn.reduce((acc, field) => {
      acc[field] = values[field];
      return acc;
    }, {} as Record<string, unknown>);
  };

  return (
    <div className={`w-full mb-4 ${className || ''}`}>
      {label && (
        <label htmlFor={name} className={labelClasses}>
          {label} {finalRequired && <span className="text-danger">*</span>}
        </label>
      )}
      {renderInput()}
      {error && <div className={errorClasses}>{t(`validation.${error}`, 'shared') || error}</div>}
      {hint && !error && <div className={hintClasses}>{hint}</div>}
    </div>
  );
}

// -----------------------------------------------------------------------------
// DatePicker – uses CustomCalendar
// -----------------------------------------------------------------------------
function DatePicker({
  value,
  onChange,
  placeholder,
  disabled,
  required,
  baseClasses,
  direction,
}: any) {
  const [showCalendar, setShowCalendar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: Event) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('focusin', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('focusin', close);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative group/date">
        <input
          readOnly
          value={value ?? ''}
          onClick={() => !disabled && setShowCalendar(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${baseClasses} cursor-pointer bg-card/50`}
        />
        <CalendarIcon
          size={16}
          className={`absolute ${direction === 'rtl' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-text-muted pointer-events-none`}
        />
      </div>
      {showCalendar && (
        <div className={`absolute z-50 mt-1 ${direction === 'rtl' ? 'right-0' : 'left-0'}`}>
          <CustomCalendar
            value={value}
            onChange={(date) => {
              onChange(date);
              setShowCalendar(false);
            }}
            onClose={() => setShowCalendar(false)}
          />
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// SelectOrCreateField – uses CustomSelect + Dialog + creation form
// -----------------------------------------------------------------------------
interface SelectOrCreateFieldProps {
  value?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  createTitle: string;
  renderCreateForm?: (
    onSuccess: (newValue: string, newItem: unknown) => void,
    onCancel: () => void,
    dependentData?: Record<string, unknown>
  ) => React.ReactNode;
  dependentData?: Record<string, unknown>;
  baseClasses: string;
}

function SelectOrCreateField({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  required,
  searchable,
  createTitle,
  renderCreateForm,
  dependentData,
  baseClasses,
}: SelectOrCreateFieldProps) {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateSuccess = (newValue: string, newItem: unknown) => {
    onChange(newValue);
    setIsDialogOpen(false);
  };

  const newLabel = t('common.new', 'shared') !== 'common.new' ? t('common.new', 'shared') : 'جديد';

  return (
    <>
      <div className="flex gap-2">
        <CustomSelect
          options={options}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          searchable={searchable}
          baseClasses={`${baseClasses} flex-1`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => setIsDialogOpen(true)}
          disabled={disabled}
          className="shrink-0 h-9.5"
        >
          {disabled ? '' : newLabel}
        </Button>
      </div>
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={createTitle}
        size="md"
      >
        {renderCreateForm?.(
          handleCreateSuccess,
          () => setIsDialogOpen(false),
          dependentData
        ) ?? (
          <div className="p-4 text-danger text-sm">يجب توفير renderCreateForm</div>
        )}
      </Dialog>
    </>
  );
}