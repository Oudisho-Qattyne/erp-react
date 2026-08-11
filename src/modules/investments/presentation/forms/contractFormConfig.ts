import type { FieldConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import type { Contract } from '../../domain/entities/contract';

type Translate = (key: string, module?: string) => string;

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
  contract_date: contract.contract_date,
  unit_price_per_square_meter: contract.unit_price_per_square_meter,
  weighting_factor: contract.weighting_factor,
  payment_method: contract.payment_method,
});