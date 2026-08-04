import { z } from 'zod';

export const getCreateTransactionFormSchema = (t: (key: string, module?: string) => string) =>
  z.object({
    type: z.enum(
      ['addition', 'deduction', 'incoming', 'outgoing'],
      { required_error: t('transaction.validation.type_required', 'finance') || 'Transaction type is required' },
    ),
    value: z.coerce
      .number(t('transaction.validation.value_required', 'finance') || 'Value is required')
      .min(0, t('transaction.validation.value_negative', 'finance') || 'Value cannot be negative')
      .refine((v) => Number.isInteger(v * 100), {
        message: t('transaction.validation.value_decimals', 'finance') || 'Value must have at most 2 decimal places',
      }),
    date: z.string().optional(),
    reason: z
      .string()
      .max(500, t('transaction.validation.reason_max', 'finance') || 'Reason must be at most 500 characters')
      .optional(),
  });

const dummyT = (() => '') as (key: string, module?: string) => string;
export const TransactionFormSchema = getCreateTransactionFormSchema(dummyT);

export type TransactionFormData = z.infer<typeof TransactionFormSchema>;
