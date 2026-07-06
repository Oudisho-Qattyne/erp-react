import { z } from 'zod';
import { EntityFormSchema } from '../../../../../core/presentation/schemas/entityForm.schema';

export const ChronicDiseasesFormSchema = EntityFormSchema.extend({

});

export type ChronicDiseasesFormValues = z.infer<typeof ChronicDiseasesFormSchema>;
