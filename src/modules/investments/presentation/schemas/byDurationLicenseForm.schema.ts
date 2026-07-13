import { z } from 'zod';

export const getCreateByDurationLicenseFormSchema = (t: (key: string, module?: string) => string) => z.object({
  name: z.string().min(1, t('by_duration_licenses.validation.name_required', 'investments') || 'Name is required'),
  is_active: z.boolean().optional().default(true),
  is_default: z.boolean().optional().default(false),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const ByDurationLicenseFormSchema = getCreateByDurationLicenseFormSchema(dummyT);

export type ByDurationLicenseFormData = z.infer<typeof ByDurationLicenseFormSchema>;
