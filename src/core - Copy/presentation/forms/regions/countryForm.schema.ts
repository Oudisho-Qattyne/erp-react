import { z } from 'zod';
import { EntityFormSchema } from '../entityForm.schema copy';

export const CountryFormSchema = EntityFormSchema.extend({

});

export type CountryFormValues = z.infer<typeof CountryFormSchema>;