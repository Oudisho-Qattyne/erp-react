import { z } from 'zod';

export const getCreatePlotClassificationFormSchema = (t: (key: string, module?: string) => string) => z.object({
  name: z.string().min(1, t('plot_classifications.validation.name_required', 'investments') || 'الاسم مطلوب'),
  is_active: z.boolean().optional().default(true),
  is_default: z.boolean().optional().default(false),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const PlotClassificationFormSchema = getCreatePlotClassificationFormSchema(dummyT);

export type PlotClassificationFormData = z.infer<typeof PlotClassificationFormSchema>;
