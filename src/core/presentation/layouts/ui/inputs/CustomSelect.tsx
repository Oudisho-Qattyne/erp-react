import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { useLanguage } from '../../../context/i18n/I18nProvider';

interface Option {
  value: number | string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value?: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  baseClasses?: string;
  searchable?: boolean;
}

export function CustomSelect({
  options,
  value,
  onChange,
  onBlur,
  placeholder = 'Select...',
  disabled = false,
  required = false,
  error = false,
  baseClasses = '',
  searchable = false,
}: CustomSelectProps) {
  const { direction, language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);
  const handleSelect = (val: number | string) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      onBlur?.();
    }
  }, [onBlur]);

  const handleFocusOutside = useCallback((event: FocusEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('focusin', handleFocusOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('focusin', handleFocusOutside);
    };
  }, [handleClickOutside, handleFocusOutside]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) setIsOpen(true);
        setFocusedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          handleSelect(filteredOptions[focusedIndex].value);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const activeItem = listRef.current.children[focusedIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex]);

  return (
    <div 
      className="relative w-full" 
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <div
        tabIndex={disabled ? -1 : 0}
        onMouseDown={() => !disabled && setIsOpen(true)}
        onClick={() => !disabled && setIsOpen(true)}
        onFocus={() => !disabled && setIsOpen(true)}
        className={`
          flex items-center justify-between cursor-pointer
          ${baseClasses}
          ${isOpen ? 'ring-4 ring-primary/10 border-primary scale-[1.01]' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className={`truncate ${!selectedOption ? 'text-text-muted/50' : 'text-text'}`}>
          {selectedOption ? selectedOption.label : (placeholder || (language === 'ar' ? 'اختر...' : 'Select...'))}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className={`
          absolute z-110 mt-1 w-full  border border-border rounded-md shadow-2xl overflow-hidden
          animate-slide-up backdrop-blur-md bg-card/95
        `}>
          {/* Search bar */}
          {searchable && (
            <div className="p-2 border-b border-border/50 sticky top-0 bg-card/90 backdrop-blur-sm z-10">
              <div className="relative">
                <Search size={14} className={`absolute ${direction === 'rtl' ? 'right-2' : 'left-2'} top-1/2 -translate-y-1/2 text-text-muted`} />
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  className={`
                    w-full bg-primary-light/10 border border-border/30 rounded py-1.5 text-xs outline-none focus:border-primary/50
                    ${direction === 'rtl' ? 'pr-8 pl-2 text-right' : 'pl-8 pr-2 text-left'}
                  `}
                  placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setFocusedIndex(0);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options list */}
          <div 
            ref={listRef}
            className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-border"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => (
                <div
                  key={opt.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt.value);
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`
                    px-3 py-2 text-sm cursor-pointer flex items-center justify-between
                    ${index === focusedIndex ? 'bg-primary/10 text-primary font-medium' : 'text-text hover:bg-primary-light/20'}
                    ${opt.value === value ? 'bg-primary/5' : ''}
                  `}
                >
                  <span className="truncate">{opt.label}</span>
                  {opt.value === value && <Check size={14} className="text-primary" />}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-text-muted italic">
                {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
