import { z } from 'zod';

export const getCreateIndustrialDecisionTypeFormSchema = (t: (key: string, module?: string) => string) => z.object({
  name: z.string().min(1, t('industrial_decision_types.validation.name_required', 'investments') || 'الاسم مطلوب'),
  is_default: z.boolean().optional().default(false),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const IndustrialDecisionTypeFormSchema = getCreateIndustrialDecisionTypeFormSchema(dummyT);

export type IndustrialDecisionTypeFormData = z.infer<typeof IndustrialDecisionTypeFormSchema>;
