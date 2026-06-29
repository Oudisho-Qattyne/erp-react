import { z } from 'zod';
import { EntityFormSchema } from '../entityForm.schema copy';

export const organizationalLevelFormSchema = EntityFormSchema.extend({
  parent_id: z.number().min(0).nullable().optional()
});

export type organizationalLevelFormValues = z.infer<typeof organizationalLevelFormSchema>;