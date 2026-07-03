import { z } from 'zod';

export const getCreatePlotFormSchema = (t: (key: string, module?: string) => string) => z.object({
  code: z.string().min(1, t('plots.validation.code_required', 'investments') || 'الرمز مطلوب'),
  area: z.union([
    z.string().min(1, t('plots.validation.area_required', 'investments') || 'المساحة مطلوبة').regex(/^\d+(\.\d+)?$/, t('plots.validation.area_invalid', 'investments') || 'يجب أن تكون المساحة رقماً موجباً صحيحاً'),
    z.number().min(0, t('plots.validation.area_invalid', 'investments') || 'يجب أن تكون المساحة رقماً موجباً صحيحاً')
  ]).transform(v => Number(v)),
  plot_area_id: z.number(t('plots.validation.plot_area_id_invalid', 'investments') || 'يجب أن تكون المنطقة رقماً'),
  plot_classification_id: z.number(t('plots.validation.plot_classification_id_invalid', 'investments') || 'يجب أن يكون التصنيف رقماً'),
  latitude: z.string().min(1, t('plots.validation.latitude_required', 'investments') || 'خط العرض مطلوب'),
  longitude: z.string().min(1, t('plots.validation.longitude_required', 'investments') || 'خط الطول مطلوب'),
  current_condition: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status_date: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const PlotFormSchema = getCreatePlotFormSchema(dummyT);

export type PlotFormData = z.infer<typeof PlotFormSchema>;
