import type { FieldConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';

type Translate = (key: string, module?: string) => string;

const MODULE = 'finance';

const typeOptions = ['incoming', 'outgoing'];

export const buildTransactionFormFields = (t: Translate): FieldConfig[] => [
  {
    name: 'transaction_type',
    label: t('transaction.type', MODULE) || 'Type',
    type: 'select',
    required: true,
    options: typeOptions.map((opt) => ({
      value: opt,
      label: t(`transaction.type_${opt}`, MODULE) || opt,
    })),
  },
  {
    name: 'transaction_value',
    label: t('transaction.value', MODULE) || 'Value',
    type: 'decimal',
    required: true,
    decimalPlaces: 2,
  },
  {
    name: 'transaction_date',
    label: t('transaction.date', MODULE) || 'Date',
    type: 'date',
    required: false,
  },
  {
    name: 'reason',
    label: t('transaction.reason', MODULE) || 'Reason',
    type: 'textarea',
    required: false,
  },
  {
    name: 'transactionable_type',
    label: t('transaction.transactionable_type', MODULE) || 'Transactionable Type',
    type: 'select',
    required: false,
    options: [
      {
        value: 'general',
        label: t('transaction.transactionable_type_general', MODULE) || 'General',
      },
    ],
  },
  {
    name: 'transactionable_id',
    label: t('transaction.transactionable_id', MODULE) || 'Transactionable',
    type: 'table-picker',
    required: false,
  },
];
