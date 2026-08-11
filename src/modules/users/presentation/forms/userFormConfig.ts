import type { FieldConfig, GroupConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import type { Role } from '../../domain/entities/role';

type Translate = (key: string, module?: string) => string;

const buildRoleOptions = (roles: Role[]) => roles.map((r) => ({ value: r.name, label: r.display_name }));

export const buildCreateUserFormFields = (t: Translate, roles: Role[]): FieldConfig[] => [
  { name: 'name', label: t('users.name', 'users') || 'Name', type: 'alpha', required: true, group: 'account' },
  { name: 'email', label: t('users.email', 'users') || 'Email', type: 'text', required: true, group: 'account' },
  { name: 'mobile', label: t('users.mobile', 'users') || 'Mobile', type: 'numeric', required: true, group: 'account' },
  { name: 'role', label: t('users.role', 'users') || 'Role', type: 'select', required: true, group: 'security', options: buildRoleOptions(roles) },
  { name: 'password', label: t('users.password', 'users') || 'Password', type: 'password', required: true, group: 'security' },
  { name: 'confirmPassword', label: t('users.confirm_password', 'users') || 'Confirm Password', type: 'password', required: true, group: 'security' },
];

export const buildEditUserFormFields = (t: Translate, roles: Role[]): FieldConfig[] => [
  { name: 'name', label: t('users.name', 'users') || 'Name', type: 'alpha', required: true },
  { name: 'email', label: t('users.email', 'users') || 'Email', type: 'text', required: true },
  { name: 'mobile', label: t('users.mobile', 'users') || 'Mobile', type: 'numeric', required: true },
  { name: 'role', label: t('users.role', 'users') || 'Role', type: 'select', required: true, options: buildRoleOptions(roles) },
];

export const buildUserFormGroups = (t: Translate): GroupConfig[] => [
  {
    group: 'account',
    title: t('users.group_account', 'users') || 'Account Information',
    columns: 3,
    rows: [['name', 'email', 'mobile']],
  },
  {
    group: 'security',
    title: t('users.group_security', 'users') || 'Security',
    columns: 2,
    rows: [['role', 'password'], ['confirmPassword']],
  },
];