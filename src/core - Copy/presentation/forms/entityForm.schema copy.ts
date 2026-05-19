import { z } from 'zod';

export const EntityFormSchema = z.object({
  name: z.object({
    ar: z.string().min(1, 'يجب ان يكون اكثر من محرف'),
  }),
});

export type EntityFormValues = z.infer<typeof EntityFormSchema>;