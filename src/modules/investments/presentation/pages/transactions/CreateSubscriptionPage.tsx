import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { GenericCreateForm, type FieldConfig, type GroupConfig } from '../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import type { PickerConfig } from '../../../../../core/presentation/layouts/ui/picker/pickerTypes';
import type { ColumnDef } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { handleApiError } from '../../../../../core/presentation/utils/handleApiError';
import type { Plot } from '../../../domain/entities/plot';
import { getCreateFacilityFormSchema } from '../../schemas/facilityForm.schema';
import { buildFacilityFormFields, buildFacilityFormGroups } from '../../forms/facilityFormConfig';
import { getCreateInvestorFormSchema } from '../../schemas/investorForm.schema';
import { buildInvestorFormFields, buildInvestorFormGroups } from '../../forms/investorFormConfig';
import type { Investor } from '../../../domain/entities/investor';
import type { PartnershipType } from '../../../domain/entities/partnershipType';
import { useSubscription } from '../../hooks/useSubscription';
import type { CreateSubscriptionDTO, SubscriptionAuthorizedPersonPayload } from '../../../domain/repositories/ISubscriptionRepository';

type FetchParams = Record<string, string | number | boolean | undefined>;

export function CreateSubscriptionPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const plotsCrud = useEntityCrud<Plot>('/investments/plots', '/investments/plots');
  const investorsCrud = useEntityCrud<Investor>('/investments/investors', '/investments/investors');
  const partnershipTypesCrud = useEntityCrud<PartnershipType>('/investments/partnership-types', '/investments/partnership-types');
  const { createSubscription } = useSubscription();

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const [investorSearchQuery, setInvestorSearchQuery] = useState('');
  const [investorPage, setInvestorPage] = useState(1);
  const [investorPerPage, setInvestorPerPage] = useState(25);

  const fetchPlots = (params: FetchParams = {}) => {
    const sp = new URLSearchParams();
    if (params.search) sp.append('search', String(params.search));
    if (params.page) sp.append('page', String(params.page));
    if (params.per_page) sp.append('per_page', String(params.per_page));
    Object.entries(params).forEach(([k, v]) => {
      if (!['search', 'page', 'per_page'].includes(k) && v !== '' && v !== undefined) {
        sp.append(k, String(v));
      }
    });
    plotsCrud.getAll(`/investments/plots?${sp.toString()}`);
  };

  useEffect(() => {
fetchPlots({ page: 1, per_page: perPage });
    investorsCrud.getAll('/investments/investors?page=1&per_page=25');
    partnershipTypesCrud.getAll('/investments/partnership-types?is_active=true');
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    fetchPlots({ search: query, page: 1, per_page: perPage });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchPlots({ search: searchQuery, page: newPage, per_page: perPage });
  };

  const handlePerPageChange = (size: number) => {
    setPerPage(size);
    setPage(1);
    fetchPlots({ search: searchQuery, page: 1, per_page: size });
  };

  const fetchInvestors = (params: FetchParams = {}) => {
    const sp = new URLSearchParams();
    if (params.search) sp.append('search', String(params.search));
    if (params.page) sp.append('page', String(params.page));
    if (params.per_page) sp.append('per_page', String(params.per_page));
    Object.entries(params).forEach(([k, v]) => {
      if (!['search', 'page', 'per_page'].includes(k) && v !== '' && v !== undefined) {
        sp.append(k, String(v));
      }
    });
    investorsCrud.getAll(`/investments/investors?${sp.toString()}`);
  };

  const handleInvestorSearch = (query: string) => {
    setInvestorSearchQuery(query);
    setInvestorPage(1);
    fetchInvestors({ search: query, page: 1, per_page: investorPerPage });
  };

  const handleInvestorPageChange = (newPage: number) => {
    setInvestorPage(newPage);
    fetchInvestors({ search: investorSearchQuery, page: newPage, per_page: investorPerPage });
  };

  const handleInvestorPerPageChange = (size: number) => {
    setInvestorPerPage(size);
    setInvestorPage(1);
    fetchInvestors({ search: investorSearchQuery, page: 1, per_page: size });
  };

  const plotColumns: ColumnDef<Plot>[] = [
    { key: 'code', label: t('plots.code', 'investments') || 'Code', width: 120, sortable: true },
    { key: 'identifier', label: t('plots.identifier', 'investments') || 'Identifier', width: 120, sortable: true },
    { key: 'plot_area_name', label: t('plots.plot_area_id', 'investments') || 'Plot Area', width: 120 },
    { key: 'plot_classification_name', label: t('plots.plot_classification_id', 'investments') || 'Classification', width: 120 },
  ];

  const plotPickerConfig: PickerConfig<Plot> = {    dialogTitle: t('plots.picker_title', 'investments') || 'Select Plot',
    dialogSize: '2xl',
    valueProp: 'id',
    labelProp: 'code',
    data: plotsCrud.entities,
    columns: plotColumns,
    rowKey: 'id',
    isLoading: plotsCrud.loadingMap['getAll'],
    error: plotsCrud.errorMap['getAll'],
    onRetry: () => fetchPlots({ search: searchQuery, page, per_page: perPage }),
    onSearch: handleSearch,
    searchPlaceholder: t('common.search', 'shared') || 'Search...',
    filterFields: [],
    filterValues: {},
    onApplyFilter: () => {},
    onResetFilter: () => {},
    page,
    perPage,
    totalPages: plotsCrud.pagination?.lastPage || 1,
    totalItems: plotsCrud.pagination?.total || 0,
    onPageChange: handlePageChange,
    onPerPageChange: handlePerPageChange,
    emptyMessage: t('plots.no_records', 'investments') || 'No plots found',
    requiredPermission: 'investments.plots.list',
  };

  const investorColumns: ColumnDef<Investor>[] = [
    {
      key: 'first_name',
      label: t('investors.full_name', 'investments') || 'Full Name',
      width: 200,
      sortable: true,
      render: (row: Investor) => <span className="font-medium">{[row.first_name, row.father_name, row.last_name].filter(Boolean).join(' ')}</span>,
    },
    { key: 'national_id', label: t('investors.national_id', 'investments') || 'National ID', width: 150, sortable: true },
    { key: 'nationality', label: t('investors.nationality', 'investments') || 'Nationality', width: 130, sortable: true },
    { key: 'phone', label: t('investors.phone', 'investments') || 'Phone', width: 140, sortable: true },
  ];

  const investorPickerConfig: PickerConfig<Investor> = {
    dialogTitle: t('transactions.select_investors', 'investments') || 'Select Investors',
    dialogSize: '2xl',
    multiple: true,
    valueProp: 'id',
    labelProp: 'first_name',
    data: investorsCrud.entities,
    columns: investorColumns,
    rowKey: 'id',
    isLoading: investorsCrud.loadingMap['getAll'],
    error: investorsCrud.errorMap['getAll'],
    onRetry: () => fetchInvestors({ search: investorSearchQuery, page: investorPage, per_page: investorPerPage }),
    onSearch: handleInvestorSearch,
    searchPlaceholder: t('common.search', 'shared') || 'Search...',
    filterFields: [],
    filterValues: {},
    onApplyFilter: () => {},
    onResetFilter: () => {},
    page: investorPage,
    perPage: investorPerPage,
    totalPages: investorsCrud.pagination?.lastPage || 1,
    totalItems: investorsCrud.pagination?.total || 0,
    onPageChange: handleInvestorPageChange,
    onPerPageChange: handleInvestorPerPageChange,
    emptyMessage: t('investors.no_records', 'investments') || 'No investors found',
    requiredPermission: 'investments.investors.list',
    createConfig: {
      schema: getCreateInvestorFormSchema(t),
      fields: buildInvestorFormFields(t, false),
      groups: buildInvestorFormGroups(t),
      dialogTitle: t('investors.add', 'investments') || 'Add Investor',
      dialogSize: '2xl',
      buttonLabel: t('investors.add', 'investments') || 'Add Investor',
      submitLabel: t('common.create', 'shared') || 'Create',
      createButtonPermission: 'investments.investors.create',
      onSubmit: async (data: Record<string, unknown>) => {
        const res = await investorsCrud.create({ ...data, is_possible_investor_in_future: false } as Parameters<typeof investorsCrud.create>[0]);
        fetchInvestors({ search: investorSearchQuery, page: 1, per_page: investorPerPage });
        return res;
      },
    },
  };

  const facilityDeps = {
    partnershipTypes: partnershipTypesCrud.entities,
    createPartnershipType: partnershipTypesCrud.create,
  };

  const fields: FieldConfig[] = [
    {
      name: 'plot_id',
      label: t('transactions.plot', 'investments') || 'Plot',
      type: 'table-picker',
      required: true,
      group: 'plot',
      pickerConfig: plotPickerConfig,
    },
    {
      name: 'investor_ids',
      label: t('transactions.partners', 'investments') || 'Partners',
      type: 'table-picker',
      required: true,
      group: 'partners',
      pickerConfig: investorPickerConfig,
    },
    ...buildFacilityFormFields(t, facilityDeps),
  ];

  const groups: GroupConfig[] = [
    {
      group: 'plot',
      title: t('transactions.group_plot', 'investments') || 'Plot Selection',
      columns: 1,
      rows: [['plot_id']],
    },
    {
      group: 'partners',
      title: t('transactions.group_partners', 'investments') || 'Partners',
      columns: 1,
      rows: [['investor_ids']],
    },
    {
      group: 'facility',
      title: t('facilities.title', 'investments') || 'Facility',
      children: buildFacilityFormGroups(t),
    },
  ];

  const schema = z.object({
    plot_id: z.number( t('transactions.validation.plot_required', 'investments') || 'Plot is required' ),
    investor_ids: z.array(z.number()).min(1, t('transactions.validation.investors_required', 'investments') || 'At least one investor is required'),
    ...getCreateFacilityFormSchema(t).shape,
  });

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      const plotId = Number(data.plot_id);
      const payload: CreateSubscriptionDTO = {
        facility: {
          name: String(data.name ?? ''),
          partnership_type_id: (data.partnership_type_id as number | null) ?? null,
          address: String(data.address ?? ''),
          city: String(data.city ?? ''),
          first_phone_number: String(data.first_phone_number ?? ''),
          second_phone_number: (data.second_phone_number as string) || null,
          email: (data.email as string) || null,
          capital_in_usd: Number(data.capital_in_usd),
          capital_in_syp: Number(data.capital_in_syp),
          value_of_machines_in_usd: Number(data.value_of_machines_in_usd),
          value_of_machines_in_syp: Number(data.value_of_machines_in_syp),
          number_of_workers: Number(data.number_of_workers),
          daily_production_capacity: Number(data.daily_production_capacity),
          monthly_production_capacity: Number(data.monthly_production_capacity),
          yearly_production_capacity: Number(data.yearly_production_capacity),
          electrical_power_capacity: String(data.electrical_power_capacity ?? ''),
          yearly_estimated_water_consumption: Number(data.yearly_estimated_water_consumption),
          require_all_persons_for_legal_matters: Boolean(data.require_all_persons_for_legal_matters),
        },
        authorized_persons: ((data.authorized_persons as SubscriptionAuthorizedPersonPayload[] | undefined) ?? []),
        partners: {
          investors_ids: (data.investor_ids as number[] | undefined) ?? [],
        },
      };
      await createSubscription(plotId, payload);
      navigate('/investments/plots');
      return { data: { id: plotId } };
    } catch (err: unknown) {
      handleApiError(err, { module: 'investments' });
      throw err;
    }
  };

  return (
    <div className="p-6 w-full mx-auto space-y-6" dir="auto">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate('/investments/transactions')}>
          {t('common.back', 'shared') || 'Back'}
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Coins size={24} className="text-primary" />
          {t('transactions.create_title', 'investments') || 'New Subscription'}
        </h1>
      </div>

      <div className='relative w-full'>
        <GenericCreateForm
          schema={schema}
          fields={fields}
          groups={groups}
          defaultValues={{ require_all_persons_for_legal_matters: true }}
          onSubmit={handleSubmit}
          onSuccess={() => {}}
          onCancel={() => navigate('/investments/transactions')}
          submitLabel={t('common.save', 'shared') || 'Save'}
        />
      </div>
    </div>
  );
}