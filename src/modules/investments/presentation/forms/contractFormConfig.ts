import type { FieldConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import type { Contract } from '../../domain/entities/contract';

type Translate = (key: string, module?: string) => string;

const normalizeDate = (dateStr: string) => {
  if (!dateStr) return '';
  const isoMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

export const buildContractFormFields = (t: Translate): FieldConfig[] => [
  { name: 'contract_number', type: 'numeric', label: t('contract.contract_number', 'investments') || 'Contract Number', required: true },
  { name: 'contract_date', type: 'date', label: t('contract.contract_date', 'investments') || 'Contract Date', required: true },
  { name: 'unit_price_per_square_meter', type: 'number', label: t('contract.unit_price_per_square_meter', 'investments') || 'Unit Price / m²', required: true },
  { name: 'weighting_factor', type: 'number', label: t('contract.weighting_factor', 'investments') || 'Weighting Factor', required: true },
  {
    name: 'payment_method', type: 'select', label: t('contract.payment_method', 'investments') || 'Payment Method', required: true, options: [
      { value: 'cash', label: t('contract.payment_method_cash', 'investments') || 'Cash' },
      { value: 'installment', label: t('contract.payment_method_installment', 'investments') || 'Installment' },
    ]
  },
];

export const buildContractDefaultValues = (contract: Contract): Record<string, string | number | null | undefined> => ({
  contract_number: contract.contract_number,
  contract_date: normalizeDate(contract.contract_date),
  unit_price_per_square_meter: contract.unit_price_per_square_meter,
  weighting_factor: contract.weighting_factor,
  payment_method: contract.payment_method,
});