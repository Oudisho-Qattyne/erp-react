import { z } from 'zod';

export const getCreateConsumptionMaterialFormSchema = (t: (key: string, module?: string) => string) => z.object({
  name: z.string().min(1, t('consumption_materials.validation.name_required', 'investments') || 'Name is required'),
  unit: z.string().min(1, t('consumption_materials.validation.unit_required', 'investments') || 'Unit is required'),
  is_active: z.boolean().optional().default(true),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const ConsumptionMaterialFormSchema = getCreateConsumptionMaterialFormSchema(dummyT);

export type ConsumptionMaterialFormData = z.infer<typeof ConsumptionMaterialFormSchema>;