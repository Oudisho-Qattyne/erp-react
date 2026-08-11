import type { FieldConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import type { Fee } from '../../domain/entities/Fee';

type Translate = (key: string, module?: string) => string;

export const buildCreateFeeFormFields = (t: Translate): FieldConfig[] => [
  { name: 'name', label: t('fee.name', 'finance') || 'Name', type: 'alpha', required: true },
  { name: 'code', label: t('fee.code', 'finance') || 'Code', type: 'alphanumeric', required: true },
  {
    name: 'fee_value',
    label: t('fee.fee_value', 'finance') || 'Fee Value',
    type: 'decimal',
    required: true,
    decimalPlaces: 2,
  },
  {
    name: 'fee_status',
    label: t('fee.fee_status', 'finance') || 'Status',
    type: 'select',
    required: true,
    options: [
      { value: 'active', label: t('fee.status_active', 'finance') || 'Active' },
      { value: 'archived', label: t('fee.status_archived', 'finance') || 'Archived' },
    ],
  },
];

export const buildUpdateFeeFormFields = (t: Translate): FieldConfig[] => [
  { name: 'name', label: t('fee.name', 'finance') || 'Name', type: 'alpha', required: true },
  {
    name: 'fee_status',
    label: t('fee.fee_status', 'finance') || 'Status',
    type: 'select',
    required: true,
    options: [
      { value: 'active', label: t('fee.status_active', 'finance') || 'Active' },
      { value: 'archived', label: t('fee.status_archived', 'finance') || 'Archived' },
    ],
  },
];

export const buildFeeDefaultValues = (fee: Fee): Record<string, string | number | null | undefined> => ({
  name: fee.name,
  fee_status: fee.fee_status,
});
