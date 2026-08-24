import { z } from 'zod';

const emptyToUndefined = (v: unknown) =>
  v === '' || v === null || v === undefined ? undefined : v;

export const getCreateExchangeRateFormSchema = (t: (key: string, module: string) => string) =>
  z.object({
    from_currency_code: z
      .string()
      .min(1, t('exchange_rate.validation.from_currency_code_required', 'finance') || 'Source currency code is required')
      .max(10, t('exchange_rate.validation.from_currency_code_max', 'finance') || 'Code must be at most 10 characters'),
    to_currency_code: z
      .string()
      .min(1, t('exchange_rate.validation.to_currency_code_required', 'finance') || 'Target currency code is required')
      .max(10, t('exchange_rate.validation.to_currency_code_max', 'finance') || 'Code must be at most 10 characters'),
    rate: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number(t('exchange_rate.validation.rate_invalid', 'finance') || 'Rate must be a number')
        .positive(t('exchange_rate.validation.rate_positive', 'finance') || 'Rate must be positive'),
    ),
    effective_date: z
      .string()
      .min(1, t('exchange_rate.validation.effective_date_required', 'finance') || 'Effective date is required'),
  });
