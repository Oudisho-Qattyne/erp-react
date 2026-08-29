// src/core/presentation/layouts/ui/inputs/FormInput.tsx
import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
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
import type { ToggleVariant, ToggleSize } from './Toggle';
import type { MatrixFieldConfig } from './DataMatrixInput';
import type { PickerComponent } from '../picker/pickerTypes';
import { useDependentField, type ComputedProps } from './hooks/useDependentField';
import { AuthContext } from '../../../../infrastructure/auth/AuthProvider';


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
  options?: { value: number | string | any; label: string; is_default?: boolean }[]
  searchable?: boolean;
  // For textarea
  rows?: number;
  // For number
  min?: number;
  max?: number;
  step?: number;
  // For decimal
  decimalPlaces?: number;
  allowNegative?: boolean;
  // For text-like inputs: only characters matching this regex can be typed/pasted
  // e.g. no whitespace: /\S/ — letters only: /^\p{L}$/u
  regex?: RegExp;
  // For select-or-create
  createTitle?: string;
  labelPath?: string;
  renderCreateForm?: (
    onSuccess: (value: number | string, item?: unknown) => void,
    onCancel: () => void,
    dependentData?: Record<string, unknown>
  ) => React.ReactNode;
  // For data-matrix
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
  /** Called with the full selected rows when a table-picker selection changes */
  onSelectionChange?: (items: any[]) => void;
  /** Called whenever the resolved options change (static or computed) */
  onResolvedOptions?: (options: { value: any; label: string }[]) => void;
  // Dependency
  dependsOn?: Path<T>[];
  compute?: (values: Record<Path<T>, any>) => ComputedProps | Promise<ComputedProps>;
  infoButton?: () => void;
  requiredPermission?: string | string[];
  createButtonPermission?: string | string[];
  // toggle
  toggleVariant?: ToggleVariant;
  toggleSize?: ToggleSize;
  toggleLabel?: string;
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
  decimalPlaces,
  allowNegative,
  regex,
  createTitle = 'إضافة جديد',
  labelPath,
  renderCreateForm,
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
  onResolvedOptions,
  dependsOn = [],
  compute,
  infoButton,
  requiredPermission,
  createButtonPermission,
  toggleVariant,
  toggleSize,
  toggleLabel,
}: FormInputProps<T>) {
  const { t, direction } = useLanguage();
  const auth = useContext(AuthContext);
  const { setValue, watch, getValues, control, clearErrors } = useFormContext<T>();
  const { errors } = useFormState({ control, name });

  const getFieldError = (obj: any, path: string): string | undefined => {
    const parts = path.split(/\.(?=\w+)/)
    let curr = obj
    for (const part of parts) {
      if (curr == null || typeof curr !== "object") return undefined
      curr = curr[part]
    }
    return curr?.message as string | undefined
  }

  const error = getFieldError(errors, name);
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
  const finalMatrixFields = computed.matrixFields ?? matrixFields;
  const finalNumberOfRows = computed.numberOfRows ?? numberOfRows;
  // compute can decide which picker component appears (or null to disable it)
  const finalPicker = computed.picker !== undefined ? computed.picker : picker;
  const finalPickerProps = computed.pickerProps ?? pickerProps;
  // compute can change the allowed characters
  const finalRegex = computed.regex !== undefined ? computed.regex : regex;

  // Report resolved options (static or computed) so the parent can capture value→label maps
  useEffect(() => {
    onResolvedOptions?.(finalOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalOptions, onResolvedOptions]);

  // Map nested array errors from react-hook-form (set by server validationErrors)
  const combinedMatrixErrors = useMemo(() => {
    if (type !== 'data-matrix') return matrixErrors;
    const merged: Record<number, Record<string, string>> = {};
    const rawMatrixErrors = matrixErrors;
    if (rawMatrixErrors) {
      Object.entries(rawMatrixErrors).forEach(([rowIdx, fields]) => {
        merged[Number(rowIdx)] = { ...fields };
      });
    }
    const arrayErrors = (errors as any)?.[name];
    if (Array.isArray(arrayErrors)) {
      const fieldNames = finalMatrixFields?.map(f => f.name) || [];
      arrayErrors.forEach((rowErr: any, rowIndex: number) => {
        if (!rowErr || typeof rowErr !== 'object') return;
        if (!merged[rowIndex]) merged[rowIndex] = {};
        Object.entries(rowErr).forEach(([fieldName, errVal]: [string, any]) => {
          const msg = typeof errVal === 'object' && errVal?.message ? String(errVal.message) : String(errVal);
          if (fieldNames.includes(fieldName)) {
            merged[rowIndex][fieldName] = msg;
          } else if (fieldNames.length > 0) {
            if (!merged[rowIndex][fieldNames[0]]) {
              merged[rowIndex][fieldNames[0]] = msg;
            }
          }
        });
      });
    }
    return merged;
  }, [errors, name, type, matrixErrors, finalMatrixFields]);

  const hasAccess = useMemo(() => {
    if (!requiredPermission) return true;
    return auth?.hasPermission(requiredPermission) ?? false;
  }, [requiredPermission, auth]);

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
    if (type === 'data-matrix') clearErrors(name);
  };

  const baseClasses = `${inputBaseClasses} ${error ? 'border-danger ring-danger/10 animate-shake' : ''}`;

  // Checkbox renders inline label
  if (type === 'checkbox' || type === 'toggle') {
    return (
      <div className={`w-full mb-4 ${className || ''}`}>
        <label htmlFor={name} className="flex items-center gap-3 cursor-pointer">
          <Input
            infoButton={infoButton}
            type={type}
            value={finalValue}
            onChange={handleChange}
            disabled={finalDisabled}
            toggleVariant={toggleVariant}
            toggleSize={toggleSize}
            toggleLabel={toggleLabel}
          />
          {label && (
            <span className="text-sm font-semibold text-text">
              {label} {finalRequired && <span className="text-danger">*</span>}
            </span>
          )}
        </label>
        {error && <div className={errorClasses}>{t(`${error}`, 'shared') || error}</div>}
        {hint && !error && <div className={hintClasses}>{hint}</div>}
      </div>
    );
  }


  // Helper to collect dependent values for the create form
  const getDependentData = () => {
    if (!dependsOn.length) return undefined;
    const values = getValues();
    const deepGet = (obj: any, path: string) => {
      return path.split('.').reduce((current, key) => {
        if (current == null) return undefined;
        const arrMatch = key.match(/^(\w+)\[(\d+)\]$/);
        if (arrMatch) {
          return current[arrMatch[1]]?.[Number(arrMatch[2])];
        }
        return current[key];
      }, obj);
    };

    return dependsOn.reduce((acc, field) => {
      acc[field] = deepGet(values, field);
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
            infoButton={infoButton}

        type={type}
        value={finalValue}
        onChange={handleChange}
        options={finalOptions}
        placeholder={finalPlaceholder}
        disabled={finalDisabled || !hasAccess}
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
        decimalPlaces={decimalPlaces}
        allowNegative={allowNegative}
        regex={finalRegex}
        matrixFields={finalMatrixFields}
        numberOfRows={finalNumberOfRows}
        minRows={minRows}
        maxRows={maxRows}
        matrixErrors={combinedMatrixErrors}
        rowSchema={rowSchema}
        picker={finalPicker}
        pickerProps={finalPickerProps}
        valueKey={valueKey}
        labelKey={labelKey}
        displayLabel={displayLabel}
        onSelectionChange={onSelectionChange}
        baseClasses={baseClasses}
        requiredPermission={requiredPermission}
        createButtonPermission={createButtonPermission}
      />
      {error && <div className={errorClasses}>{error}</div>}
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