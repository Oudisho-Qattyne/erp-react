// src/core/presentation/layouts/ui/inputs/DatePicker.tsx
import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent } from 'react';
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
      const parts = value.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return value;
    }
    return '';
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toDisplayFormat = (isoDate: string): string => {
    if (!isoDate || isoDate.length !== 10) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}-${month}-${year}`;
  };

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

  const formatDateString = (digits: string): string => {
    const clean = digits.replace(/\D/g, '').slice(0, 8);
    const parts: string[] = [];
    if (clean.length >= 1) parts.push(clean.slice(0, 2));
    if (clean.length >= 3) parts.push(clean.slice(2, 4));
    if (clean.length >= 5) parts.push(clean.slice(4, 8));
    return parts.join('-');
  };

  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        const display = toDisplayFormat(value);
        if (display !== inputValue) {
          setInputValue(display);
          setError(false);
        }
      }
    } else if (!value && inputValue) {
      setInputValue('');
      setError(false);
    }
  }, [value]);

  const digitPosInFormatted = (formatted: string, cursorPos: number): number => {
    return formatted.slice(0, cursorPos).replace(/\D/g, '').length;
  };

  const formattedPosFromDigitPos = (formatted: string, digitPos: number): number => {
    let count = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (formatted[i] !== '-') {
        if (count >= digitPos) return i;
        count++;
      }
    }
    return formatted.length;
  };

  const setCursor = (pos: number) => {
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(pos, pos);
    });
  };

  const emitIfComplete = (digits: string, formatted: string) => {
    if (digits.length === 8) {
      const internal = toInternalFormat(formatted);
      if (internal) {
        onChange(internal);
        setError(false);
      } else {
        setError(true);
      }
    } else {
      if (digits.length === 0) {
        onChange('');
      }
      setError(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    const oldFormatted = inputValue;
    const oldDigits = oldFormatted.replace(/\D/g, '');
    const cursorPos = e.currentTarget.selectionStart || 0;
    const selEnd = e.currentTarget.selectionEnd || cursorPos;
    const hasSelection = selEnd > cursorPos;

    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();

      const digitPos = digitPosInFormatted(oldFormatted, cursorPos);

      let newDigits: string;
      if (hasSelection) {
        const beforeDigits = oldFormatted.slice(0, cursorPos).replace(/\D/g, '');
        const afterDigits = oldFormatted.slice(selEnd).replace(/\D/g, '');
        newDigits = (beforeDigits + e.key + afterDigits).slice(0, 8);
      } else if (oldDigits.length >= 8) {
        newDigits = oldDigits.slice(0, digitPos) + e.key + oldDigits.slice(digitPos + 1);
      } else {
        const insertAt = Math.min(digitPos, oldDigits.length);
        newDigits = (oldDigits.slice(0, insertAt) + e.key + oldDigits.slice(insertAt)).slice(0, 8);
      }

      const formatted = formatDateString(newDigits);
      setInputValue(formatted);

      const newDigitPos = Math.min(
        hasSelection
          ? digitPosInFormatted(oldFormatted, cursorPos) + 1
          : oldDigits.length >= 8
            ? digitPos + 1
            : Math.min(digitPos + 1, 8),
        8
      );

      setCursor(formattedPosFromDigitPos(formatted, newDigitPos));
      emitIfComplete(newDigits, formatted);
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();

      if (hasSelection) {
        const beforeDigits = oldFormatted.slice(0, cursorPos).replace(/\D/g, '');
        const afterDigits = oldFormatted.slice(selEnd).replace(/\D/g, '');
        const newDigits = beforeDigits + afterDigits;
        const formatted = formatDateString(newDigits);
        setInputValue(formatted);
        setCursor(formattedPosFromDigitPos(formatted, beforeDigits.length));
        if (newDigits.length === 0) onChange('');
        setError(false);
      } else if (cursorPos > 0) {
        const digitPos = digitPosInFormatted(oldFormatted, cursorPos);
        if (digitPos > 0) {
          const newDigits = oldDigits.slice(0, digitPos - 1) + oldDigits.slice(digitPos);
          const formatted = formatDateString(newDigits);
          setInputValue(formatted);
          setCursor(formattedPosFromDigitPos(formatted, digitPos - 1));
          if (newDigits.length === 0) onChange('');
          setError(false);
        }
      }
      return;
    }

    if (e.key === 'Delete') {
      e.preventDefault();

      if (hasSelection) {
        const beforeDigits = oldFormatted.slice(0, cursorPos).replace(/\D/g, '');
        const afterDigits = oldFormatted.slice(selEnd).replace(/\D/g, '');
        const newDigits = beforeDigits + afterDigits;
        const formatted = formatDateString(newDigits);
        setInputValue(formatted);
        setCursor(formattedPosFromDigitPos(formatted, beforeDigits.length));
        if (newDigits.length === 0) onChange('');
        setError(false);
      } else if (cursorPos < oldFormatted.length) {
        const digitPos = digitPosInFormatted(oldFormatted, cursorPos);
        if (digitPos < oldDigits.length) {
          const newDigits = oldDigits.slice(0, digitPos) + oldDigits.slice(digitPos + 1);
          const formatted = formatDateString(newDigits);
          setInputValue(formatted);
          setCursor(formattedPosFromDigitPos(formatted, digitPos));
          if (newDigits.length === 0) onChange('');
          setError(false);
        }
      }
      return;
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    const formatted = formatDateString(digits);
    setInputValue(formatted);
    setError(false);
    emitIfComplete(digits, formatted);
  };

  const handleCalendarSelect = (date: string) => {
    setInputValue(toDisplayFormat(date));
    onChange(date);
    setShowCalendar(false);
    setError(false);
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
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          onFocus={handleFocus}
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
        <div
          className="absolute z-50 mt-1 left-1/2 -translate-x-1/2 min-w-[320px]"
          onMouseDown={(e) => e.preventDefault()}
        >
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
