import { z } from 'zod';

export const getCreateContractFormSchema = (t: (key: string, module?: string) => string) => z.object({
  dossier_id: z.number().optional(),
  contract_number: z.string().min(1, t('contract.validation.contract_number_required', 'investments') || 'Contract number is required'),
  contract_date: z.string().min(1, t('contract.validation.contract_date_required', 'investments') || 'Contract date is required'),
  unit_price_per_square_meter: z.number().positive(t('contract.validation.unit_price_positive', 'investments') || 'Unit price must be positive'),
  weighting_factor: z.number().positive(t('contract.validation.weighting_factor_positive', 'investments') || 'Weighting factor must be positive'),
  payment_method: z.enum(['cash', 'installment'], t('contract.validation.payment_method_required', 'investments') || 'Payment method is required'),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const contractFormSchema = getCreateContractFormSchema(dummyT);

export type ContractFormData = z.infer<typeof contractFormSchema>;
