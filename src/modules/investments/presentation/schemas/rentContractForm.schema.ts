import { z } from 'zod';
import { notInTheFuture, notInThePast } from '../../../../core/presentation/schemas/dateSchema';

const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

export const getCreateRentContractFormSchema = (t: (key: string, module?: string) => string) => z.object({
  renter_name: z.string().min(1, t('rent_contract.validation.renter_name_required', 'investments') || 'Renter name is required'),
  renter_phone: z.string().min(1, t('rent_contract.validation.renter_phone_required', 'investments') || 'Phone is required'),
  rent_contract_number: z.string().min(1, t('rent_contract.validation.contract_number_required', 'investments') || 'Contract number is required'),
  rent_contract_date: z.string().regex(dateFormatRegex, t('rent_contract.validation.contract_date_format', 'investments') || 'Contract date must be YYYY-MM-DD').superRefine(notInTheFuture(t('rent_contract.validation.contract_date_future', 'investments') || 'Contract date cannot be in the future')),
  rent_area: z.number().positive(t('rent_contract.validation.rent_area_positive', 'investments') || 'Area must be positive'),
  rent_contract_duration: z.string().regex(dateFormatRegex, t('rent_contract.validation.duration_date_format', 'investments') || 'End date must be YYYY-MM-DD').superRefine(notInThePast(t('rent_contract.validation.duration_past', 'investments') || 'End date cannot be in the past')),
  rent_contract_industry_id: z.number().optional().nullable(),
}).refine(
  (data) => {
    if (!data.rent_contract_duration || !data.rent_contract_date) return true;
    return data.rent_contract_duration > data.rent_contract_date;
  },
  {
    message: t('rent_contract.validation.duration_after_start', 'investments') || 'End date must be after the contract date',
    path: ['rent_contract_duration'],
  }
);

const dummyT = (() => '') as (key: string, module?: string) => string;
export const RentContractFormSchema = getCreateRentContractFormSchema(dummyT);

export type RentContractFormData = z.infer<typeof RentContractFormSchema>;
