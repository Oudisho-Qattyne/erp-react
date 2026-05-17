'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

interface CalendarProps {
  value?: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  onClose: () => void;
}

export function CustomCalendar({ value, onChange, onClose }: CalendarProps) {
  const { direction, language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date>(value ? new Date(value) : new Date());
  const [viewDate, setViewDate] = useState<Date>(value ? new Date(value) : new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  const months = language === 'ar' 
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const daysOfWeek = language === 'ar'
    ? ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dateStr = newDate.toISOString().split('T')[0];
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
  // Padding for first day
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
      {/* Header */}
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

      {/* Days of Week */}
      <div className="grid grid-cols-7 mb-2">
        {daysOfWeek.map((day, i) => (
          <div key={i} className="h-10 w-10 flex items-center justify-center text-[10px] font-bold text-text-muted uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {days}
      </div>

      {/* Footer / Shortcuts Info */}
      <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-[9px] text-text-muted italic">
        <span>{language === 'ar' ? 'الأسهم للتنقل (Ctrl للسنة/الشهر)' : 'Arrows to navigate (Ctrl for Year/Month)'}</span>
        <button 
          onClick={() => {
            const now = new Date().toISOString().split('T')[0];
            onChange(now);
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
