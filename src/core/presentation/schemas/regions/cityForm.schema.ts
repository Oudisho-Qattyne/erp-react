import { z } from 'zod';
import { EntityFormSchema } from '../entityForm.schema copy';

export const CityFormSchema = EntityFormSchema.extend({
  country_id:z.number().min(0)
});

export type CityFormValues = z.infer<typeof CityFormSchema>;