import { z } from 'zod';
import { EntityFormSchema } from '../entityForm.schema copy';

export const organizationalLevelFormSchema = EntityFormSchema.extend({
  parent_id: z.number().min(0).default(0)
});

export type organizationalLevelFormValues = z.infer<typeof organizationalLevelFormSchema>;