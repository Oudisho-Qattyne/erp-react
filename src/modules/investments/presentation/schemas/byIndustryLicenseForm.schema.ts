import { z } from 'zod';

export const getCreateByIndustryLicenseFormSchema = (t: (key: string, module?: string) => string) => z.object({
  name: z.string().min(1, t('by_industry_licenses.validation.name_required', 'investments') || 'Name is required'),
  is_active: z.boolean().optional().default(true),
  is_default: z.boolean().optional().default(false),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const ByIndustryLicenseFormSchema = getCreateByIndustryLicenseFormSchema(dummyT);

export type ByIndustryLicenseFormData = z.infer<typeof ByIndustryLicenseFormSchema>;
