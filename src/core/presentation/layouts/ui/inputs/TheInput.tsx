import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import { Calendar, Plus } from 'lucide-react';
import {
  useFormContext,
  useFormState,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { CustomCalendar } from '../calendar/Calendar';
import { CustomSelect } from './CustomSelect';
import { Button } from '../buttons/Button';
import { Dialog } from '../dialog/Dialog';
import { useLanguage } from '../../../context/i18n/I18nProvider';
import {
  useDependentField,
  type ComputedProps,
} from '../../../hooks/useDependentField';
import {
  inputBaseClasses,
  labelClasses,
  errorClasses,
  hintClasses,
} from './styles';

export type { ComputedProps };

export type TheInputType =
  | 'text'
  | 'number'
  | 'date'
  | 'textarea'
  | 'select'
  | 'file'
  | 'email'
  | 'password'
  | 'select-or-create'
  | string;

export interface SelectOption {
  value: string;
  label: string;
}

interface TheInputBaseProps {
  type?: TheInputType;
  name?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  rows?: number;
  options?: SelectOption[];
  accept?: string;
  min?: number;
  max?: number;
  step?: number;
  searchable?: boolean;
  createTitle?: string;
  renderCreateForm?: (
    onSuccess: (value: string, item?: unknown) => void,
    onCancel: () => void,
    dependentData?: Record<string, unknown>
  ) => ReactNode;
  loadingFallback?: ReactNode;
}

export interface TheInputControlledProps extends TheInputBaseProps {
  value?: unknown;
  onChange?: (value: unknown, item?: unknown) => void;
  onBlur?: () => void;
  dependsOn?: never;
  compute?: never;
  loadOptions?: never;
}

export interface TheInputFormProps<T extends FieldValues = FieldValues>
  extends TheInputBaseProps {
  name: Path<T>;
  dependsOn?: Path<T>[];
  compute?: (
    values: Record<Path<T>, unknown>
  ) => ComputedProps | Promise<ComputedProps>;
  loadOptions?: (
    formValues: Record<string, unknown>
  ) => Promise<SelectOption[]> | SelectOption[];
}

export type TheInputProps<T extends FieldValues = FieldValues> =
  | TheInputControlledProps
  | TheInputFormProps<T>;

function isFormProps<T extends FieldValues>(
  props: TheInputProps<T>
): props is TheInputFormProps<T> {
  const controlled = props as TheInputControlledProps;
  return (
    'name' in props &&
    props.name !== undefined &&
    controlled.onChange === undefined &&
    controlled.value === undefined
  );
}

const getBaseClasses = (hasError?: string) =>
  `${inputBaseClasses} focus:scale-[1.01] hover:border-primary/50 ${
    hasError
      ? 'border-danger focus:border-danger ring-danger/10 animate-shake'
      : ''
  }`;

// ─── Date ─────────────────────────────────────────────────────────────────────

function DateField({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  required,
  baseClasses,
  direction,
}: {
  name?: string;
  value?: unknown;
  onChange?: (value: unknown) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  baseClasses: string;
  direction: string;
}) {
  const [showCalendar, setShowCalendar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: Event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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

  const open = () => !disabled && setShowCalendar(true);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative group/date">
        <input
          id={name}
          name={name}
          readOnly
          value={(value as string) ?? ''}
          onMouseDown={open}
          onClick={open}
          onFocus={open}
          onKeyDown={(e) => {
            if (e.key === 'Tab' || e.key === 'Escape') setShowCalendar(false);
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${baseClasses} ${direction === 'rtl' ? 'pl-10' : 'pr-10'} cursor-pointer bg-card/50`}
        />
        <span
          className={`absolute ${direction === 'rtl' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-hover/date:text-primary transition-colors`}
        >
          <Calendar size={16} />
        </span>
      </div>
      {showCalendar && (
        <div
          className={`absolute z-100 mt-2 ${direction === 'rtl' ? 'right-0' : 'left-0'}`}
        >
          <CustomCalendar
            value={value as string}
            onChange={(date) => {
              onChange?.(date);
              setShowCalendar(false);
            }}
            onClose={() => {
              setShowCalendar(false);
              onBlur?.();
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Select or create ─────────────────────────────────────────────────────────

function SelectOrCreateField({
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  required,
  disabled,
  searchable,
  createTitle = 'إضافة جديد',
  renderCreateForm,
  dependentData,
  baseClasses,
}: {
  value?: string;
  onChange: (value: string, item?: unknown) => void;
  onBlur?: () => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  createTitle?: string;
  renderCreateForm?: TheInputBaseProps['renderCreateForm'];
  dependentData?: Record<string, unknown>;
  baseClasses: string;
}) {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const newLabel =
    t('common.new', 'shared') !== 'common.new' ? t('common.new', 'shared') : 'جديد';

  return (
    <>
      <div className="flex gap-2">
        <CustomSelect
          options={options}
          value={value}
          onChange={(val) => onChange(val, undefined)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          searchable={searchable}
          required={required}
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
          (newValue, newItem) => {
            onChange(newValue, newItem);
            setIsDialogOpen(false);
          },
          () => setIsDialogOpen(false),
          dependentData
        ) ?? (
          <div className="p-4 text-danger text-sm">يجب توفير renderCreateForm</div>
        )}
      </Dialog>
    </>
  );
}

// ─── Field control ────────────────────────────────────────────────────────────

interface FieldControlProps {
  type: TheInputType;
  name?: string;
  value?: unknown;
  onChange?: (value: unknown, item?: unknown) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  baseClasses: string;
  direction: string;
  rows?: number;
  options: SelectOption[];
  accept?: string;
  min?: number;
  max?: number;
  step?: number;
  searchable?: boolean;
  createTitle?: string;
  renderCreateForm?: TheInputBaseProps['renderCreateForm'];
  dependentData?: Record<string, unknown>;
}

function FieldControl(props: FieldControlProps) {
  const {
    type,
    name,
    value,
    onChange,
    onBlur,
    placeholder,
    disabled,
    required,
    baseClasses,
    direction,
    rows = 3,
    options,
    accept,
    min,
    max,
    step,
    searchable,
    createTitle,
    renderCreateForm,
    dependentData,
  } = props;

  switch (type) {
    case 'textarea':
      return (
        <textarea
          id={name}
          name={name}
          rows={rows}
          value={(value as string) ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${baseClasses} resize-y`}
        />
      );

    case 'select':
      return (
        <CustomSelect
          options={options}
          value={value as string}
          onChange={(val) => onChange?.(val)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          baseClasses={baseClasses}
          searchable={searchable}
        />
      );

    case 'select-or-create':
      return (
        <SelectOrCreateField
          value={value as string}
          onChange={(val, item) => onChange?.(val, item)}
          onBlur={onBlur}
          options={options}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          searchable={searchable}
          createTitle={createTitle}
          renderCreateForm={renderCreateForm}
          dependentData={dependentData}
          baseClasses={baseClasses}
        />
      );

    case 'file':
      return (
        <input
          id={name}
          name={name}
          type="file"
          accept={accept}
          onChange={(e) => onChange?.(e.target.files?.[0] ?? null)}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={`${baseClasses} p-1 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-primary-light file:text-primary file:cursor-pointer hover:file:bg-primary/20`}
        />
      );

    case 'date':
      return (
        <DateField
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          baseClasses={baseClasses}
          direction={direction}
        />
      );

    default:
      return (
        <input
          id={name}
          name={name}
          type={type === 'number' ? 'number' : type}
          value={value == null ? '' : String(value)}
          onChange={(e) => {
            if (type === 'number') {
              onChange?.(
                e.target.value === '' ? undefined : Number(e.target.value)
              );
            } else {
              onChange?.(e.target.value);
            }
          }}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          step={step}
          className={baseClasses}
        />
      );
  }
}

// ─── Shell ────────────────────────────────────────────────────────────────────

function InputShell({
  name,
  label,
  required,
  error,
  hint,
  className,
  children,
}: {
  name?: string;
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  const { t } = useLanguage();
  const translatedError = error
    ? t(`validation.${error}`, 'shared')
    : undefined;
  const finalError =
    translatedError && translatedError !== `validation.${error}`
      ? translatedError
      : error;

  return (
    <div className={`w-full mb-4 ${className ?? ''}`}>
      {label && (
        <label htmlFor={name} className={labelClasses}>
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      {children}
      {finalError && <div className={errorClasses}>{finalError}</div>}
      {hint && !finalError && <div className={hintClasses}>{hint}</div>}
    </div>
  );
}

// ─── Form-integrated ──────────────────────────────────────────────────────────

function FormIntegratedTheInput<T extends FieldValues>(
  props: TheInputFormProps<T>
) {
  const {
    name,
    type = 'text',
    label,
    placeholder,
    required = false,
    hint,
    className,
    dependsOn = [],
    compute,
    loadOptions,
    rows,
    options: staticOptions = [],
    accept,
    min,
    max,
    step,
    searchable,
    createTitle,
    renderCreateForm,
    loadingFallback,
  } = props;

  const { setValue, watch, getValues, control } = useFormContext<T>();
  const { errors } = useFormState({ control, name });
  const error = errors[name]?.message as string | undefined;
  const currentValue = watch(name);
  const { t, direction } = useLanguage();

  const hasDependencies = dependsOn.length > 0 && !!compute;
  const { computed: dynamicProps, loading: depLoading } = useDependentField(
    name,
    dependsOn,
    compute ?? (() => ({}))
  );

  const [loadOptionsResult, setLoadOptionsResult] = useState<SelectOption[]>([]);
  const [loadOptionsLoading, setLoadOptionsLoading] = useState(false);
  const dependentValues = watch(dependsOn);
  const dependentValuesKey = JSON.stringify(dependentValues);

  useEffect(() => {
    if (!loadOptions) return;
    let cancelled = false;
    const run = async () => {
      setLoadOptionsLoading(true);
      try {
        const result = await loadOptions(
          getValues() as Record<string, unknown>
        );
        if (!cancelled) setLoadOptionsResult(result);
      } finally {
        if (!cancelled) setLoadOptionsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [dependentValuesKey, loadOptions, getValues]);

  const finalProps = useMemo(
    () => ({
      disabled: dynamicProps.disabled,
      hidden: dynamicProps.hidden,
      placeholder: dynamicProps.placeholder ?? placeholder,
      required: dynamicProps.required ?? required,
      value:
        dynamicProps.value !== undefined ? dynamicProps.value : currentValue,
      options: loadOptions
        ? loadOptionsResult
        : (dynamicProps.options ?? staticOptions),
    }),
    [
      dynamicProps,
      placeholder,
      required,
      currentValue,
      staticOptions,
      loadOptions,
      loadOptionsResult,
    ]
  );

  const loading = depLoading || loadOptionsLoading;
  const dependentData = useMemo(
    () =>
      dependsOn.reduce(
        (acc, field) => {
          acc[field as string] = getValues(field);
          return acc;
        },
        {} as Record<string, unknown>
      ),
    [dependsOn, dependentValuesKey, getValues]
  );

  const handleChange = useCallback(
    (val: unknown) => {
      setValue(name, val as never, { shouldValidate: true, shouldDirty: true });
    },
    [name, setValue]
  );

  if (finalProps.hidden) return null;

  if (loading && !finalProps.value && (hasDependencies || loadOptions)) {
    return (
      loadingFallback ?? (
        <div className={`w-full mb-4 ${className ?? ''}`}>
          {label && <label className={labelClasses}>{label}</label>}
          <div className="h-10 w-full bg-primary-light/5 animate-pulse rounded-lg border border-border flex items-center px-4">
            <span className="text-xs text-text-muted">
              {t('common.loading', 'shared') !== 'common.loading'
                ? t('common.loading', 'shared')
                : 'جاري التحميل...'}
            </span>
          </div>
        </div>
      )
    );
  }

  const baseClasses = getBaseClasses(error);
  const fieldName = name as string;

  return (
    <InputShell
      name={fieldName}
      label={label}
      required={finalProps.required}
      error={error}
      hint={hint}
      className={className}
    >
      <FieldControl
        type={type}
        name={fieldName}
        value={finalProps.value}
        onChange={handleChange}
        placeholder={finalProps.placeholder}
        disabled={finalProps.disabled || loading}
        required={finalProps.required}
        baseClasses={baseClasses}
        direction={direction}
        rows={rows}
        options={finalProps.options}
        accept={accept}
        min={min}
        max={max}
        step={step}
        searchable={searchable}
        createTitle={createTitle}
        renderCreateForm={renderCreateForm}
        dependentData={dependentData}
      />
    </InputShell>
  );
}

// ─── Controlled ───────────────────────────────────────────────────────────────

function ControlledTheInput(props: TheInputControlledProps) {
  const {
    type = 'text',
    name,
    value,
    onChange,
    onBlur,
    label,
    placeholder,
    disabled,
    required,
    error,
    hint,
    className,
    rows,
    options = [],
    accept,
    min,
    max,
    step,
    searchable,
    createTitle,
    renderCreateForm,
  } = props;

  const { direction } = useLanguage();
  const baseClasses = getBaseClasses(error);

  return (
    <InputShell
      name={name}
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={className}
    >
      <FieldControl
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        baseClasses={baseClasses}
        direction={direction}
        rows={rows}
        options={options}
        accept={accept}
        min={min}
        max={max}
        step={step}
        searchable={searchable}
        createTitle={createTitle}
        renderCreateForm={renderCreateForm}
      />
    </InputShell>
  );
}

export function TheInput<T extends FieldValues = FieldValues>(
  props: TheInputProps<T>
) {
  if (isFormProps(props)) {
    return <FormIntegratedTheInput {...props} />;
  }
  return <ControlledTheInput {...props} />;
}

export type InputType = TheInputType;
export const Input = TheInput;
export const DependentInput = TheInput;
