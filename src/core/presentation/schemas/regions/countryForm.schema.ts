import { z } from 'zod';
import { EntityFormSchema } from '../entityForm.schema';

export const CountryFormSchema = EntityFormSchema.extend({

});

export type CountryFormValues = z.infer<typeof CountryFormSchema>;