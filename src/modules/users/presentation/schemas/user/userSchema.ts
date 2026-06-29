import { z } from 'zod';
import { EntityFormSchema } from '../../../../../core/presentation/schemas/entityForm.schema copy';

export const UserUpdateFormSchema =z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().nullable(),               // nullable to match User entity
  status: z.string().min(1, 'Status is required'), // or z.enum(['active','inactive']) if you know the exact values
  role_id: z.number('Role is required')
});

export type UserUpdateFormValues = z.infer<typeof UserUpdateFormSchema>;