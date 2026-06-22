import { z } from 'zod';

export const EntityFormSchema = z.object({
  name: z.string().min(1, 'يجب ان يكون اكثر من محرف'),
  is_default: z.boolean().default(false)
});

export type EntityFormValues = z.infer<typeof EntityFormSchema>;