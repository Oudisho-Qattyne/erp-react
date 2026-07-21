import { z } from 'zod';

export const getCreateRentContractIndustryFormSchema = (t: (key: string, module?: string) => string) => z.object({
  name: z.string().min(1, t('rent_contract_industries.validation.name_required', 'investments') || 'Name is required'),
  is_active: z.boolean().optional().default(true),
  is_default: z.boolean().optional().default(false),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const RentContractIndustryFormSchema = getCreateRentContractIndustryFormSchema(dummyT);

export type RentContractIndustryFormData = z.infer<typeof RentContractIndustryFormSchema>;
