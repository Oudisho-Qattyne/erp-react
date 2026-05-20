import { z } from 'zod';
import { EntityFormSchema } from '../entityForm.schema copy';

export const FacultyFormSchema = EntityFormSchema.extend({
  university_id:z.number().min(0)
});

export type FacultyFormValues = z.infer<typeof FacultyFormSchema>;