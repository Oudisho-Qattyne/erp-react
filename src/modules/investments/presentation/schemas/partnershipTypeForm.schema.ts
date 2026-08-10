import { z } from 'zod';

export const getCreatePartnershipTypeFormSchema = (t: (key: string, module?: string) => string) => z.object({
  name: z.string().min(1, t('partnership_types.validation.name_required', 'investments') || 'الاسم مطلوب'),
  is_active: z.boolean().optional().default(true),
  is_default: z.boolean().optional().default(false),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const PartnershipTypeFormSchema = getCreatePartnershipTypeFormSchema(dummyT);

export type PartnershipTypeFormData = z.infer<typeof PartnershipTypeFormSchema>;
