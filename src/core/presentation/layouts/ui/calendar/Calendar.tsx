import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../../context/i18n/I18nProvider';

interface CalendarProps {
  value?: string;
  onChange: (date: string) => void;
  onClose: () => void;
}

type CalendarView = 'days' | 'months' | 'years';

export function CustomCalendar({ value, onChange, onClose }: CalendarProps) {
  const { direction, language } = useLanguage();
  const parseDate = (dateStr?: string): Date => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  const [selectedDate, setSelectedDate] = useState<Date>(parseDate(value));
  const [viewDate, setViewDate] = useState<Date>(parseDate(value));
  const [view, setView] = useState<CalendarView>('days');
  const calendarRef = useRef<HTMLDivElement>(null);

  const months = language === 'ar'
    ? ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const monthsShort = language === 'ar'
    ? months
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const daysOfWeek = language === 'ar'
    ? ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const formatLocalDate = (year: number, month: number, day: number): string => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleDateSelect = (day: number) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + 1;
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

  const handleMonthSelect = (idx: number) => {
    setViewDate(new Date(viewDate.getFullYear(), idx, 1));
    setView('days');
  };

  const handleYearSelect = (y: number) => {
    setViewDate(new Date(y, viewDate.getMonth(), 1));
    setView('days');
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (view !== 'days') {
      if (e.key === 'Escape') {
        e.preventDefault();
        setView('days');
        return;
      }
    }
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
        if (view === 'days') {
          handleDateSelect(viewDate.getDate());
        }
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
  }, [viewDate, direction, onClose, view]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    setView('days');
  }, [value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();

  const renderNav = (onPrev: () => void, onDoublePrev: () => void, onNext: () => void, onDoubleNext: () => void) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex gap-1">
        <button type="button" onClick={onDoublePrev} className="p-1 hover:bg-primary-light rounded-md transition-colors">
          {direction === 'rtl' ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
        <button type="button" onClick={onPrev} className="p-1 hover:bg-primary-light rounded-md transition-colors">
          {direction === 'rtl' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      {view === 'days' && (
        <div className="flex items-center gap-1 text-sm font-black text-text">
          <button
            type="button"
            onClick={() => setView('months')}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-primary/10 transition-colors"
          >
            {months[month]}
            <ChevronDown size={12} className="opacity-50" />
          </button>
          <button
            type="button"
            onClick={() => setView('years')}
            className="px-1.5 py-0.5 rounded hover:bg-primary/10 transition-colors"
          >
            {year}
          </button>
        </div>
      )}
      {view === 'months' && (
        <button
          type="button"
          onClick={() => setView('years')}
          className="text-sm font-black text-text px-1.5 py-0.5 rounded hover:bg-primary/10 transition-colors"
        >
          {year}
        </button>
      )}
      {view === 'years' && (
        <div className="text-sm font-black text-text">
          {Math.floor(year / 12) * 12} - {Math.floor(year / 12) * 12 + 11}
        </div>
      )}
      <div className="flex gap-1">
        <button type="button" onClick={onNext} className="p-1 hover:bg-primary-light rounded-md transition-colors">
          {direction === 'rtl' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
        <button type="button" onClick={onDoubleNext} className="p-1 hover:bg-primary-light rounded-md transition-colors">
          {direction === 'rtl' ? <ChevronsLeft size={16} /> : <ChevronsRight size={16} />}
        </button>
      </div>
    </div>
  );

  const renderDaysView = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

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
          type="button"
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
      <>
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
      </>
    );
  };

  const renderMonthsView = () => (
    <div className="grid grid-cols-3 gap-2 p-1">
      {monthsShort.map((name, idx) => {
        const isCurrent = idx === month;
        return (
          <button
            type="button"
            key={idx}
            onClick={() => handleMonthSelect(idx)}
            className={`
              py-3 px-2 rounded-lg text-sm font-medium transition-all
              ${isCurrent ? 'bg-primary text-white shadow-md scale-105' : 'hover:bg-primary/10 text-text'}
            `}
          >
            {name}
          </button>
        );
      })}
    </div>
  );

  const renderYearsView = () => {
    const startYear = Math.floor(year / 12) * 12;
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);
    return (
      <div className="grid grid-cols-3 gap-2 p-1">
        {years.map((y) => {
          const isCurrent = y === year;
          return (
            <button
              type="button"
              key={y}
              onClick={() => handleYearSelect(y)}
              className={`
                py-3 px-2 rounded-lg text-sm font-medium transition-all
                ${isCurrent ? 'bg-primary text-white shadow-md scale-105' : 'hover:bg-primary/10 text-text'}
              `}
            >
              {y}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div
      ref={calendarRef}
      className="border border-border rounded-xl shadow-2xl p-4 w-[320px] animate-slide-up backdrop-blur-md bg-card/95"
      onClick={(e) => e.stopPropagation()}
    >
      {view === 'days' && renderNav(
        () => changeMonth(-1),
        () => changeYear(-1),
        () => changeMonth(1),
        () => changeYear(1),
      )}
      {view === 'months' && renderNav(
        () => changeYear(-1),
        () => changeYear(-5),
        () => changeYear(1),
        () => changeYear(5),
      )}
      {view === 'years' && renderNav(
        () => changeYear(-12),
        () => changeYear(-60),
        () => changeYear(12),
        () => changeYear(60),
      )}

      {view === 'days' && renderDaysView()}
      {view === 'months' && renderMonthsView()}
      {view === 'years' && renderYearsView()}

      <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-[9px] text-text-muted italic">
        <span>{language === 'ar' ? 'الأسهم للتنقل (Ctrl للسنة/الشهر)' : 'Arrows to navigate (Ctrl for Year/Month)'}</span>
        <button type="button"
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
