import { z } from 'zod';

const emptyToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v);

export const getCreateCurrencyFormSchema = (t: (key: string, module?: string) => string) =>
  z.object({
    name: z
      .string()
      .min(3, t('currency.validation.name_min', 'finance') || 'Name must be at least 3 letters')
      .max(255, t('currency.validation.name_max', 'finance') || 'Name must be at most 255 letters'),
    code: z
      .string()
      .min(1, t('currency.validation.code_required', 'finance') || 'Code is required')
      .max(10, t('currency.validation.code_max', 'finance') || 'Code must be at most 10 characters'),
    symbol: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .max(10, t('currency.validation.symbol_max', 'finance') || 'Symbol must be at most 10 characters')
        .optional(),
    ),
    decimal_places: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number(t('currency.validation.decimal_places_invalid', 'finance') || 'Decimal places must be a number')
        .int(t('currency.validation.decimal_places_invalid', 'finance') || 'Decimal places must be a number')
        .min(0, t('currency.validation.decimal_places_min', 'finance') || 'Decimal places cannot be negative')
        .max(8, t('currency.validation.decimal_places_max', 'finance') || 'Decimal places must be at most 8')
        .optional(),
    ),
    is_active: z.boolean().optional().default(true),
  });

const dummyT = (() => '') as (key: string, module?: string) => string;
export const CurrencyFormSchema = getCreateCurrencyFormSchema(dummyT);

export type CurrencyFormData = z.infer<typeof CurrencyFormSchema>;

export const getUpdateCurrencyFormSchema = getCreateCurrencyFormSchema;

export const CurrencyUpdateFormSchema = CurrencyFormSchema;

export type CurrencyUpdateFormData = CurrencyFormData;
