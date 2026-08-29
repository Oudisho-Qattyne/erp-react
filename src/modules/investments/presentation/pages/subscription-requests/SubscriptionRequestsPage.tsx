import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { FilterDialog, type FilterField, type FilterLabelMaps } from '../../../../../core/presentation/layouts/ui/filter/FilterDialog';
import { ActiveFilters } from '../../../../../core/presentation/layouts/ui/filter/ActiveFilters';
import { createFilterFormatValue } from '../../../../../core/presentation/layouts/ui/filter/filterLabels';
import { getModules } from '../../../../../core/moduleRegistry';
import { Eye, FileText, Check, CheckCheck, X, Ban, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SubscriptionRequest } from '../../../domain/entities/subscriptionRequests/subscriptionRequest';
import { useSubscription } from '../../hooks/useSubscription';
import { UserPickerDialog } from '../../../../users/presentation/components/UserPickerDialog';
import { PlotPickerDialog } from '../plots/components/PlotPickerDialog';
import { Badge, type BadgeVariant } from '../../../../../core/presentation/layouts/ui/badges/Badge';
import type { SubscriptionRequestStatus } from '../../../domain/valueObjects/investments/subscriptionRequestStatus';
import { canShowSubscriptionAction } from '../../utils/subscriptionActions';

const STATUS_LABELS: Record<string, string> = {
  pending_subscription_fee: 'Pending Fee',
  subscription_fee_paid: 'Fee Paid',
  pending_subscription_department_manager: 'Pending Dept. Manager',
  pending_general_manager: 'Pending General Manager',
  subscription_approved: 'Approved',
  subscription_canceled_by_department_manager: 'Canceled by Dept. Manager',
  subscription_canceled_by_general_manager: 'Canceled by GM',
  subscription_payment_canceled: 'Payment Canceled',
  subscription_completed: 'Completed',
};

