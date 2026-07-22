import { z } from 'zod';

export const getCreateServiceStatusConditionFormSchema = (t: (key: string, module?: string) => string) => z.object({
  name: z.string().min(1, t('service_status_conditions.validation.name_required', 'investments') || 'Name is required'),
  is_active: z.boolean().optional().default(true),
  is_default: z.boolean().optional().default(false),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const ServiceStatusConditionFormSchema = getCreateServiceStatusConditionFormSchema(dummyT);

export type ServiceStatusConditionFormData = z.infer<typeof ServiceStatusConditionFormSchema>;
