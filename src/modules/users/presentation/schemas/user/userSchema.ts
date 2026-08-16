import { z } from 'zod';

export const getCreateUserSchema = (t: (key: string, module?: string) => string) =>
  z.object({
    name: z.string().min(1, t('user_form.validation.name_required', 'users') || 'Name is required'),
    email: z.string().email(t('user_form.validation.email_invalid', 'users') || 'Invalid email address'),
    mobile: z.string().min(1, t('user_form.validation.mobile_required', 'users') || 'Mobile is required'),
    password: z.string().min(6, t('user_form.validation.password_min', 'users') || 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, t('user_form.validation.confirm_password_required', 'users') || 'Please confirm your password'),
    role: z.string( t('user_form.validation.role_required', 'users') || 'Role is required' ),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('user_form.validation.passwords_mismatch', 'users') || 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type UserCreateFormValues = z.infer<ReturnType<typeof getCreateUserSchema>>;

export const getChangePasswordSchema = (t: (key: string, module?: string) => string) =>
  z.object({
    password: z.string().min(6, t('user_form.validation.password_min', 'users') || 'Password must be at least 6 characters'),
    password_confirmation: z.string().min(1, t('user_form.validation.confirm_password_required', 'users') || 'Please confirm your password'),
  }).refine((data) => data.password === data.password_confirmation, {
    message: t('user_form.validation.passwords_mismatch', 'users') || 'Passwords do not match',
    path: ['password_confirmation'],
  });

  export type ChangePasswordFormValues = z.infer<ReturnType<typeof getChangePasswordSchema>>;


export const getUpdateUserSchema = (t: (key: string, module?: string) => string) =>
  z.object({
    name: z.string().min(1, t('user_form.validation.name_required', 'users') || 'Name is required'),
    email: z.string().email(t('user_form.validation.email_invalid', 'users') || 'Invalid email address'),
    mobile: z.string().min(1, t('user_form.validation.mobile_required', 'users') || 'Mobile is required'),
    // status: z.string().min(1, t('user_form.validation.status_required', 'users') || 'Status is required'),
    role: z.string(t('user_form.validation.role_required', 'users') || 'Role is required' ),
  });

export type UserUpdateFormValues = z.infer<ReturnType<typeof getUpdateUserSchema>>;