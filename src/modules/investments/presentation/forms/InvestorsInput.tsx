import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { useFormState } from 'react-hook-form';
import { DataMatrixInput, type MatrixFieldConfig } from '../../../../core/presentation/layouts/ui/inputs/DataMatrixInput';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../core/presentation/hooks/data/useEntity';
import type { Investor } from '../../domain/entities/investor';
import { getInvestorRowSchema } from '../schemas/investorForm.schema';
import {
  emptyInvestorRow,
  investorsPayloadToRows,
  investorsRowsToPayload,
  INVESTOR_DATA_FIELDS,
  toRowFieldValue,
} from './investors';
import type { SubscriptionInvestorPayload } from '../../domain/repositories/ISubscriptionRepository';

interface InvestorsFieldProps {
  methods: UseFormReturn<FieldValues>;
}

const MATRIX_FIELD_NAMES: string[] = ['id', ...INVESTOR_DATA_FIELDS];

export function InvestorsField({ methods }: InvestorsFieldProps) {
  const { t } = useLanguage();
  const { setValue, getValues, formState } = methods;
  const { getAll: searchInvestors } = useEntityCrud<Investor>('/investments/investors', '/investments/investors');

  const fillFromInvestor = (item: Record<string, unknown>): Record<string, unknown> => {
    const fill: Record<string, unknown> = {};
    for (const field of INVESTOR_DATA_FIELDS) {
      const value = toRowFieldValue(field, item[field]);
      fill[field] = value;
      fill[`__original_${field}`] = value;
    }
    fill.id = (item.id as number | null | undefined) ?? null;
    return fill;
  };

  const [rows, setRows] = useState<Record<string, unknown>[]>(() =>
    investorsPayloadToRows((getValues('investors') as SubscriptionInvestorPayload[] | undefined) ?? undefined)
  );

  const { errors } = useFormState({ name: 'investors' as const });

  const prevSubmitSuccessfulRef = useRef(false);
  const { isSubmitSuccessful } = formState;
  useEffect(() => {
    if (isSubmitSuccessful && !prevSubmitSuccessfulRef.current) {
      setRows([emptyInvestorRow()]);
    }
    prevSubmitSuccessfulRef.current = isSubmitSuccessful;
  }, [isSubmitSuccessful]);

  useEffect(() => {
    setValue('investors', investorsRowsToPayload(rows), { shouldValidate: true });
  }, [rows, setValue]);

  const searchInvestorsApi = useCallback(
    async (query: string): Promise<Record<string, unknown>[]> => {
      if (!query.trim()) return [];
      const response = await searchInvestors(
        `/investments/investors?search=${encodeURIComponent(query.trim())}&per_page=10`
      );
      return (response.data ?? []).map((inv) => ({ ...inv }));
    },
    [searchInvestors]
  );

  const makeHints = useCallback(
    (fieldName: string): MatrixFieldConfig['hints'] => ({
      searchApi: searchInvestorsApi,
      minChars: 2,
      debounceMs: 300,
      displayValue: (item: Record<string, unknown>) => String(item[fieldName] ?? ''),
      fill: fillFromInvestor,
    }),
    [searchInvestorsApi]
  );

  const matrixFields = useMemo<MatrixFieldConfig[]>(
    () => [
      { name: 'id', label: 'ID', type: 'numeric', disabled: true, defaultValue: null },
      {
        name: 'first_name',
        type: 'alpha',
        label: t('investors.first_name', 'investments') || 'First Name',
        required: true,
        hints: makeHints('first_name'),
      },
      {
        name: 'father_name',
        type: 'alpha',
        label: t('investors.father_name', 'investments') || 'Father Name',
        required: true,
        hints: makeHints('father_name'),
      },
      {
        name: 'grandfather_name',
        type: 'alpha',
        label: t('investors.grandfather_name', 'investments') || 'Grandfather Name',
        hints: makeHints('grandfather_name'),
      },
      {
        name: 'last_name',
        type: 'alpha',
        label: t('investors.last_name', 'investments') || 'Last Name',
        required: true,
        hints: makeHints('last_name'),
      },
      {
        name: 'mother_name',
        type: 'alpha',
        label: t('investors.mother_name', 'investments') || 'Mother Name',
        required: true,
        hints: makeHints('mother_name'),
      },
      {
        name: 'national_id',
        type: 'numeric',
        label: t('investors.national_id', 'investments') || 'National ID',
        hints: makeHints('national_id'),
      },
      {
        name: 'passport_number',
        type: 'numeric',
        label: t('investors.passport_number', 'investments') || 'Passport Number',
        hints: makeHints('passport_number'),
      },
      {
        name: 'nationality',
        type: 'alpha',
        label: t('investors.nationality', 'investments') || 'Nationality',
        required: true,
        hints: makeHints('nationality'),
      },
      {
        name: 'gender',
        type: 'select',
        label: t('investors.gender', 'investments') || 'Gender',
        required: true,
        defaultValue: null,
        options: [
          { value: 'male', label: t('investors.gender_male', 'investments') || 'Male' },
          { value: 'female', label: t('investors.gender_female', 'investments') || 'Female' },
        ],
      },
      { name: 'phone', type: 'numeric', label: t('investors.phone', 'investments') || 'Phone', hints: makeHints('phone') },
      {
        name: 'whatsapp_number',
        type: 'numeric',
        label: t('investors.whatsapp_number', 'investments') || 'WhatsApp',
        hints: makeHints('whatsapp_number'),
      },
      { name: 'email', type: 'email', label: t('investors.email', 'investments') || 'Email', hints: makeHints('email') },
      { name: 'address', type: 'text', label: t('investors.address', 'investments') || 'Address', hints: makeHints('address') },
      {
        name: 'is_possible_investor_in_future',
        type: 'checkbox',
        label: t('investors.is_possible_investor_in_future', 'investments') || 'Is Possible Investor In Future',
        defaultValue: false,
      },
    ],
    [t, makeHints]
  );

  const rowSchema = useMemo(() => getInvestorRowSchema(t), [t]);

  const matrixErrors = useMemo(() => {
    const errs: Record<number, Record<string, string>> = {};
    const raw: unknown = errors?.investors;
    if (!Array.isArray(raw)) return errs;
    raw.forEach((rowErr: unknown, rowIndex: number) => {
      if (!rowErr || typeof rowErr !== 'object') return;
      if (!errs[rowIndex]) errs[rowIndex] = {};
      Object.entries(rowErr).forEach(([fieldName, val]) => {
        const candidate: unknown = val;
        const msg =
          typeof candidate === 'object' && candidate !== null && 'message' in candidate
            ? String((candidate as { message: unknown }).message)
            : String(candidate);
        if (MATRIX_FIELD_NAMES.includes(fieldName)) errs[rowIndex][fieldName] = msg;
      });
    });
    return errs;
  }, [errors]);

  return <DataMatrixInput value={rows} onChange={setRows} matrixFields={matrixFields} rowSchema={rowSchema} errors={matrixErrors} defaultRowFactory={emptyInvestorRow} />;
}
