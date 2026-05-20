import { z } from 'zod';
import { EntityFormSchema } from '../entityForm.schema copy';

export const RegionFormSchema = EntityFormSchema.extend({
  city_id:z.number().min(0)
});

export type  RegionFormValues = z.infer<typeof RegionFormSchema>;