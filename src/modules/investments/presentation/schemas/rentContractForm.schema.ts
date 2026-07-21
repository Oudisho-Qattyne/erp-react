import { z } from 'zod';

export const getCreateRentContractFormSchema = (t: (key: string, module?: string) => string) => z.object({
  renter_name: z.string().min(1, t('rent_contract.validation.renter_name_required', 'investments') || 'Renter name is required'),
  renter_phone: z.string().min(1, t('rent_contract.validation.renter_phone_required', 'investments') || 'Phone is required'),
  rent_contract_number: z.string().min(1, t('rent_contract.validation.contract_number_required', 'investments') || 'Contract number is required'),
  rent_contract_date: z.string().min(1, t('rent_contract.validation.contract_date_required', 'investments') || 'Contract date is required'),
  rent_area: z.number().positive(t('rent_contract.validation.rent_area_positive', 'investments') || 'Area must be positive'),
  rent_contract_duration: z.string().min(1, t('rent_contract.validation.duration_required', 'investments') || 'Duration is required'),
  rent_contract_industry_id: z.number().optional().nullable(),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const RentContractFormSchema = getCreateRentContractFormSchema(dummyT);

export type RentContractFormData = z.infer<typeof RentContractFormSchema>;