export function SubscriptionRequestsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    requests,
    loading,
    error,
    filters,
    setFilters,
    resetFilters,
    sortColumn,
    sortOrder,
    setSort,
    page,
    setPage,
    perPage,
    setPerPage,
    pagination,
    listAllSubscriptionRequests,
    changeSubscriptionRequestStatus,
    completeSubscriptionRequest,
  } = useSubscription();

  const label = (key: string) => t(`subscription_requests.${key}`, 'investments');
  const statusLabel = (status?: string) => t(`subscription_request_status.${status}`, 'investments') || STATUS_LABELS[status ?? ''] || status || '';

  const statusVariant = (status?: string): BadgeVariant => {
    if (status === 'subscription_approved' || status === 'subscription_completed') return 'success';
    if (status === 'subscription_canceled_by_department_manager' || status === 'subscription_canceled_by_general_manager' || status === 'subscription_payment_canceled') return 'danger';
    if (status === 'subscription_fee_paid') return 'info';
    return 'warning';
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [labelMaps, setLabelMaps] = useState<FilterLabelMaps>({});
  const formatValue = useMemo(() => createFilterFormatValue(labelMaps), [labelMaps]);

  const usersModuleRegistered = useMemo(() => getModules().some(m => m.name === 'users'), []);

  useEffect(() => {
    listAllSubscriptionRequests().catch(() => {});
  }, [filters, sortColumn, sortOrder, page, perPage]);

  const createdByField: FilterField = usersModuleRegistered
    ? {
      name: 'created_by',
      label: label('created_by') || 'Created By',
      type: 'table-picker',
      picker: UserPickerDialog,
      pickerProps: { multiple: true },
      valueKey: 'id',
      labelKey: 'name',
    }
    : {
      name: 'created_by',
      label: label('created_by') || 'Created By',
      type: 'text',
    };

  const plotIdField: FilterField = {
    name: 'plot_id',
    label: label('plot_id') || 'Plot',
    type: 'table-picker',
    picker: PlotPickerDialog,
    pickerProps: { multiple: true },
    valueKey: 'id',
    labelKey: 'code',
  };

  const filterFields: FilterField[] = [
    {
      name: 'id',
      label: label('filter_id') || 'ID',
      type: 'text',
    },
    plotIdField,
    {
      name: 'status',
      label: t('subscription_request.status', 'investments') || 'Status',
      type: 'multi-select',
      options: Object.keys(STATUS_LABELS).map(value => ({ value, label: statusLabel(value) })),
    },
    {
      name: 'request_type',
      label: label('request_type') || 'Request Type',
      type: 'select',
      options: [
        { value: '', label: t('common.all', 'shared') || 'All' },
        { value: 'subscription_request', label: label('request_type_subscription') || 'Subscription Request' },
      ],
    },
    {
      name: 'version',
      label: label('version') || 'Version',
      type: 'select',
      options: [
        { value: '', label: t('common.all', 'shared') || 'All' },
        { value: '1.0.0', label: '1.0.0' },
      ],
    },
    createdByField,
    {
      name: 'from_date',
      label: t('common.from_date', 'shared') || 'From Date',
      type: 'date',
    },
    {
      name: 'to_date',
      label: t('common.to_date', 'shared') || 'To Date',
      type: 'date',
    },
  ];

  const handleApplyFilter = (values: Record<string, any>, maps?: FilterLabelMaps) => {
    const parsed: Record<string, any> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val === '' || val === undefined || val === null) continue;
      parsed[key] = val;
    }
    setFilters(parsed);
    setLabelMaps(maps ?? {});
    setIsFilterOpen(false);
  };

  const handleResetFilter = () => {
    resetFilters();
    setLabelMaps({});
    setIsFilterOpen(false);
  };

  const handleStatusAction = async (plotId: number, id: number, status: SubscriptionRequestStatus) => {
    try {
      await changeSubscriptionRequestStatus(plotId, id, status);
    } catch {
      // handled by hook
    }
  }

  const handleApprove = (plotId: number, id: number) => handleStatusAction(plotId, id, 'pending_general_manager');
  const handleReject = (plotId: number, id: number) => handleStatusAction(plotId, id, 'subscription_canceled_by_department_manager');
  const handleCancelByGeneralManager = (plotId: number, id: number) => handleStatusAction(plotId, id, 'subscription_canceled_by_general_manager');

  const handleComplete = async (plotId: number, id: number) => {
    try {
      await completeSubscriptionRequest(plotId, id);
    } catch {
      // handled by hook
    }
  }

  const columns = [
    {
      key: 'id',
      label: 'ID',
      width: 90,
      sortable: true,
      render: (row: SubscriptionRequest) => <span className="font-medium">{row.id}</span>,
    },
    {
      key: 'code',
      label: label('plot_code'),
      width: 120,
      render: (row: SubscriptionRequest) => row.payload?.plot?.code,
    },
    {
      key: 'area',
      label: label('area'),
      width: 120,
      render: (row: SubscriptionRequest) => row.payload?.plot?.area ? `${row.payload.plot?.area} ㎡` : '—',
    },
    {
      key: 'request_type',
      label: label('request_type') || 'Request Type',
      width: 160,
      sortable: true,
      render: (row: SubscriptionRequest) =>
        row.request_type === 'subscription_request'
          ? label('request_type_subscription') || 'Subscription Request'
          : row.request_type || '—',
    },
    {
      key: 'status',
      label: t('subscription_request.status', 'investments') || 'Status',
      width: 170,
      sortable: true,
      render: (row: SubscriptionRequest) => <Badge label={statusLabel(row.status)} variant={statusVariant(row.status)} />,
    },
    {
      key: 'version',
      label: label('version'),
      width: 170,
      sortable: true,
    },
    {
      key: 'created_at',
      label: t('common.created_at', 'shared') || 'Created At',
      width: 130,
      sortable: true,
      render: (row: SubscriptionRequest) => row.created_at || '—',
    },
    {
      key: 'actions',
      label: t('common.actions', 'shared') || 'Actions',
      width: 200,
      render: (row: SubscriptionRequest) => (
          <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`/investments/subscription-requests/${row.id}` , '_blank')}
              title={label('view')}
              requiredPermission="investments.plot-reqeusts.subscription_requests.view"
            >
              <Eye size={16} />
            </Button>
            {canShowSubscriptionAction(row.status, 'approve') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleApprove(row.plot_id ?? 0, row.id ?? 0)}
                title={label('approve')}
                className="text-success hover:text-success"
              >
                <Check size={16} />
              </Button>
            )}
            {canShowSubscriptionAction(row.status, 'reject') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReject(row.plot_id ?? 0, row.id ?? 0)}
                title={label('reject')}
                className="text-danger hover:text-danger"
              >
                <X size={16} />
              </Button>
            )}
            {canShowSubscriptionAction(row.status, 'complete') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleComplete(row.plot_id ?? 0, row.id ?? 0)}
                title={label('complete')}
                className="text-success hover:text-success"
              >
                <CheckCheck size={16} />
              </Button>
            )}
            {canShowSubscriptionAction(row.status, 'cancel') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCancelByGeneralManager(row.plot_id ?? 0, row.id ?? 0)}
                title={label('cancel')}
                className="text-danger hover:text-danger"
              >
                <Ban size={16} />
              </Button>
            )}
          </div>
        ),
    },
  ];

  const paginationProps = {
    page: pagination?.currentPage || 1,
    totalPages: pagination?.lastPage || 1,
    totalItems: pagination?.total || 0,
    onPageChange: setPage,
    itemsPerPage: perPage,
    onItemsPerPageChange: (s: number) => setPerPage(s),
    itemsPerPageOptions: [10, 25, 50],
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-primary" />
          <h1 className="text-2xl font-bold text-text">{label('title')}</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} leftIcon={<Filter size={14} />}>
          {t('common.filter', 'shared') || 'Filter'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleResetFilter}>
          {t('common.reset', 'shared') || 'Reset'}
        </Button>
      </div>

      <ActiveFilters filters={filters} fields={filterFields} formatValue={formatValue} />

      {error['listAllSubscriptionRequests'] ? (
        <ErrorState message={error['listAllSubscriptionRequests']} onRetry={() => listAllSubscriptionRequests()} />
      ) : (
        <DataTable
          columns={columns}
          data={requests}
          rowKey="id"
          emptyMessage={label('empty')}
          loading={loading['listAllSubscriptionRequests']}
          sortColumn={sortColumn}
          sortOrder={sortOrder}
          onSort={setSort}
          pagination={paginationProps}
        />
      )}

      <FilterDialog
        isOpen={isFilterOpen}
        fields={filterFields}
        initialValues={filters}
        onFilter={handleApplyFilter}
        onCancel={() => setIsFilterOpen(false)}
        onReset={handleResetFilter}
      />
    </div>
  );
}