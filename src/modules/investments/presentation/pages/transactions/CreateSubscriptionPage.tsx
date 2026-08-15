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
import type { FilterField } from '../../../../../core/presentation/layouts/ui/filter/FilterDialog';
import type { EntityWithNameOnly } from '../../../../../core/domain/entities/EntityWithNameOnly';
import { getLocalizedName } from '../../../../../core/presentation/utils/helpes';
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
  const plotAreasCrud = useEntityCrud<EntityWithNameOnly>('/investments/plot-areas', '/investments/plot-areas');
  const plotClassificationsCrud = useEntityCrud<EntityWithNameOnly>('/investments/plot-classifications', '/investments/plot-classifications');
  const { createSubscription } = useSubscription();

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [plotFilters, setPlotFilters] = useState<Record<string, any>>({});
  const [plotSortBy, setPlotSortBy] = useState<string | undefined>(undefined);
  const [plotSortOrder, setPlotSortOrder] = useState<'asc' | 'desc'>('asc');

  const [investorSearchQuery, setInvestorSearchQuery] = useState('');
  const [investorPage, setInvestorPage] = useState(1);
  const [investorPerPage, setInvestorPerPage] = useState(25);
  const [investorFilters, setInvestorFilters] = useState<Record<string, any>>({});

  const fetchPlots = (params: FetchParams = {}) => {
    const sp = new URLSearchParams();
    if (params.search) sp.append('search', String(params.search));
    if (params.sortColumn) sp.append(`sort_by[${params.sortColumn}]`, String(params.sortOrder ?? 'asc'));
    if (params.page) sp.append('page', String(params.page));
    if (params.per_page) sp.append('per_page', String(params.per_page));
    Object.entries(params).forEach(([k, v]) => {
      if (!['search', 'sortColumn', 'sortOrder', 'page', 'per_page'].includes(k) && v !== '' && v !== undefined) {
        sp.append(k, String(v));
      }
    });
    plotsCrud.getAll(`/investments/plots?${sp.toString()}`);
  };

  useEffect(() => {
    fetchPlots({ page: 1, per_page: perPage });
    investorsCrud.getAll('/investments/investors?page=1&per_page=25');
    partnershipTypesCrud.getAll('/investments/partnership-types?is_active=true');
    plotAreasCrud.getAll();
    plotClassificationsCrud.getAll();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    fetchPlots({ ...plotFilters, search: query, sortColumn: plotSortBy, sortOrder: plotSortOrder, page: 1, per_page: perPage });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchPlots({ ...plotFilters, search: searchQuery, sortColumn: plotSortBy, sortOrder: plotSortOrder, page: newPage, per_page: perPage });
  };

  const handlePerPageChange = (size: number) => {
    setPerPage(size);
    setPage(1);
    fetchPlots({ ...plotFilters, search: searchQuery, sortColumn: plotSortBy, sortOrder: plotSortOrder, page: 1, per_page: size });
  };

  const handlePlotSort = (columnKey: string) => {
    const newOrder = plotSortBy === columnKey && plotSortOrder === 'asc' ? 'desc' : 'asc';
    setPlotSortBy(columnKey);
    setPlotSortOrder(newOrder);
    setPage(1);
    fetchPlots({ ...plotFilters, search: searchQuery, sortColumn: columnKey, sortOrder: newOrder, page: 1, per_page: perPage });
  };

  const handlePlotApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val === '' || val === undefined) continue;
      if (val === 'true') parsed[key] = true;
      else if (val === 'false') parsed[key] = false;
      else parsed[key] = val;
    }
    setPlotFilters(parsed);
    setPage(1);
    fetchPlots({ ...parsed, search: searchQuery, sortColumn: plotSortBy, sortOrder: plotSortOrder, page: 1, per_page: perPage });
  };

  const handlePlotResetFilter = () => {
    setPlotFilters({});
    setPage(1);
    fetchPlots({ search: searchQuery, sortColumn: plotSortBy, sortOrder: plotSortOrder, page: 1, per_page: perPage });
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
    fetchInvestors({ ...investorFilters, search: query, page: 1, per_page: investorPerPage });
  };

  const handleInvestorPageChange = (newPage: number) => {
    setInvestorPage(newPage);
    fetchInvestors({ ...investorFilters, search: investorSearchQuery, page: newPage, per_page: investorPerPage });
  };

  const handleInvestorPerPageChange = (size: number) => {
    setInvestorPerPage(size);
    setInvestorPage(1);
    fetchInvestors({ ...investorFilters, search: investorSearchQuery, page: 1, per_page: size });
  };

  const handleInvestorApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val === '' || val === undefined) continue;
      if (val === 'true') parsed[key] = true;
      else if (val === 'false') parsed[key] = false;
      else parsed[key] = val;
    }
    setInvestorFilters(parsed);
    setInvestorPage(1);
    fetchInvestors({ ...parsed, search: investorSearchQuery, page: 1, per_page: investorPerPage });
  };

  const handleInvestorResetFilter = () => {
    setInvestorFilters({});
    setInvestorPage(1);
    fetchInvestors({ search: investorSearchQuery, page: 1, per_page: investorPerPage });
  };

  const plotFilterFields: FilterField[] = [
    { name: 'status', label: t('plots.status', 'investments') || 'Status', type: 'select', options: [
      { value: 'unsold', label: t('plot_status.unsold', 'investments') || 'Unsold' },
      { value: 'announced', label: t('plot_status.announced', 'investments') || 'Announced' },
      { value: 'subscribed', label: t('plot_status.subscribed', 'investments') || 'Subscribed' },
      { value: 'allocated', label: t('plot_status.allocated', 'investments') || 'Allocated' },
      { value: 'separated', label: t('plot_status.separated', 'investments') || 'Separated' },
    ] },
    { name: 'plot_area_id', label: t('plots.plot_area_id', 'investments') || 'Region', type: 'select', options: plotAreasCrud.entities.map(a => ({ value: String(a.id), label: getLocalizedName(a.name) })) },
    { name: 'plot_classification_id', label: t('plots.plot_classification_id', 'investments') || 'Classification', type: 'select', options: plotClassificationsCrud.entities.map(c => ({ value: String(c.id), label: getLocalizedName(c.name) })) },
    { name: 'code', label: t('plots.code', 'investments') || 'Plot Code', type: 'text' },
    { name: 'identifier', label: t('plots.identifier', 'investments') || 'Plot Identifier', type: 'text' },
    { name: 'has_allocated_dossier', label: t('plots.filter_has_allocated_dossier', 'investments') || 'Has Allocated Dossier', type: 'checkbox' },
    { name: 'from_date', label: t('plots.from_date', 'investments') || 'From Date', type: 'date' },
    { name: 'to_date', label: t('plots.to_date', 'investments') || 'To Date', type: 'date' },
  ];

  const investorFilterFields: FilterField[] = [
    { name: 'has_social_account', label: t('investors.filter_has_social_account', 'investments') || 'Has Social Account', type: 'checkbox' },
    { name: 'has_facebook_account', label: t('investors.filter_has_facebook_account', 'investments') || 'Has Facebook', type: 'checkbox' },
    { name: 'has_instagram_account', label: t('investors.filter_has_instagram_account', 'investments') || 'Has Instagram', type: 'checkbox' },
    { name: 'has_x_account', label: t('investors.filter_has_x_account', 'investments') || 'Has X (Twitter)', type: 'checkbox' },
    { name: 'has_linkedin_account', label: t('investors.filter_has_linkedin_account', 'investments') || 'Has LinkedIn', type: 'checkbox' },
    { name: 'is_possible_investor_in_future', label: t('investors.filter_is_possible_investor_in_future', 'investments') || 'Future Possible Investor', type: 'checkbox' },
    { name: 'has_phone_number', label: t('investors.filter_has_phone_number', 'investments') || 'Has Phone', type: 'checkbox' },
    { name: 'has_whatsapp_number', label: t('investors.filter_has_whatsapp_number', 'investments') || 'Has WhatsApp', type: 'checkbox' },
    { name: 'nationality', label: t('investors.nationality', 'investments') || 'Nationality', type: 'text' },
    { name: 'gender', label: t('investors.gender', 'investments') || 'Gender', type: 'select', options: [
      { value: 'male', label: t('investors.gender_male', 'investments') || 'Male' },
      { value: 'female', label: t('investors.gender_female', 'investments') || 'Female' },
    ] },
    { name: 'email', label: t('investors.email', 'investments') || 'Email', type: 'text' },
  ];

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
    onRetry: () => fetchPlots({ ...plotFilters, search: searchQuery, sortColumn: plotSortBy, sortOrder: plotSortOrder, page, per_page: perPage }),
    onSearch: handleSearch,
    searchPlaceholder: t('common.search', 'shared') || 'Search...',
    filterFields: plotFilterFields,
    filterValues: plotFilters,
    onApplyFilter: handlePlotApplyFilter,
    onResetFilter: handlePlotResetFilter,
    sortColumn: plotSortBy,
    sortOrder: plotSortOrder,
    onSort: handlePlotSort,
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
      render: (row: Investor) => <span className="font-medium">{[row.first_name, row.father_name, row.last_name].filter(Boolean).join(' ')}</span>,
    },
    { key: 'national_id', label: t('investors.national_id', 'investments') || 'National ID', width: 150 },
    { key: 'nationality', label: t('investors.nationality', 'investments') || 'Nationality', width: 130 },
    { key: 'phone', label: t('investors.phone', 'investments') || 'Phone', width: 140 },
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
    onRetry: () => fetchInvestors({ ...investorFilters, search: investorSearchQuery, page: investorPage, per_page: investorPerPage }),
    onSearch: handleInvestorSearch,
    searchPlaceholder: t('common.search', 'shared') || 'Search...',
    filterFields: investorFilterFields,
    filterValues: investorFilters,
    onApplyFilter: handleInvestorApplyFilter,
    onResetFilter: handleInvestorResetFilter,
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