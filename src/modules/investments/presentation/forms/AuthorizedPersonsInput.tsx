import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import { useFormState, type FieldValues, type UseFormReturn } from 'react-hook-form';
import { DataMatrixInput, type MatrixFieldConfig } from '../../../../core/presentation/layouts/ui/inputs/DataMatrixInput';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { usePersons } from '../../../../core/registry/person/usePersons';
import { authorizedPersonsPayloadToRows, authorizedPersonsRowsToPayload, emptyAuthorizedPersonRow, type AuthorizedPersonPayload } from './authorizedPersons';

interface AuthorizedPersonsFieldProps {
  methods: UseFormReturn<FieldValues>;
}

const MATRIX_FIELD_NAMES: string[] = [
  'id',
  'name',
  'email',
  'primary_phone_number',
  'whatsapp',
  'facebook',
  'role_in_facility',
  'is_required_for_legal_matters',
];

export function AuthorizedPersonsField({ methods }: AuthorizedPersonsFieldProps) {
  const { t } = useLanguage();
  const { setValue, getValues, formState } = methods;
  const { isRegistered, searchPersons } = usePersons();

  const [rows, setRows] = useState<Record<string, unknown>[]>(() =>
    authorizedPersonsPayloadToRows((getValues('authorized_persons') as AuthorizedPersonPayload[] | undefined) ?? undefined)
  );

  const { errors } = useFormState({ name: 'authorized_persons' as const });

  const prevSubmitSuccessfulRef = useRef(false);
  const { isSubmitSuccessful } = formState;
  useEffect(() => {
    if (isSubmitSuccessful && !prevSubmitSuccessfulRef.current) {
      setRows([emptyAuthorizedPersonRow()]);
    }
    prevSubmitSuccessfulRef.current = isSubmitSuccessful;
  }, [isSubmitSuccessful]);

  useEffect(() => {
    setValue('authorized_persons', authorizedPersonsRowsToPayload(rows), { shouldValidate: true });
  }, [rows, setValue]);

  const searchPersonsApi = useCallback(
    async (query: string): Promise<Record<string, unknown>[]> => {
      if (!query.trim()) return [];
      const items = await searchPersons(query.trim());
      return items.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email ?? '',
        primary_phone_number: p.primary_phone_number ?? '',
        whatsapp: p.whatsapp ?? '',
        facebook: p.facebook ?? '',
      }));
    },
    [searchPersons]
  );

  const makeHints = useCallback(
    (fieldName: string): MatrixFieldConfig['hints'] | undefined => {
      if (!isRegistered) return undefined;
      return {
        searchApi: searchPersonsApi,
        minChars: 2,
        debounceMs: 300,
        displayValue: (item: Record<string, unknown>) => String(item[fieldName] ?? ''),
        fill: (item: Record<string, unknown>) => ({
          id: (item.id as number | null | undefined) ?? null,
          name: String(item.name ?? ''),
          email: String(item.email ?? ''),
          primary_phone_number: String(item.primary_phone_number ?? ''),
          whatsapp: String(item.whatsapp ?? ''),
          facebook: String(item.facebook ?? ''),
          __original_name: String(item.name ?? ''),
          __original_email: String(item.email ?? ''),
        }),
      };
    },
    [isRegistered, searchPersonsApi]
  );

  const matrixFields = useMemo<MatrixFieldConfig[]>(() => [
    { name: 'id', label: 'ID', type: 'numeric', disabled: true, defaultValue: null },
    {
      name: 'name',
      type: 'alpha',
      label: t('facilities.authorized_persons_person', 'investments') || 'Person (name / email / phone)',
      required: true,
      hints: makeHints('name'),
    },
    { name: 'email', label: t('facilities.email', 'investments') || 'Email', type: 'text', hints: makeHints('email') },
    {
      name: 'primary_phone_number',
      label: t('facilities.authorized_persons_primary_phone', 'investments') || 'Primary Phone',
      type: 'numeric',
      hints: makeHints('primary_phone_number'),
    },
    {
      name: 'whatsapp',
      label: t('facilities.authorized_persons_whatsapp', 'investments') || 'WhatsApp',
      type: 'numeric',
      hints: makeHints('whatsapp'),
    },
    {
      name: 'facebook',
      label: t('facilities.authorized_persons_facebook', 'investments') || 'Facebook',
      type: 'text',
      hints: makeHints('facebook'),
    },
    {
      name: 'role_in_facility',
      label: t('facilities.authorized_persons_role', 'investments') || 'Role in Facility',
      type: 'text',
      placeholder: t('facilities.authorized_persons_role_placeholder', 'investments') || 'e.g. General Manager',
    },
    {
      name: 'is_required_for_legal_matters',
      label: t('facilities.authorized_persons_required_label', 'investments') || 'Required',
      type: 'checkbox',
      defaultValue: true,
    },
  ], [t, makeHints]);

  const rowSchema = z
    .object({
      id: z.number().nullable().optional(),
      name: z
        .string()
        .min(1, t('facilities.validation.authorized_person_name_required', 'investments') || 'Person name is required'),
      email: z
        .union([
          z.literal(''),
          z.string().email(t('facilities.validation.email_invalid', 'investments') || 'Invalid email address'),
        ])
        .optional(),
      primary_phone_number: z
        .union([
          z.literal(''),
          z.string().regex(/^[0-9+\s()-]*$/, t('facilities.validation.authorized_person_phone_invalid', 'investments') || 'Invalid phone number'),
        ])
        .optional(),
      whatsapp: z
        .union([
          z.literal(''),
          z.string().regex(/^[0-9+\s()-]*$/, t('facilities.validation.authorized_person_phone_invalid', 'investments') || 'Invalid phone number'),
        ])
        .optional(),
      facebook: z.string().optional(),
      role_in_facility: z.string().optional(),
      is_required_for_legal_matters: z.boolean().optional(),
      __original_name: z.string().optional(),
      __original_email: z.string().optional(),
    })
    .superRefine((row, ctx) => {
      const hasPerson = String(row.name ?? '').trim().length > 0;
      if (hasPerson && !String(row.role_in_facility ?? '').trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['role_in_facility'],
          message: t('facilities.validation.authorized_person_role_required', 'investments') || 'Role in Facility is required',
        });
      }
    });

  const matrixErrors = useMemo(() => {
    const errs: Record<number, Record<string, string>> = {};
    const raw: unknown = errors?.authorized_persons;
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

  return <DataMatrixInput value={rows} onChange={setRows} matrixFields={matrixFields} rowSchema={rowSchema} errors={matrixErrors} defaultRowFactory={emptyAuthorizedPersonRow} />;
}