
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../buttons/Button';
import { Dialog } from '../dialog/Dialog';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectOrCreateProps {
  value?: string;
  onChange: (value: string, newItem?: any) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  // Creation dialog props
  createTitle: string;
  renderCreateForm: (onSuccess: (newValue: string, newItem: any) => void, onCancel: () => void) => React.ReactNode;
}

import { CustomSelect } from './CustomSelect';
import { useLanguage } from '../../../context/i18n/I18nProvider';

export function SelectOrCreate({
  value,
  onChange,
  options,
  placeholder = 'اختر...',
  label,
  required,
  error,
  disabled = false,
  searchable = false,
  createTitle,
  renderCreateForm,
}: SelectOrCreateProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t } = useLanguage();

  const handleCreateSuccess = (newValue: string, newItem: any) => {
    onChange(newValue, newItem);
    setIsDialogOpen(false);
  };

  const translatedError = error ? t(`validation.${error}`, 'shared') : undefined;
  const finalError = (translatedError && translatedError !== `validation.${error}`) ? translatedError : error;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-text">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="flex gap-2">
        <CustomSelect
          options={options}
          value={value}
          onChange={(val) => onChange(val, undefined)}
          disabled={disabled}
          placeholder={placeholder}
          searchable={searchable}
          baseClasses={`flex-1 px-3 py-2 rounded-md border border-border bg-card text-text text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none ${finalError ? 'border-danger animate-shake' : ''}`}
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
          {disabled ? '' : t('common.new', 'shared') !== 'common.new' ? t('common.new', 'shared') : 'جديد'}
        </Button>
      </div>
      {finalError && <div className="text-danger text-xs mt-1 animate-slide-up">{finalError}</div>}

      {/* Creation Dialog */}
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={createTitle} size="md">
        {renderCreateForm(handleCreateSuccess, () => setIsDialogOpen(false))}
      </Dialog>
    </div>
  );
}