import { z } from 'zod';
import { EntityFormSchema } from '../../../../../core/presentation/schemas/entityForm.schema copy';

export const JobStatusFormSchema = EntityFormSchema.extend({

});

export type JobStatusFormValues = z.infer<typeof JobStatusFormSchema>;