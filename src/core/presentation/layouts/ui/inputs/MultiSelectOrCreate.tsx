import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useLanguage } from "../../../context/i18n/I18nProvider";
import { Button } from "../buttons/Button";
import { Plus, ChevronDown, Search, Check, X } from "lucide-react";
import { Dialog } from "../dialog/Dialog";

interface MultiSelectOrCreateProps {
  value: (number | string)[];
  onChange: (value: (number | string)[]) => void;
  options: { value: number | string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  createTitle?: string;
  renderCreateForm?: (
    onSuccess: (newValue: number | string, newItem: any) => void,
    onCancel: () => void,
    dependentData?: any
  ) => React.ReactNode;
  dependentData?: any;
  baseClasses?: string;
  labelPath?: string;
}

export function MultiSelectOrCreate({
  value = [],
  onChange,
  options,
  placeholder,
  disabled,
  required,
  searchable,
  createTitle,
  renderCreateForm,
  dependentData,
  baseClasses,
  labelPath,
}: MultiSelectOrCreateProps) {
  const { t, direction } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [createdOptions, setCreatedOptions] = useState<{ value: number | string; label: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCreatedOptions([]);
  }, [options]);

  const combinedOptions = useMemo(() => {
    const merged = [...options];
    for (const created of createdOptions) {
      if (!merged.some(opt => opt.value === created.value)) {
        merged.push(created);
      }
    }
    return merged;
  }, [options, createdOptions]);

  const filteredOptions = combinedOptions.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItems = useMemo(
    () => combinedOptions.filter(opt => value.includes(opt.value)),
    [combinedOptions, value]
  );

  function getNestedValue(obj: any, path: string): string {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? '';
  }

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

  const handleCreateSuccess = (newValue: number | string, newItem: any) => {
    let localValue = "";
    if (labelPath) {
      localValue = getNestedValue(newItem, labelPath) as string;
    } else {
      localValue = typeof newItem === 'string' ? newItem : (newItem?.name || String(newItem));
    }
    setCreatedOptions(prev => [...prev, { value: newValue, label: localValue }]);
    if (!value.includes(newValue)) {
      onChange([...value, newValue]);
    }
    setIsDialogOpen(false);
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      setSearch("");
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const newLabel = t('common.new', 'shared') !== 'common.new' ? t('common.new', 'shared') : 'جديد';

  return (
    <>
      <div className="relative w-full" ref={containerRef}>
        <div className="flex gap-2">
          {/* Trigger / tags area */}
          <div
            tabIndex={disabled ? -1 : 0}
            onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
            className={`relative flex items-center justify-between  cursor-pointer  min-h-9.5 w-full  ${baseClasses} ${isOpen ? 'ring-4 ring-primary/10 border-primary' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="relative flex flex-row flex-wrap gap-1 items-center">
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
                <span className="text-text-muted/50 text-sm">{placeholder || (direction === 'rtl' ? 'اختر...' : 'Select...')}</span>
              )}
            </div>
            <div>
              <ChevronDown size={16} className={`text-text-muted ml-auto shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
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

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute z-110 mt-1 w-full border border-border rounded-md shadow-2xl overflow-hidden animate-slide-up backdrop-blur-md bg-card/95">
            {searchable && (
              <div className="p-2 border-b border-border/50 sticky top-0 bg-card/90 backdrop-blur-sm z-10">
                <div className="relative">
                  <Search size={14} className={`absolute ${direction === 'rtl' ? 'right-2' : 'left-2'} top-1/2 -translate-y-1/2 text-text-muted`} />
                  <input
                    autoFocus
                    type="text"
                    className={`w-full bg-primary-light/10 border border-border/30 rounded py-1.5 text-xs outline-none focus:border-primary/50 ${direction === 'rtl' ? 'pr-8 pl-2 text-right' : 'pl-8 pr-2 text-left'}`}
                    placeholder={direction === 'rtl' ? 'بحث...' : 'Search...'}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
            <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-border">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => {
                  const isSelected = value.includes(opt.value);
                  return (
                    <div
                      key={opt.value}
                      onClick={(e) => { e.stopPropagation(); handleToggle(opt.value); }}
                      className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 ${isSelected ? 'bg-primary/5 text-primary font-medium' : 'text-text hover:bg-primary-light/20'}`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      <span className="truncate">{opt.label}</span>
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-center text-xs text-text-muted italic">
                  {direction === 'rtl' ? 'لا توجد نتائج' : 'No results found'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={createTitle}
        size="md"
      >
        {renderCreateForm?.(
          (v, i) => handleCreateSuccess(v, i),
          () => setIsDialogOpen(false),
          dependentData
        ) ?? (
            <div className="p-4 text-danger text-sm">يجب توفير renderCreateForm</div>
          )}
      </Dialog>
    </>
  );
}
