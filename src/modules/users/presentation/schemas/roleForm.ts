import { z } from 'zod';

export const getCreateRoleSchema = (t: (key: string, module?: string) => string) => {
  return z.object({
    name: z.string().min(1, t('role_form.validation.name_required', 'users') || 'Role name is required'),
    display_name: z.string().min(1, t('role_form.validation.display_name_required', 'users') || 'Display name is required'),
    permissions: z.array(z.number()).min(1, t('role_form.validation.permissions_required', 'users') || 'At least one permission is required'),
  });
};

const dummySchema = getCreateRoleSchema(() => '');
export type RoleFormValues = z.infer<typeof dummySchema>;
