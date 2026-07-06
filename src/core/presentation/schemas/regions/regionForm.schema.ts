import { z } from 'zod';
import { EntityFormSchema } from '../entityForm.schema';

export const RegionFormSchema = EntityFormSchema.extend({
  city_id:z.number().min(0)
});

export type  RegionFormValues = z.infer<typeof RegionFormSchema>;