import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { CustomCalendar } from '../calendar/Calendar';
import { CustomSelect } from './CustomSelect';
import { useLanguage } from '../../i18n/I18nProvider';

export type InputType = 'text' | 'number' | 'date' | 'textarea' | 'select' | 'file' | 'email' | 'password' | string;

interface InputProps {
  type?: InputType;
  name?: string;
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
  label?: string;
  rows?: number;               // for textarea
  options?: { value: string; label: string }[]; // for select
  accept?: string;             // for file
  min?: number;                // for number
  max?: number;
  step?: number;
  searchable?: boolean;        // for select
}

const DateInput: React.FC<{
  name?: string;
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  baseClasses: string;
  direction: string;
}> = ({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  required,
  baseClasses,
  direction,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    const handleFocusOutside = (event: FocusEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('focusin', handleFocusOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('focusin', handleFocusOutside);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative group/date">
        <input
          id={name}
          name={name}
          readOnly
          value={value ?? ''}
          onMouseDown={() => !disabled && setShowCalendar(true)}
          onClick={() => !disabled && setShowCalendar(true)}
          onFocus={() => !disabled && setShowCalendar(true)}
          onKeyDown={(e) => {
            if (e.key === 'Tab' || e.key === 'Escape') {
              setShowCalendar(false);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${baseClasses} ${direction === 'rtl' ? 'pl-10' : 'pr-10'} cursor-pointer bg-card/50`}
        />
        <div 
          className={`absolute ${direction === 'rtl' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-text-muted pointer-events-none group-hover/date:text-primary transition-colors duration-300`}
        >
          <Calendar size={16} />
        </div>
      </div>
      
      {showCalendar && (
        <div className={`absolute z-100 mt-2 ${direction === 'rtl' ? 'right-0' : 'left-0'}`}>
          <CustomCalendar
            value={value}
            onChange={(date) => {
              onChange?.(date);
              setShowCalendar(false);
            }}
            onClose={() => setShowCalendar(false)}
          />
        </div>
      )}
    </div>
  );
};

export const Input: React.FC<InputProps> = ({
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  required,
  error,
  hint,
  label,
  rows = 3,
  options = [],
  accept,
  min,
  max,
  step,
  searchable,
}) => {
  // Base classes matching original 'inp' style but using Tailwind
  const baseClasses = `
    w-full px-3 py-2 rounded-md
    border border-border
    bg-card text-text text-sm
    outline-none transition-all duration-300 ease-in-out
    focus:border-primary focus:ring-4 focus:ring-primary/10 focus:scale-[1.01]
    hover:border-primary/50
    disabled:opacity-50 disabled:cursor-not-allowed
    placeholder:text-text-muted/50
    rtl:text-right ltr:text-left
    ${error ? 'border-danger focus:border-danger ring-danger/10 animate-shake' : ''}
  `;

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            rows={rows}
            value={value ?? ''}
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
            value={value}
            onChange={onChange || (() => {})}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            baseClasses={baseClasses}
            searchable={searchable}
          />
        );

      case 'file':
        return (
          <input
            id={name}
            name={name}
            type="file"
            accept={accept}
            onChange={(e) => onChange?.(e.target.files?.[0] || null)}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            className={`${baseClasses} p-1 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-primary-light file:text-primary file:cursor-pointer hover:file:bg-primary/20`}
          />
        );

      case 'date':
        return (
          <DateInput
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

      default: // text, number, email, password
        return (
          <input
            id={name}
            name={name}
            type={type === 'number' ? 'number' : type}
            value={type === 'number' ? (value ?? '') : (value ?? '')}
            onChange={(e) => {
              if (type === 'number') {
                onChange?.(e.target.value === '' ? undefined : Number(e.target.value));
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
  };

  const { t, direction } = useLanguage();
  const translatedError = error ? t(`validation.${error}`, 'shared') : undefined;
  const finalError = (translatedError && translatedError !== `validation.${error}`) ? translatedError : error;

  return (
    <div className="w-full mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-semibold text-text mb-1.5">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      {renderInput()}
      {finalError && <div className="text-danger text-xs mt-1 animate-shake">{finalError}</div>}
      {hint && !finalError && <div className="text-text-muted text-xs mt-1">{hint}</div>}
    </div>
  );
};