// src/core/presentation/layouts/ui/inputs/DatePicker.tsx
import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { CalendarIcon } from 'lucide-react';
import { CustomCalendar } from '../calendar/Calendar';
import { useLanguage } from '../../../context/i18n/I18nProvider';
import { inputBaseClasses } from './styles';

interface DatePickerProps {
  value?: string;           // YYYY-MM-DD (internal)
  onChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled,
  required,
  className = '',
}: DatePickerProps) {
  const { direction, language } = useLanguage();
  const [inputValue, setInputValue] = useState(() => {
    if (value) {
      const [year, month, day] = value.split('-');
      return `${day}-${month}-${year}`; // convert to DD-MM-YYYY for display
    }
    return '';
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPositionRef = useRef<number | null>(null);

  // Convert internal YYYY-MM-DD to display DD-MM-YYYY
  const toDisplayFormat = (isoDate: string): string => {
    if (!isoDate || isoDate.length !== 10) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}-${month}-${year}`;
  };

  // Convert display DD-MM-YYYY to internal YYYY-MM-DD
  const toInternalFormat = (displayDate: string): string | null => {
    const parts = displayDate.split('-');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    if (year.length !== 4 || month.length !== 2 || day.length !== 2) return null;
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);
    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) return null;
    const date = new Date(yearNum, monthNum - 1, dayNum);
    if (date.getFullYear() !== yearNum || date.getMonth() !== monthNum - 1 || date.getDate() !== dayNum) return null;
    return `${year}-${month}-${day}`;
  };

  // Sync internal state when value prop changes
  useEffect(() => {
    if (value && value !== toInternalFormat(inputValue)) {
      setInputValue(toDisplayFormat(value));
      setError(false);
    } else if (!value && inputValue) {
      setInputValue('');
      setError(false);
    }
  }, [value]);

  // Restore cursor position after formatting
  useEffect(() => {
    if (cursorPositionRef.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
      cursorPositionRef.current = null;
    }
  }, [inputValue]);

  // Format input as DD-MM-YYYY while typing
  const formatInput = (raw: string): { formatted: string; cursorOffset: number } => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    let cursorOffset = 0;

    if (digits.length >= 1) {
      formatted += digits.slice(0, 2);
      if (digits.length >= 3) {
        formatted += '-' + digits.slice(2, 4);
        if (digits.length >= 5) {
          formatted += '-' + digits.slice(4, 8);
        }
      }
    }

    const oldLength = raw.length;
    const newLength = formatted.length;
    if (newLength > oldLength && (formatted[oldLength] === '-' || formatted[oldLength - 1] === '-')) {
      cursorOffset = 1;
    }
    return { formatted, cursorOffset };
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cursorPos = e.target.selectionStart || 0;

    const { formatted, cursorOffset } = formatInput(raw);
    setInputValue(formatted);

    let newCursorPos = cursorPos + cursorOffset;
    if (newCursorPos > formatted.length) newCursorPos = formatted.length;
    cursorPositionRef.current = newCursorPos;

    if (formatted.length === 10) {
      const internal = toInternalFormat(formatted);
      if (internal) {
        onChange(internal);
        setError(false);
      } else {
        setError(true);
      }
    } else {
      if (formatted === '') {
        onChange('');
      }
      setError(false);
    }
  };

  const handleCalendarSelect = (date: string) => {
    // date is YYYY-MM-DD from calendar
    setInputValue(toDisplayFormat(date));
    onChange(date);
    setShowCalendar(false);
    setError(false);
  };

  const handleBlur = () => {
    if (inputValue.length === 10) {
      const internal = toInternalFormat(inputValue);
      if (!internal) {
        setError(true);
      }
    }
    setTimeout(() => setShowCalendar(false), 200);
  };

  const handleFocus = () => {
    if (!disabled) setShowCalendar(true);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const baseClasses = `${inputBaseClasses} ${error ? 'border-danger focus:border-danger ring-danger/20' : ''} ${className}`;

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative group/date">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || (language === 'ar' ? 'DD-MM-YYYY' : 'DD-MM-YYYY')}
          disabled={disabled}
          required={required}
          className={`${baseClasses} ${disabled ? '' : 'pl-8 rtl:pr-8'}`}
        />
        <CalendarIcon
          size={16}
          className={`absolute ${direction === 'rtl' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-text-muted pointer-events-none`}
        />
      </div>
      {showCalendar && !disabled && (
        <div className="absolute z-50 mt-1 left-1/2 -translate-x-1/2 min-w-[320px]">
          <CustomCalendar
            value={value}
            onChange={handleCalendarSelect}
            onClose={() => setShowCalendar(false)}
          />
        </div>
      )}
    </div>
  );
}