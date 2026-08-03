import { z } from 'zod';

export const getCreateFeeFormSchema = (t: (key: string, module?: string) => string) =>
  z.object({
    name: z
      .string()
      .min(3, t('fee.validation.name_min', 'finance') || 'Name must be at least 3 letters')
      .max(255, t('fee.validation.name_max', 'finance') || 'Name must be at most 255 letters')
      .regex(/^\p{L}+$/u, t('fee.validation.name_invalid', 'finance') || 'Name must contain letters only'),
    code: z
      .string()
      .regex(
        /^[\p{L}\d]+$/u,
        t('fee.validation.code_invalid', 'finance') || 'Code must contain letters and digits only, without spaces',
      ),
    fee_value: z.coerce
      .number(t('fee.validation.fee_value_required', 'finance') || 'Fee value is required')
      .min(0, t('fee.validation.fee_value_negative', 'finance') || 'Fee value cannot be negative')
      .refine((v) => Number.isInteger(v * 100), {
        message: t('fee.validation.fee_value_decimals', 'finance') || 'Fee value must have at most 2 decimal places',
      }),
    fee_status: z.enum(['active', 'archived']).default('active'),
  });

const dummyT = (() => '') as (key: string, module?: string) => string;
export const FeeFormSchema = getCreateFeeFormSchema(dummyT);

export type FeeFormData = z.infer<typeof FeeFormSchema>;

// Only name and fee_status can be updated; code and fee_value are immutable
export const getUpdateFeeFormSchema = (t: (key: string, module?: string) => string) =>
  z.object({
    name: z
      .string()
      .min(3, t('fee.validation.name_min', 'finance') || 'Name must be at least 3 letters')
      .max(255, t('fee.validation.name_max', 'finance') || 'Name must be at most 255 letters')
      .regex(/^\p{L}+$/u, t('fee.validation.name_invalid', 'finance') || 'Name must contain letters only'),
    fee_status: z.enum(['active', 'archived']),
  });

export const FeeUpdateFormSchema = getUpdateFeeFormSchema(dummyT);

export type FeeUpdateFormData = z.infer<typeof FeeUpdateFormSchema>;
