import { z } from 'zod';
import { EntityFormSchema } from '../entityForm.schema';

export const SpecializationFormSchema = EntityFormSchema.extend({
  Faculty_id:z.number().min(0)
});

export type SpecializationFormValues = z.infer<typeof SpecializationFormSchema>;