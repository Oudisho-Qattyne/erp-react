import { z } from 'zod';

export const PlotFormSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  area: z.union([
    z.string().min(1, 'Area is required').regex(/^\d+(\.\d+)?$/, 'Area must be a valid positive number'),
    z.number().min(0, 'Area must be a valid positive number')
  ]).transform(v => Number(v)),
  plot_area_id: z.number({ required_error: 'Plot Area is required', invalid_type_error: 'Plot Area must be a number' }),
  plot_classification_id: z.number({ required_error: 'Plot Classification is required', invalid_type_error: 'Plot Classification must be a number' }),
  latitude: z.string().min(1, 'Latitude is required'),
  longitude: z.string().min(1, 'Longitude is required'),
  current_condition: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status_date: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
});
