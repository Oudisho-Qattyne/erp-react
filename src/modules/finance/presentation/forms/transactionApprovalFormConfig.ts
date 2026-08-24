import type { FieldConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import type { Currency } from '../../domain/entities/Currency';
import type { CurrencyConversionRequest, CurrencyConversionResult } from '../../application/dtos/currencyDtos';
import { z } from 'zod';
import { buildCurrencyPickerField } from '../components/CurrencyPickerDialog';

type Translate = (key: string, module?: string) => string;

const MODULE = 'finance';

export interface ApproveTransactionFormDeps {
  currencies: Currency[];
  convertCurrency: (data: CurrencyConversionRequest) => Promise<CurrencyConversionResult>;
  transactionValue: number;
}

export const getApproveTransactionSchema = () =>
  z.object({
    transaction_currency_id: z.string().min(1, 'required'),
    client_payed_amount: z.coerce.number().refine((v) => v > 0, 'required'),
  });

export const buildApproveTransactionFields = (
  t: Translate,
  deps: ApproveTransactionFormDeps,
): FieldConfig[] => [
  buildCurrencyPickerField(
    'transaction_currency_id',
    t('transaction.payment_currency', MODULE) || 'عملة الدفع',
    t,
    deps.currencies,
  ),
  {
    name: 'client_payed_amount',
    label: t('transaction.paid_amount', MODULE) || 'المبلغ المدفوع',
    type: 'number',
    required: true,
    disabled:true,
    dependsOn: ['transaction_currency_id'],
    compute: async (values) => {
      const code = values.transaction_currency_id;
      if (!code) return { value: '' };
      try {
        const res = await deps.convertCurrency({
          action: 'from_base',
          currency_code: code,
          amount: deps.transactionValue,
        });
        return { value: res.result };
      } catch {
        return { value: '' };
      }
    },
  },
];
