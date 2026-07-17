import { string, z } from 'zod';

const ServiceConditions = z.object({
  id:z.number(),
  note:z.string()
})

export const getCreatePlotFormSchema = (t: (key: string, module?: string) => string) => z.object({
  code: z.string().min(1, t('plots.validation.code_required', 'investments') || 'الرمز مطلوب'),
  identifier: z.string().min(1, t('plots.validation.identifier_required', 'investments') || 'ID مطلوب'),
  area: z.union([
    z.string().min(1, t('plots.validation.area_required', 'investments') || 'المساحة مطلوبة').regex(/^\d+(\.\d+)?$/, t('plots.validation.area_invalid', 'investments') || 'يجب أن تكون المساحة رقماً موجباً صحيحاً'),
    z.number().min(0, t('plots.validation.area_invalid', 'investments') || 'يجب أن تكون المساحة رقماً موجباً صحيحاً')
  ]).transform(v => Number(v)),
  plot_area_id: z.number(t('plots.validation.plot_area_id_invalid', 'investments') || 'يجب أن تكون المنطقة رقماً'),
  plot_classification_id: z.number(t('plots.validation.plot_classification_id_invalid', 'investments') || 'يجب أن يكون التصنيف رقماً'),
  latitude: z.string().min(1, t('plots.validation.latitude_required', 'investments') || 'خط العرض مطلوب'),
  longitude: z.string().min(1, t('plots.validation.longitude_required', 'investments') || 'خط الطول مطلوب'),
  // service_conditions: z.array(z.coerce.number()).nullable().optional(),
  service_conditions : z.array(z.object({note : z.string() , id : z.number()})),
  // notes: z.string().or(z.literal('')).optional().nullable(),
  status_date: z.string().or(z.literal('')).optional().nullable(),
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const PlotFormSchema = getCreatePlotFormSchema(dummyT);

export type PlotFormData = z.infer<typeof PlotFormSchema>;
