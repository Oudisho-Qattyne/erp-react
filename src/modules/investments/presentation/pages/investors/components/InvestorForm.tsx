import React from 'react';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { getCreateInvestorFormSchema } from '../../../schemas/investorForm.schema';
import { GenericCreateForm, type FieldConfig } from '../../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { Pencil } from 'lucide-react';
import type { Investor } from '../../../../domain/entities/investor';

interface InvestorFormProps {
  investor?: Investor;
  defaultValues?: any;
  onSubmit: (data: any) => Promise<any>;
  onSuccess: (id: number, item: any) => void;
  onCancel: () => void;
  submitLabel?: string;
  isCreate?: boolean;
  edit?:boolean;
}

export function InvestorForm({ investor, defaultValues, onSubmit, onSuccess, onCancel, submitLabel, isCreate , edit = false}: InvestorFormProps) {
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
    { name: 'facebook', type: 'text', label: t('investors.facebook', 'investments') || 'Facebook' },
    { name: 'instagram', type: 'text', label: t('investors.instagram', 'investments') || 'Instagram' },
    { name: 'x', type: 'text', label: t('investors.x', 'investments') || 'Address' },
    { name: 'linkedin', type: 'text', label: t('investors.linkedin', 'investments') || 'Linkedin' },
  ];
  
  if(edit){
    formFields.push(
      { name: 'is_possible_investor_in_future', type: 'checkbox', label: t('investors.is_possible_investor_in_future', 'investments') || 'Is Possible Investor In Future' },
    )
  }


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
            schema={getCreateInvestorFormSchema(t)}
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
                {investor?.gender ? (t(`investors.gender_${investor?.gender}`, 'investments') || investor?.gender) : '—'}
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
      {!isEditing &&(investor?.facebook || investor?.instagram || investor?.x || investor?.linkedin) && (

        <div className=" p-4">
          <div className=" mb-6">
            <h2 className="text-lg font-bold">{t('investors.accounts', 'investments') || 'Investor Accounts'}</h2>
          </div>
          <div className="flex items-center gap-4">
            {investor?.facebook && (
              <a href={investor?.facebook} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-text hover:bg-primary-light/10 hover:text-primary transition-colors">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                {t('investors.facebook', 'investments') || 'Facebook'}
              </a>
            )}
            {investor?.instagram && (
              <a href={investor?.instagram} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-text hover:bg-primary-light/10 hover:text-primary transition-colors">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                {t('investors.instagram', 'investments') || 'Instagram'}
              </a>
            )}
            {investor?.x && (
              <a href={investor?.x} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-text hover:bg-primary-light/10 hover:text-primary transition-colors">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                {t('investors.x', 'investments') || 'X'}
              </a>
            )}
            {investor?.linkedin && (
              <a href={investor?.linkedin} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-text hover:bg-primary-light/10 hover:text-primary transition-colors">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                {t('investors.linkedin', 'investments') || 'LinkedIn'}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
