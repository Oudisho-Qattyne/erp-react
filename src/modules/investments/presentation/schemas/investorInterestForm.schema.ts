import { z } from 'zod';

export const getCreateInvestorInterestFormSchema = (t: (key: string, module?: string) => string) => z.object({
  plot_area_ids: z.array(z.coerce.number()).nullable().optional(),
  plot_classification_ids: z.array(z.coerce.number()).nullable().optional(),
  min_area: z.coerce.number().min(0).nullable().optional(),
  max_area: z.coerce.number().min(0).nullable().optional(),
  notes: z.string().or(z.literal('')).nullable().optional(),
}).refine((data) => {
  if (data.min_area != null && data.max_area != null && data.max_area < data.min_area) {
    return false;
  }
  return true;
}, {
  message: t('investors.validation.max_area_min', 'investments') || "الحد الأقصى للمساحة لا يمكن أن يكون أقل من الحد الأدنى",
  path: ["max_area"]
});

const dummyT = (() => '') as (key: string, module?: string) => string;
export const investorInterestFormSchema = getCreateInvestorInterestFormSchema(dummyT);

export type InvestorInterestFormData = z.infer<typeof investorInterestFormSchema>;
