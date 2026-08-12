import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { DataMatrixInput, type MatrixFieldConfig } from '../../../../core/presentation/layouts/ui/inputs/DataMatrixInput';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { usePersons } from '../../../crm/presentation/hooks/usePersons';
import { authorizedPersonsPayloadToRows, authorizedPersonsRowsToPayload, emptyAuthorizedPersonRow, type AuthorizedPersonPayload } from './authorizedPersons';

interface AuthorizedPersonsFieldProps {
  methods: UseFormReturn<FieldValues>;
}

export function AuthorizedPersonsField({ methods }: AuthorizedPersonsFieldProps) {
  const { t } = useLanguage();
  const { persons, setFilter, loading } = usePersons();
  const { setValue, getValues, formState } = methods;

  const personsRef = useRef(persons);
  const pendingSearchRef = useRef(false);
  const prevSubmitSuccessful = useRef(false);

  const [rows, setRows] = useState<Record<string, unknown>[]>(() =>
    authorizedPersonsPayloadToRows((getValues('authorized_persons') as AuthorizedPersonPayload[] | undefined) ?? undefined)
  );

  useEffect(() => {
    personsRef.current = persons;
  }, [persons]);

  useEffect(() => {
    if (!loading.findAllPersons) pendingSearchRef.current = false;
  }, [loading.findAllPersons]);

  const { isSubmitSuccessful } = formState;
  useEffect(() => {
    if (isSubmitSuccessful && !prevSubmitSuccessful.current) {
      setRows([emptyAuthorizedPersonRow()]);
    }
    prevSubmitSuccessful.current = isSubmitSuccessful;
  }, [isSubmitSuccessful]);

  useEffect(() => {
    setValue('authorized_persons', authorizedPersonsRowsToPayload(rows), { shouldValidate: true });
  }, [rows, setValue]);

  const searchPersonsApi = async (query: string): Promise<Record<string, unknown>[]> => {
    if (!query.trim()) return [];
    pendingSearchRef.current = true;
    setFilter({ search: query.trim(), per_page: 10 });
    const deadline = Date.now() + 8000;
    while (pendingSearchRef.current && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 75));
    }
    const q = query.trim().toLowerCase();
    return personsRef.current
      .filter(
        (p) =>
          String(p.name ?? '').toLowerCase().includes(q) ||
          String(p.email ?? '').toLowerCase().includes(q) ||
          String(p.primary_phone_number ?? '').toLowerCase().includes(q)
      )
      .map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email ?? '',
        phone: p.primary_phone_number ?? '',
      }));
  };

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
          __original_name: String(item.name ?? ''),
          __original_email: String(item.email ?? ''),
        }),
      },
    },
    { name: 'email', label: t('facilities.email', 'investments') || 'Email', type: 'text' },
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
    role_in_facility: z.string().optional(),
    is_required_for_legal_matters: z.boolean().optional(),
    __original_name: z.string().optional(),
    __original_email: z.string().optional(),
  });

  return <DataMatrixInput value={rows} onChange={setRows} matrixFields={matrixFields} rowSchema={rowSchema} />;
}