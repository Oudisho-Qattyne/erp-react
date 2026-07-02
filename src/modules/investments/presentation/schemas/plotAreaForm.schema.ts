import { z } from 'zod';

export const getCreatePlotAreaFormSchema = (t: (key: string, module?: string) => string) => z.object({
  name: z.string().min(1, t('plot_areas.validation.name_required', 'investments') || 'الاسم مطلوب'),
  is_active: z.boolean().optional().default(true),
  is_default: z.boolean().optional().default(false),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const PlotAreaFormSchema = getCreatePlotAreaFormSchema(dummyT);

export type PlotAreaFormData = z.infer<typeof PlotAreaFormSchema>;
