import { z } from 'zod';

export const PlotClassificationFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  is_active: z.boolean().optional().default(true),
  is_default: z.boolean().optional().default(false),
});

export type PlotClassificationFormData = z.infer<typeof PlotClassificationFormSchema>;
