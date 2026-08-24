import type { FieldConfig, GroupConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import type { Currency } from '../../domain/entities/Currency';
import { buildCurrencyPickerField } from '../components/CurrencyPickerDialog';

type Translate = (key: string, module?: string) => string;

export interface ExchangeRateFormDeps {
  currencies: Currency[];
}

export const buildExchangeRateFormFields = (t: Translate, deps: ExchangeRateFormDeps): FieldConfig[] => [
  buildCurrencyPickerField(
    'from_currency_code',
    t('exchange_rate.from_currency_code', 'finance') || 'From Currency',
    t,
    deps.currencies,
  ),
  buildCurrencyPickerField(
    'to_currency_code',
    t('exchange_rate.to_currency_code', 'finance') || 'To Currency',
    t,
    deps.currencies,
    true,
  ),
  { name: 'rate', label: t('exchange_rate.rate', 'finance') || 'Rate', type: 'number', required: true, group: 'details' },
  { name: 'effective_date', label: t('exchange_rate.effective_date', 'finance') || 'Effective Date', type: 'date', required: true, group: 'details' },
];

export const buildExchangeRateFormGroups = (t: Translate): GroupConfig[] => [
  {
    group: 'details',
    title: t('exchange_rate.details', 'finance') || 'Details',
    columns: 2,
    rows: [['from_currency_code', 'to_currency_code'], ['rate', 'effective_date']],
  },
];
