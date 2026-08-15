import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../../context/i18n/I18nProvider';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';

export interface HintRect {
  top: number;
  left: number;
  width: number;
}

export interface HintsInputProps {
  value: unknown;
  onChange: (value: unknown) => void;
  onSelectItem: (item: Record<string, unknown>) => void;
  searchApi: (query: string, dependentData?: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
  dependentData?: Record<string, unknown>;
  minChars?: number;
  debounceMs?: number;
  formatValue: (item: Record<string, unknown>) => string;
  placeholder?: string;
  disabled?: boolean;
  baseClasses?: string;
  renderHint?: (item: Record<string, unknown>, active: boolean, index: number) => React.ReactNode;
  anchorRect?: () => HintRect | null;
  renderDropList?: (items: Record<string, unknown>[], activeIndex: number, onSelect: (item: Record<string, unknown>) => void) => React.ReactNode;
}

export function HintsInput({
  value,
  onChange,
  onSelectItem,
  searchApi,
  dependentData,
  minChars = 2,
  debounceMs = 300,
  formatValue,
  placeholder,
  disabled = false,
  baseClasses = '',
  renderHint,
  anchorRect,
  renderDropList,
}: HintsInputProps) {
  const { language } = useLanguage();
  const [text, setText] = useState<string>(String(value ?? ''));
  const [results, setResults] = useState<{ query: string; items: Record<string, unknown>[] } | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dropBoxRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebouncedValue(text, debounceMs);
  const trimmedQuery = debouncedQuery.trim();

  useEffect(() => {
    setText(String(value ?? ''));
  }, [value]);

  useEffect(() => {
    if (trimmedQuery.length < minChars) return;
    let cancelled = false;
    searchApi(trimmedQuery, dependentData)
      .then((items) => {
        if (!cancelled) {
          setResults({ query: trimmedQuery, items });
          setActiveIndex(0);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResults({ query: trimmedQuery, items: [] });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [trimmedQuery, minChars, searchApi, dependentData]);

  const resultsMatch = results?.query === trimmedQuery;
  const hints = resultsMatch ? results!.items : [];

  const handleSelect = (item: Record<string, unknown>) => {
    setText(formatValue(item));
    setOpen(false);
    setActiveIndex(-1);
    onSelectItem(item);
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node) &&
      !dropBoxRef.current?.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const activeItem = renderDropList
      ? listRef.current.querySelectorAll('tbody tr')[activeIndex]
      : listRef.current.children[activeIndex];
    if (activeItem) {
      (activeItem as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, renderDropList]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (hints.length > 0) {
          setOpen(true);
          setActiveIndex((prev) => (prev < hints.length - 1 ? prev + 1 : prev));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        if (open && activeIndex >= 0 && hints[activeIndex]) {
          e.preventDefault();
          handleSelect(hints[activeIndex]);
        }
        break;
      case 'Escape':
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  const showDropdown = open && trimmedQuery.length >= minChars;

  const dropdownBox = (content: React.ReactNode): React.ReactNode => {
    const boxClass = 'z-[100001] border border-border rounded-md shadow-2xl overflow-hidden animate-slide-up backdrop-blur-md bg-card/95';
    if (anchorRect) {
      const anchor = anchorRect();
      if (!anchor) return null;
      const rect: HintRect = {
        top: anchor.top + 4,
        left: anchor.left,
        width: Math.max(0, Math.min(anchor.width, window.innerWidth - (anchor.left + 8))),
      };
      return createPortal(
        <div ref={dropBoxRef} className={`fixed ${boxClass}`} style={{ top: rect.top, left: rect.left, width: rect.width }}>
          {content}
        </div>,
        document.body
      );
    }
    return (
      <div ref={dropBoxRef} className={`absolute mt-1 left-0 right-0 min-w-[280px] ${boxClass}`}>
        {content}
      </div>
    );
  };
  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
          onChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`${baseClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {showDropdown && dropdownBox(
        <div ref={listRef} className={`max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-border ${renderDropList ? '' : 'py-1'}`}>
          {!resultsMatch ? (
            <div className="px-3 py-4 text-center text-xs text-text-muted italic">
              {language === 'ar' ? 'جارٍ البحث...' : 'Searching...'}
            </div>
          ) : hints.length > 0 ? (
            renderDropList
              ? renderDropList(hints, activeIndex, handleSelect)
              : hints.map((item, index) => (
                  <div
                    key={index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(item);
                    }}
                  >
                    {renderHint?.(item, index === activeIndex, index)}
                  </div>
                ))
          ) : (
            <div className="px-3 py-4 text-center text-xs text-text-muted italic">
              {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
