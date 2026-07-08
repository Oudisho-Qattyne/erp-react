import { z } from 'zod';

export const getCreateIndustrialLicenseSourceFormSchema = (t: (key: string, module?: string) => string) => z.object({
  name: z.string().min(1, t('industrial_license_sources.validation.name_required', 'investments') || 'الاسم مطلوب'),
  is_default: z.boolean().optional().default(false),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const IndustrialLicenseSourceFormSchema = getCreateIndustrialLicenseSourceFormSchema(dummyT);

export type IndustrialLicenseSourceFormData = z.infer<typeof IndustrialLicenseSourceFormSchema>;
