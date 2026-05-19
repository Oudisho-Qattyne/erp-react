// src/core/presentation/layouts/ui/calendar/Calendar.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useLanguage } from '../../../context/i18n/I18nProvider';

interface CalendarProps {
  value?: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  onClose: () => void;
}

export function CustomCalendar({ value, onChange, onClose }: CalendarProps) {
  const { direction, language } = useLanguage();
  // Parse the value string (YYYY-MM-DD) into local date components
  const parseDate = (dateStr?: string): Date => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // local date
  };
  const [selectedDate, setSelectedDate] = useState<Date>(parseDate(value));
  const [viewDate, setViewDate] = useState<Date>(parseDate(value));
  const calendarRef = useRef<HTMLDivElement>(null);

  const months = language === 'ar' 
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const daysOfWeek = language === 'ar'
    ? ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  // Build local YYYY-MM-DD string from year, month (1‑based), day
  const formatLocalDate = (year: number, month: number, day: number): string => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleDateSelect = (day: number) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + 1; // convert to 1‑based
    const dateStr = formatLocalDate(year, month, day);
    onChange(dateStr);
    onClose();
  };

  const changeMonth = (delta: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));
  };

  const changeYear = (delta: number) => {
    setViewDate(new Date(viewDate.getFullYear() + delta, viewDate.getMonth(), 1));
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (e.ctrlKey) {
          changeMonth(direction === 'rtl' ? 1 : -1);
        } else {
          setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - (direction === 'rtl' ? -1 : 1)));
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (e.ctrlKey) {
          changeMonth(direction === 'rtl' ? -1 : 1);
        } else {
          setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + (direction === 'rtl' ? -1 : 1)));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (e.ctrlKey) {
          changeYear(1);
        } else {
          setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7));
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (e.ctrlKey) {
          changeYear(-1);
        } else {
          setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7));
        }
        break;
      case 'Enter':
        e.preventDefault();
        handleDateSelect(viewDate.getDate());
        break;
      case 'PageUp':
        e.preventDefault();
        changeMonth(-1);
        break;
      case 'PageDown':
        e.preventDefault();
        changeMonth(1);
        break;
    }
  }, [viewDate, direction, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
    const isSelected = selectedDate.getDate() === d && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
    const isFocus = viewDate.getDate() === d;
    days.push(
      <button
        key={d}
        onClick={() => handleDateSelect(d)}
        className={`
          h-10 w-10 flex items-center justify-center rounded-full text-sm transition-all duration-200
          ${isToday ? 'border border-primary text-primary font-bold' : ''}
          ${isSelected ? 'bg-primary text-white shadow-lg scale-110' : 'hover:bg-primary/10'}
          ${isFocus && !isSelected ? 'ring-2 ring-primary/30 ring-inset' : ''}
        `}
      >
        {d}
      </button>
    );
  }

  return (
    <div 
      ref={calendarRef}
      className="border border-border rounded-xl shadow-2xl p-4 w-[320px] animate-slide-up backdrop-blur-md bg-card/95"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          <button onClick={() => changeYear(-1)} className="p-1 hover:bg-primary-light rounded-md transition-colors">
            {direction === 'rtl' ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
          <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-primary-light rounded-md transition-colors">
            {direction === 'rtl' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <div className="text-sm font-black text-text">
          {months[month]} {year}
        </div>
        <div className="flex gap-1">
          <button onClick={() => changeMonth(1)} className="p-1 hover:bg-primary-light rounded-md transition-colors">
            {direction === 'rtl' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
          <button onClick={() => changeYear(1)} className="p-1 hover:bg-primary-light rounded-md transition-colors">
            {direction === 'rtl' ? <ChevronsLeft size={16} /> : <ChevronsRight size={16} />}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {daysOfWeek.map((day, i) => (
          <div key={i} className="h-10 w-10 flex items-center justify-center text-[10px] font-bold text-text-muted uppercase">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {days}
      </div>
      <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-[9px] text-text-muted italic">
        <span>{language === 'ar' ? 'الأسهم للتنقل (Ctrl للسنة/الشهر)' : 'Arrows to navigate (Ctrl for Year/Month)'}</span>
        <button 
          onClick={() => {
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            onChange(todayStr);
            onClose();
          }}
          className="text-primary font-bold hover:underline"
        >
          {language === 'ar' ? 'اليوم' : 'Today'}
        </button>
      </div>
    </div>
  );
}