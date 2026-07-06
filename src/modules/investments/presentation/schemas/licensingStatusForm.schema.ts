import { z } from 'zod';

export const getCreateLicensingStatusFormSchema = (t: (key: string, module?: string) => string) => z.object({
  name: z.string().min(1, t('licensing_statuses.validation.name_required', 'investments') || 'الاسم مطلوب'),
  is_active: z.boolean().optional().default(true),
  is_default: z.boolean().optional().default(false),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const LicensingStatusFormSchema = getCreateLicensingStatusFormSchema(dummyT);

export type LicensingStatusFormData = z.infer<typeof LicensingStatusFormSchema>;
