import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import { useLanguage } from '../../../context/i18n/I18nProvider';

interface MultiOption {
  value: number | string;
  label: string;
}

interface CustomMultiSelectProps {
  options: MultiOption[];
  value: (number | string)[];
  onChange: (value: (number | string)[]) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  baseClasses?: string;
}

export function CustomMultiSelect({
  options,
  value = [],
  onChange,
  placeholder = 'Select...',
  disabled = false,
  searchable = false,
  baseClasses = '',
}: CustomMultiSelectProps) {
  const { direction, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() =>
    options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase())),
    [options, search]
  );

  const selectedItems = useMemo(
    () => options.filter(opt => value.includes(opt.value)),
    [options, value]
  );

  const handleToggle = (optValue: number | string) => {
    if (value.includes(optValue)) {
      onChange(value.filter(v => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  const handleRemove = (optValue: number | string) => {
    onChange(value.filter(v => v !== optValue));
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      setSearch('');
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

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
          handleToggle(filteredOptions[focusedIndex].value);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearch('');
        break;
      case 'Tab':
        setIsOpen(false);
        setSearch('');
        break;
    }
  };

  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[focusedIndex]) {
        (items[focusedIndex] as HTMLElement).scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex]);

  return (
    <div className="relative w-full" ref={containerRef} onKeyDown={handleKeyDown}>
      <div
        tabIndex={disabled ? -1 : 0}
        onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
        className={`
          flex items-center justify-between cursor-pointer min-h-9.5 w-full
          ${baseClasses}
          ${isOpen ? 'ring-4 ring-primary/10 border-primary scale-[1.01]' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex flex-row flex-wrap gap-1 items-center flex-1 min-w-0">
          {selectedItems.length > 0 ? (
            selectedItems.map(item => (
              <span
                key={item.value}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="max-w-30 truncate">{item.label}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemove(item.value); }}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))
          ) : (
            <span className="text-text-muted/50 text-sm">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-text-muted shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-110 mt-1 w-full border border-border rounded-md shadow-2xl overflow-hidden animate-slide-up backdrop-blur-md bg-card/95">
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
                  onChange={(e) => { setSearch(e.target.value); setFocusedIndex(0); }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          <div ref={listRef} className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-border">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => {
                const isSelected = value.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={(e) => { e.stopPropagation(); handleToggle(opt.value); }}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={`
                      px-3 py-2 text-sm cursor-pointer flex items-center justify-between
                      ${index === focusedIndex ? 'bg-primary/10 text-primary font-medium' : 'text-text hover:bg-primary-light/20'}
                      ${isSelected ? 'bg-primary/5' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      <span className="truncate">{opt.label}</span>
                    </div>
                  </div>
                );
              })
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
