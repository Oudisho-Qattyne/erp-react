import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
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
import { isApiError } from '../../../../../core/domain/common/errors/ApiError';
import type { Plot } from '../../../domain/entities/plot';
import { getCreateFacilityFormSchema } from '../../schemas/facilityForm.schema';
import { getInvestorRowSchema } from '../../schemas/investorForm.schema';
import { buildFacilityFormFields, buildFacilityFormGroups } from '../../forms/facilityFormConfig';
import { InvestorsField } from '../../forms/InvestorsInput';
import type { PartnershipType } from '../../../domain/entities/partnershipType';
import { useSubscription } from '../../hooks/useSubscription';
import { mapSubscriptionServerValidationErrors } from '../../forms/subscriptionServerErrors';
import type { CreateSubscriptionDTO, SubscriptionAuthorizedPersonPayload, SubscriptionInvestorPayload } from '../../../domain/repositories/ISubscriptionRepository';

type FetchParams = Record<string, string | number | boolean | undefined>;

export function CreateSubscriptionPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const plotsCrud = useEntityCrud<Plot>('/investments/plots', '/investments/plots');
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

  const plotColumns: ColumnDef<Plot>[] = [
    { key: 'code', label: t('plots.code', 'investments') || 'Code', width: 120, sortable: true },
    { key: 'identifier', label: t('plots.identifier', 'investments') || 'Identifier', width: 120, sortable: true },
    { key: 'plot_area_name', label: t('plots.plot_area_id', 'investments') || 'Plot Area', width: 120 },
    { key: 'plot_classification_name', label: t('plots.plot_classification_id', 'investments') || 'Classification', width: 120 },
    {
      key: 'status',
      label: t('plots.status', 'investments') || 'Status',
      width: 140,
      render: (row: Plot) => (
        <div className="flex flex-col gap-1 items-start">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-dark bg-primary-light/20 px-2 py-0.5 rounded-full">
            {t(`plot_status.${row.status}`, 'investments') || row.status}
          </span>
          {row.status_date && (
            <span className="text-[10px] text-text-muted">{row.status_date}</span>
          )}
        </div>
      ),
    },
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
      name: 'investors',
      label: t('transactions.partners', 'investments') || 'Partners',
      group: 'partners',
      render: (methods) => <InvestorsField methods={methods} />,
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
      rows: [['investors']],
    },
    {
      group: 'facility',
      title: t('facilities.title', 'investments') || 'Facility',
      children: buildFacilityFormGroups(t),
    },
  ];

  const schema = z.object({
    plot_id: z.number( t('transactions.validation.plot_required', 'investments') || 'Plot is required' ),
    investors: z.array(getInvestorRowSchema(t)).min(1, t('transactions.validation.investors_required', 'investments') || 'At least one investor is required'),
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
        partners: ((data.investors as SubscriptionInvestorPayload[] | undefined) ?? []).map((investor) => ({ investor })),
      };
      await createSubscription(plotId, payload);
      navigate('/investments/plots');
      return { data: { id: plotId } };
    } catch (err: unknown) {
      handleApiError(err, { module: 'investments' , passThrough:true });
      if (isApiError(err) && err.validationErrors) {
        err.validationErrors = mapSubscriptionServerValidationErrors(err.validationErrors);
      }
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