import { z } from 'zod';

export const getCreateTransactionFormSchema = (t: (key: string, module?: string) => string) =>
  z
    .object({
      transaction_type: z.enum(
        ['incoming', 'outgoing'],
        t('transaction.validation.type_required', 'finance') || 'Transaction type is required' 
      ),
      transaction_value: z.coerce
        .number(t('transaction.validation.value_required', 'finance') || 'Value is required')
        .min(0, t('transaction.validation.value_negative', 'finance') || 'Value cannot be negative')
        .refine((v) => Number.isInteger(v * 100), {
          message: t('transaction.validation.value_decimals', 'finance') || 'Value must have at most 2 decimal places',
        }),
      transaction_date: z.string().optional(),
      reason: z
        .string()
        .max(500, t('transaction.validation.reason_max', 'finance') || 'Reason must be at most 500 characters')
        .optional(),
      transactionable_type: z.enum(['general']).optional(),
      transactionable_id: z.coerce.number().optional(),
    })
    .superRefine((data, ctx) => {
      // If transactionable_type is set and is not "general", transactionable_id is required
      if (
        data.transactionable_type &&
        data.transactionable_type !== 'general' &&
        data.transactionable_id == null
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['transactionable_id'],
          message:
            t('transaction.validation.transactionable_id_required', 'finance') ||
            'Please select a transactionable item',
        });
      }
    });

const dummyT = (() => '') as (key: string, module?: string) => string;
export const TransactionFormSchema = getCreateTransactionFormSchema(dummyT);

export type TransactionFormData = z.infer<typeof TransactionFormSchema>;
