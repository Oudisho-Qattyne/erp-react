import React from 'react';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { investorFormSchema } from '../../../schemas/investorForm.schema';
import { GenericCreateForm, type FieldConfig } from '../../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { Pencil } from 'lucide-react';
import type { Investor } from '../../../../domain/entities/investor';

interface InvestorFormProps {
  investor?: Investor;
  defaultValues?: any;
  onSubmit: (data: any) => Promise<any>;
  onSuccess: () => void;
  onCancel: () => void;
  submitLabel?: string;
  isCreate?: boolean;
}

export function InvestorForm({ investor, defaultValues, onSubmit, onSuccess, onCancel, submitLabel, isCreate }: InvestorFormProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = React.useState(!!isCreate);

  const formFields: FieldConfig[] = [
    { name: 'full_name', type: 'text', label: t('investors.full_name', 'investments') || 'Full Name', required: true },
    { name: 'national_id', type: 'text', label: t('investors.national_id', 'investments') || 'National ID' },
    { name: 'passport_number', type: 'text', label: t('investors.passport_number', 'investments') || 'Passport Number' },
    { name: 'nationality', type: 'text', label: t('investors.nationality', 'investments') || 'Nationality', required: true },
    { 
      name: 'gender', 
      type: 'select', 
      label: t('investors.gender', 'investments') || 'Gender', 
      required: true,
      options: [
        { value: 'male', label: t('investors.gender_male', 'investments') || 'Male' },
        { value: 'female', label: t('investors.gender_female', 'investments') || 'Female' }
      ]
    },
    { name: 'phone', type: 'text', label: t('investors.phone', 'investments') || 'Phone' },
    { name: 'whatsapp_number', type: 'text', label: t('investors.whatsapp_number', 'investments') || 'WhatsApp' },
    { name: 'email', type: 'email', label: t('investors.email', 'investments') || 'Email' },
    { name: 'address', type: 'textarea', label: t('investors.address', 'investments') || 'Address' },
    { name: 'is_possible_investor_in_future', type: 'checkbox', label: t('investors.is_possible_investor_in_future', 'investments') || 'Is Possible Investor In Future' },
  ];

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{t('investors.info', 'investments') || 'Investor Info'}</h2>
          {!isEditing && !isCreate && (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="flex items-center gap-2">
              <Pencil size={16} />
              {t('common.edit', 'shared') || 'Edit'}
            </Button>
          )}
        </div>

        {isEditing ? (
          <GenericCreateForm
            fields={formFields}
            schema={investorFormSchema}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            onSuccess={onSuccess}
            onCancel={isCreate ? onCancel : () => setIsEditing(false)}
            submitLabel={submitLabel}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-sm text-text-muted">{t('investors.full_name', 'investments') || 'Full Name'}</span>
              <p className="font-medium text-text">{investor?.full_name || '—'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-text-muted">{t('investors.national_id', 'investments') || 'National ID'}</span>
              <p className="font-medium text-text">{investor?.national_id || '—'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-text-muted">{t('investors.passport_number', 'investments') || 'Passport Number'}</span>
              <p className="font-medium text-text">{investor?.passport_number || '—'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-text-muted">{t('investors.nationality', 'investments') || 'Nationality'}</span>
              <p className="font-medium text-text">{investor?.nationality || '—'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-text-muted">{t('investors.gender', 'investments') || 'Gender'}</span>
              <p className="font-medium text-text">
                {investor?.gender ? (t(`investors.gender_${investor.gender}`, 'investments') || investor.gender) : '—'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-text-muted">{t('investors.phone', 'investments') || 'Phone'}</span>
              <p className="font-medium text-text">{investor?.phone || '—'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-text-muted">{t('investors.whatsapp_number', 'investments') || 'WhatsApp'}</span>
              <p className="font-medium text-text">{investor?.whatsapp_number || '—'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-text-muted">{t('investors.email', 'investments') || 'Email'}</span>
              <p className="font-medium text-text">{investor?.email || '—'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-text-muted">{t('investors.is_possible_investor_in_future', 'investments') || 'Is Possible Investor In Future'}</span>
              <p className="font-medium text-text">
                {investor?.is_possible_investor_in_future ? (t('common.yes', 'shared') || 'Yes') : (t('common.no', 'shared') || 'No')}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-text-muted">{t('investors.added_by', 'investments') || 'Added By'}</span>
              <p className="font-medium text-text">{investor?.user?.name || '—'}</p>
            </div>
            <div className="space-y-1 md:col-span-2 lg:col-span-3">
              <span className="text-sm text-text-muted">{t('investors.address', 'investments') || 'Address'}</span>
              <p className="font-medium text-text whitespace-pre-wrap">{investor?.address || '—'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
