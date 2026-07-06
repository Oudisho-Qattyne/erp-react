import { z } from 'zod';
import { EntityFormSchema } from '../entityForm.schema';

export const UniversityFormSchema = EntityFormSchema.extend({

});

export type UniversityFormValues = z.infer<typeof UniversityFormSchema>;