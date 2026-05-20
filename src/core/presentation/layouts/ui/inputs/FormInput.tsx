// src/core/presentation/layouts/ui/inputs/FormInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useFormContext, useFormState, type FieldValues, type Path } from 'react-hook-form';
import { Plus, CalendarIcon } from 'lucide-react';
import { CustomSelect } from './CustomSelect';
import { CustomCalendar } from '../calendar/Calendar';
import { Button } from '../buttons/Button';
import { Dialog } from '../dialog/Dialog';
import { useLanguage } from '../../../context/i18n/I18nProvider';
import { inputBaseClasses, labelClasses, errorClasses, hintClasses } from './styles';
import { DatePicker } from './DatePicker';
import { SelectOrCreate } from './SelectOrCreate';
import Input, { type InputType } from './Input';
import { useDependentField, type ComputedProps } from './hooks/useDependentField';


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
  options?: { value: number | string; label: string }[]
  searchable?: boolean;
  // For textarea
  rows?: number;
  // For number
  min?: number;
  max?: number;
  step?: number;
  // For select-or-create
  createTitle?: string;
  labelPath?:string;
  renderCreateForm?: (
    onSuccess: (value: number | string, item?: unknown) => void,
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
  labelPath,
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
      <Input
        type={type}
        value={finalValue}
        onChange={handleChange}
        options={finalOptions}
        placeholder={finalPlaceholder}
        disabled={finalDisabled}
        required={finalRequired}
        searchable={searchable}
        rows={rows}
        createTitle={createTitle}
        labelPath={labelPath}
        renderCreateForm={renderCreateForm}
        dependentData={getDependentData()}
        min={min}
        max={max}
        step={step}
        baseClasses={baseClasses}
      />
      {error && <div className={errorClasses}>{t(`validation.${error}`, 'shared') || error}</div>}
      {hint && !error && <div className={hintClasses}>{hint}</div>}
    </div>
  );
}

// -----------------------------------------------------------------------------
// DatePicker – uses CustomCalendar
// -----------------------------------------------------------------------------
// function DatePicker({
//   value,
//   onChange,
//   placeholder,
//   disabled,
//   required,
//   baseClasses,
//   direction,
// }: any) {
//   const [showCalendar, setShowCalendar] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const close = (e: Event) => {
//       if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
//         setShowCalendar(false);
//       }
//     };
//     document.addEventListener('mousedown', close);
//     document.addEventListener('focusin', close);
//     return () => {
//       document.removeEventListener('mousedown', close);
//       document.removeEventListener('focusin', close);
//     };
//   }, []);

//   return (
//     <div className="relative" ref={containerRef}>
//       <div className="relative group/date">
//         <input
//           readOnly
//           value={value ?? ''}
//           onClick={() => !disabled && setShowCalendar(true)}
//           placeholder={placeholder}
//           disabled={disabled}
//           required={required}
//           className={`${baseClasses} cursor-pointer bg-card/50`}
//         />
//         <CalendarIcon
//           size={16}
//           className={`absolute ${direction === 'rtl' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-text-muted pointer-events-none`}
//         />
//       </div>
//       {showCalendar && (
//         <div className={`absolute z-50 mt-1 ${direction === 'rtl' ? 'right-0' : 'left-0'}`}>
//           <CustomCalendar
//             value={value}
//             onChange={(date) => {
//               onChange(date);
//               setShowCalendar(false);
//             }}
//             onClose={() => setShowCalendar(false)}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// -----------------------------------------------------------------------------
// SelectOrCreateField – uses CustomSelect + Dialog + creation form
// -----------------------------------------------------------------------------


// Helper to safely get a nested property from an object using a dot‑separated path
// function getNestedValue(obj: any, path: string): string {
//   return path.split('.').reduce((current, key) => current?.[key], obj) ?? '';
// }

// interface SelectOrCreateFieldProps {
//   value: any;
//   onChange: (value: any) => void;
//   options: { value: number | string; label: string }[];
//   placeholder?: string;
//   disabled?: boolean;
//   required?: boolean;
//   searchable?: boolean;
//   createTitle?: string;
//   renderCreateForm?: (
//     onSuccess: (newValue: number | string, newItem: any) => void,
//     onCancel: () => void,
//     dependentData?: any
//   ) => React.ReactNode;
//   dependentData?: any;
//   baseClasses?: string;
//   /** Dot‑notation path to the label inside the newItem, e.g. "data.name.ar" */
//   labelPath?: string;
// }

// function SelectOrCreateField({
//   value,
//   onChange,
//   options,
//   placeholder,
//   disabled,
//   required,
//   searchable,
//   createTitle,
//   renderCreateForm,
//   dependentData,
//   baseClasses,
//   labelPath,
// }: SelectOrCreateFieldProps) {
//   const { t } = useLanguage();
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [localOptions, setLocalOptions] = useState<{
//     value: number | string;
//     label: string;
//   }[]>(options);

//   useEffect(() => {
//     setLocalOptions(options);
//   }, [options]);

//   const handleCreateSuccess = (newValue: number | string, newItem: any) => {
//     onChange(newValue);
//     let localValue = ""
//     if(labelPath){
//       localValue = getNestedValue(newItem, labelPath) as string;
//     }
//     localValue = newItem as string;
//     setLocalOptions(prev => [...prev, { value: newValue, label: localValue }]);
//     console.log(newValue, newItem);
//     setIsDialogOpen(false);
//   };

//   const newLabel = t('common.new', 'shared') !== 'common.new' ? t('common.new', 'shared') : 'جديد';

//   return (
//     <>
//       <div className="flex gap-2">
//         <CustomSelect
//           options={localOptions}
//           value={value}
//           onChange={onChange}
//           placeholder={placeholder}
//           disabled={disabled}
//           required={required}
//           searchable={searchable}
//           baseClasses={`${baseClasses} flex-1`}
//         />
//         <Button
//           type="button"
//           variant="outline"
//           size="sm"
//           leftIcon={<Plus size={14} />}
//           onClick={() => setIsDialogOpen(true)}
//           disabled={disabled}
//           className="shrink-0 h-9.5"
//         >
//           {disabled ? '' : newLabel}
//         </Button>
//       </div>
//       <Dialog
//         isOpen={isDialogOpen}
//         onClose={() => setIsDialogOpen(false)}
//         title={createTitle}
//         size="md"
//       >
//         {renderCreateForm?.(
//           (v, i) => {
//             handleCreateSuccess(v, i);
//           },
//           () => setIsDialogOpen(false),
//           dependentData
//         ) ?? (
//           <div className="p-4 text-danger text-sm">يجب توفير renderCreateForm</div>
//         )}
//       </Dialog>
//     </>
//   );
// }