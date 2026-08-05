'use client';

import { useState, useMemo } from 'react';
import { z } from 'zod';

import { useAuth } from '../hooks/useAuth';

import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { useDynamicForm } from '../../../../core/presentation/hooks/useDynamicForm221';
import { FormInput } from '../../../../core/presentation/layouts/ui/inputs/FormInput';
import { FormProvider } from 'react-hook-form';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { useAuth as useAuthProvider } from '../../../../core/infrastructure/auth/AuthProvider';
import { applyServerValidationErrors } from '../../../../core/presentation/utils/handleApiError';

// Validation schema helper
const getLoginSchema = (t: (key: string, mod?: string) => string) => z.object({
  email: z.string().email(t('login.email_invalid', 'auth')).min(1, t('login.email_required', 'auth')),
  password: z.string().min(1, t('login.password_required', 'auth')),
});

type LoginFormData = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading: isLoginLoading, error: authError } = useAuth();
  const {login : loginLocal} = useAuthProvider()
  const { t } = useLanguage();

  const loginSchema = useMemo(() => getLoginSchema(t), [t]);

  const { fieldProps, handleSubmit, isValid, isSubmitting, form } = useDynamicForm<LoginFormData>({
    schema: loginSchema as any,
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await login(data as any);
      // Redirect to home or dashboard after successful login
      loginLocal(res.data.token , res.data.user)
      navigate('/hr');
    } catch (err: any) {
      applyServerValidationErrors(err, form.setError);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-dark via-primary to-primary-dark relative">
      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-[repeating-conic-gradient(#fff_0%_25%,transparent_0%_50%)] bg-size-[40px_40px] pointer-events-none" />

      <div className="bg-card rounded-2xl p-10 w-100 shadow-2xl border-t-4 border-gold relative z-10 animate-slide-up shadow-gold/20">
        <div className="text-center mb-8">
          {/* Eagle emblem */}
          <div className="w-16 h-16 rounded-xl mx-auto mb-4 bg-linear-to-br from-gold to-gold-dark flex items-center justify-center text-3xl font-black text-primary-dark shadow-lg shadow-gold/30">
            <Shield size={32} fill="currentColor" />
          </div>
          <h1 className="text-xl font-extrabold text-text ">{t('login.title', 'auth')}</h1>
          <p className="text-sm text-text-muted mt-1">{t('login.subtitle', 'auth')}</p>
          <p className="text-xs text-text-light mt-1">{t('login.governorate', 'auth')}</p>
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg text-center">
            {t('login.failed_message', 'auth')}
          </div>
        )}
        <FormProvider {...form}>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormInput
              {...fieldProps('email')}
              type="email"
              label={t('login.email', 'auth')}
              placeholder="admin@example.com"
            />
            <FormInput
              {...fieldProps('password')}
              type="password"
              label={t('login.password', 'auth')}
              placeholder="••••••••"
            />

            <Button
              type="submit"
              variant="gold"
              fullWidth
              size="lg"
              isLoading={isSubmitting || isLoginLoading}
              disabled={!isValid}
            >
              {t('login.submit', 'auth')}
            </Button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
