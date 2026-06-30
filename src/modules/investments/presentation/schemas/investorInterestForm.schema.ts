import { z } from 'zod';

export const investorInterestFormSchema = z.object({
  plot_area_ids: z.array(z.coerce.number()).nullable().optional(),
  plot_classification_ids: z.array(z.coerce.number()).nullable().optional(),
  min_area: z.coerce.number().min(0).nullable().optional(),
  max_area: z.coerce.number().min(0).nullable().optional(),
  notes: z.string().nullable().optional(),
}).refine((data) => {
  if (data.min_area != null && data.max_area != null && data.max_area < data.min_area) {
    return false;
  }
  return true;
}, {
  message: "Max area cannot be less than Min area",
  path: ["max_area"]
});

export type InvestorInterestFormData = z.infer<typeof investorInterestFormSchema>;
