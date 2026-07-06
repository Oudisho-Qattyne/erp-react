import { z } from 'zod';

export const getCreateIndustryTypeFormSchema = (t: (key: string, module?: string) => string) => z.object({
  name: z.string().min(1, t('industry_types.validation.name_required', 'investments') || 'الاسم مطلوب'),
  is_active: z.boolean().optional().default(true),
  is_default: z.boolean().optional().default(false),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const IndustryTypeFormSchema = getCreateIndustryTypeFormSchema(dummyT);

export type IndustryTypeFormData = z.infer<typeof IndustryTypeFormSchema>;
