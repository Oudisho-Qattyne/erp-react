import type { FieldConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import type { Currency } from '../../domain/entities/Currency';

type Translate = (key: string, module?: string) => string;

export const buildCreateCurrencyFormFields = (t: Translate): FieldConfig[] => [
  { name: 'name', label: t('currency.name', 'finance') || 'Name', type: 'text', required: true },
  { name: 'code', label: t('currency.code', 'finance') || 'Code', type: 'text', required: true },
  { name: 'symbol', label: t('currency.symbol', 'finance') || 'Symbol', type: 'text' },
  {
    name: 'decimal_places',
    label: t('currency.decimal_places', 'finance') || 'Decimal Places',
    type: 'number',
  },
  { name: 'is_active', type: 'checkbox', label: t('common.is_active', 'shared') || 'Active' },
];

export const buildUpdateCurrencyFormFields = (t: Translate): FieldConfig[] =>
  buildCreateCurrencyFormFields(t);

export const buildCurrencyDefaultValues = (currency: Currency): Record<string, string | number | boolean | null | undefined> => ({
  name: typeof currency.name === 'string' ? currency.name : currency.name?.en || '',
  code: currency.code,
  symbol: currency.symbol ?? '',
  decimal_places: currency.decimal_places ?? '',
  is_active: currency.is_active ?? true,
});
