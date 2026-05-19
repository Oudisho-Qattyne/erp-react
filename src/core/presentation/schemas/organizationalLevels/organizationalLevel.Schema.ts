import { z } from 'zod';
import { EntityFormSchema } from '../entityForm.schema copy';

export const organizationalLevelFormSchema = EntityFormSchema.extend({
  parent_id_id:z.number().min(0).optional()
});

export type organizationalLevelFormValues = z.infer<typeof organizationalLevelFormSchema>;