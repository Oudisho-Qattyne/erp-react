import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { DataMatrixInput, type MatrixFieldConfig } from '../../../../core/presentation/layouts/ui/inputs/DataMatrixInput';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { useApiClient } from '../../../../core/presentation/context/api/ApiClinetProvider';
import { createPersonRepository } from '../../../crm/infrastructure/repositories/PersonRepository';
import { createManagePersonsUseCase } from '../../../crm/application/usecases/managePersonsUseCase';
import { authorizedPersonsPayloadToRows, authorizedPersonsRowsToPayload, emptyAuthorizedPersonRow, type AuthorizedPersonPayload } from './authorizedPersons';

interface AuthorizedPersonsFieldProps {
  methods: UseFormReturn<FieldValues>;
}

export function AuthorizedPersonsField({ methods }: AuthorizedPersonsFieldProps) {
  const { t } = useLanguage();
  const { setValue, getValues, formState } = methods;

  const apiClient = useApiClient();
  const managePersons = useMemo(
    () => createManagePersonsUseCase(createPersonRepository(apiClient)),
    [apiClient]
  );

  const [rows, setRows] = useState<Record<string, unknown>[]>(() =>
    authorizedPersonsPayloadToRows((getValues('authorized_persons') as AuthorizedPersonPayload[] | undefined) ?? undefined)
  );

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
      try {
        const res = await managePersons.findAllPersons({ search: query.trim(), per_page: 10 });
        return (res.data ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email ?? '',
          primary_phone_number: p.primary_phone_number ?? '',
          whatsapp: p.whatsapp ?? '',
          facebook: p.facebook ?? '',
        }));
      } catch {
        return [];
      }
    },
    [managePersons]
  );

  const matrixFields: MatrixFieldConfig[] = [
    { name: 'id', label: 'ID', type: 'numeric', disabled: true, defaultValue: null },
    {
      name: 'name',
      label: t('facilities.authorized_persons_person', 'investments') || 'Person (name / email / phone)',
      required: true,
      hints: {
        searchApi: searchPersonsApi,
        minChars: 2,
        debounceMs: 300,
        displayValue: (item: Record<string, unknown>) => String(item.name ?? ''),
        fill: (item: Record<string, unknown>) => ({
          id: (item.id as number) ?? null,
          name: String(item.name ?? ''),
          email: String(item.email ?? ''),
          primary_phone_number: String(item.primary_phone_number ?? ''),
          whatsapp: String(item.whatsapp ?? ''),
          facebook: String(item.facebook ?? ''),
          __original_name: String(item.name ?? ''),
          __original_email: String(item.email ?? ''),
        }),
      },
    },
    { name: 'email', label: t('facilities.email', 'investments') || 'Email', type: 'text' },
    {
      name: 'primary_phone_number',
      label: t('facilities.authorized_persons_primary_phone', 'investments') || 'Primary Phone',
      type: 'text',
    },
    {
      name: 'whatsapp',
      label: t('facilities.authorized_persons_whatsapp', 'investments') || 'WhatsApp',
      type: 'text',
    },
    {
      name: 'facebook',
      label: t('facilities.authorized_persons_facebook', 'investments') || 'Facebook',
      type: 'text',
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
  ];

  const rowSchema = z.object({
    id: z.number().nullable().optional(),
    name: z
      .string()
      .min(1, t('facilities.validation.authorized_person_name_required', 'investments') || 'Person name is required'),
    email: z.string().optional(),
    primary_phone_number: z.string().optional(),
    whatsapp: z.string().optional(),
    facebook: z.string().optional(),
    role_in_facility: z.string().optional(),
    is_required_for_legal_matters: z.boolean().optional(),
    __original_name: z.string().optional(),
    __original_email: z.string().optional(),
  });

  return <DataMatrixInput value={rows} onChange={setRows} matrixFields={matrixFields} rowSchema={rowSchema} />;
}