import { z } from 'zod';

export const getCreateServiceConditionFormSchema = (t: (key: string, module?: string) => string) => z.object({
  name: z.string().min(1, t('service_conditions.validation.name_required', 'investments') || 'Name is required'),
  is_active: z.boolean().optional().default(true),
  is_default: z.boolean().optional().default(false),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const ServiceConditionFormSchema = getCreateServiceConditionFormSchema(dummyT);

export type ServiceConditionFormData = z.infer<typeof ServiceConditionFormSchema>;
