import { useEffect, useState, useMemo } from "react";
import { useLanguage } from "../../../context/i18n/I18nProvider";
import { CustomSelect } from "./CustomSelect";
import { Button } from "../buttons/Button";
import { Plus } from "lucide-react";
import { Dialog } from "../dialog/Dialog";

interface SelectOrCreateProps {
  value: any;
  onChange: (value: any) => void;
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
  /** Dot‑notation path to the label inside the newItem, e.g. "data.name.ar" */
  labelPath?: string;
}

export function SelectOrCreate({
  value,
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
}: SelectOrCreateProps) {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [createdOptions, setCreatedOptions] = useState<{
    value: number | string;
    label: string;
  }[]>([]);

  // Clear locally created options when the parent's options array changes (e.g. dependency filter changed)
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

  function getNestedValue(obj: any, path: string): string {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? '';
  }

  const handleCreateSuccess = (newValue: number | string, newItem: any) => {
    onChange(newValue);
    let localValue = "";
    if (labelPath) {
      localValue = getNestedValue(newItem, labelPath) as string;
    } else {
      localValue = typeof newItem === 'string' ? newItem : (newItem?.name || String(newItem));
    }
    setCreatedOptions(prev => [...prev, { value: newValue, label: localValue }]);
    setIsDialogOpen(false);
  };

  const newLabel = t('common.new', 'shared') !== 'common.new' ? t('common.new', 'shared') : 'جديد';

  return (
    <>
      <div className="flex gap-2">
        <CustomSelect
          options={combinedOptions}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          searchable={searchable}
          baseClasses={`${baseClasses} flex-1`}
        />
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
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={createTitle}
        size="md"
      >
        {renderCreateForm?.(
          (v, i) => {
            handleCreateSuccess(v, i);
          },
          () => setIsDialogOpen(false),
          dependentData
        ) ?? (
          <div className="p-4 text-danger text-sm">يجب توفير renderCreateForm</div>
        )}
      </Dialog>
    </>
  );
}