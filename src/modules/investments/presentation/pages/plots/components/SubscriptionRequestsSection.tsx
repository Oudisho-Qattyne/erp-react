import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { ErrorState } from '../../../../../../core/presentation/layouts/ui/state/ErrorState';
import { FilterDialog, type FilterField, type FilterLabelMaps } from '../../../../../../core/presentation/layouts/ui/filter/FilterDialog';
import { ActiveFilters } from '../../../../../../core/presentation/layouts/ui/filter/ActiveFilters';
import { createFilterFormatValue } from '../../../../../../core/presentation/layouts/ui/filter/filterLabels';
import { Badge, type BadgeVariant } from '../../../../../../core/presentation/layouts/ui/badges/Badge';
import { getModules } from '../../../../../../core/moduleRegistry';
import { Eye, Check, X, CheckCheck, Ban, Filter, Plus } from 'lucide-react';
import type { SubscriptionRequest } from '../../../../domain/entities/subscriptionRequests/subscriptionRequest';
import { useSubscription } from '../../../hooks/useSubscription';
import { UserPickerDialog } from '../../../../../users/presentation/components/UserPickerDialog';
import { canShowSubscriptionAction } from '../../../utils/subscriptionActions';
import { ChangeSubscriptionStatusDialog } from '../../../components/subscriptionRequests/components/ChangeSubscriptionStatusDialog';

type StatusActionKey = 'approve' | 'reject' | 'complete' | 'cancel';

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

interface Props {
  plotId: number;
}

export function SubscriptionRequestsSection({ plotId }: Props) {
  const { t } = useLanguage();
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
    getAllSubscriptionRequests,
    approveSubscriptionRequest,
    rejectSubscriptionRequest,
    cancelSubscriptionRequestByGeneralManager,
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

  const [pendingAction, setPendingAction] = useState<{ key: StatusActionKey; row: SubscriptionRequest } | null>(null);

  const actionFns: Record<StatusActionKey, (plotId: number, subRequestId: number, notes?: string) => Promise<void>> = {
    approve: approveSubscriptionRequest,
    reject: rejectSubscriptionRequest,
    complete: completeSubscriptionRequest,
    cancel: cancelSubscriptionRequestByGeneralManager,
  };

  const usersModuleRegistered = useMemo(() => getModules().some(m => m.name === 'users'), []);

  useEffect(() => {
    getAllSubscriptionRequests(plotId).catch(() => {});
  }, [plotId, filters, sortColumn, sortOrder]);

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

  const filterFields: FilterField[] = useMemo(() => [
    {
      name: 'id',
      label: label('filter_id') || 'ID',
      type: 'text',
    },
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
  ], [t, usersModuleRegistered]);

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

  const handleConfirmAction = async (notes: string) => {
    if (!pendingAction) return;
    const { key, row } = pendingAction;
    try {
      await actionFns[key](row.plot_id ?? plotId, row.id ?? 0, notes);
      await getAllSubscriptionRequests(plotId);
      setPendingAction(null);
    } catch {
      setPendingAction(null);
    }
  };

  const columns = useMemo(() => [
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
            onClick={() => window.open(`/investments/subscription-requests/${row.id}`, '_blank')}
            title={label('view')}
            requiredPermission="investments.plot-reqeusts.subscription_requests.view"
          >
            <Eye size={16} />
          </Button>
          {canShowSubscriptionAction(row.status, 'approve') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPendingAction({ key: 'approve', row })}
              title={label('approve')}
              className="text-success hover:text-success"
              isLoading={loading['approveSubscriptionRequest']}
            >
              <Check size={16} />
            </Button>
          )}
          {canShowSubscriptionAction(row.status, 'reject') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPendingAction({ key: 'reject', row })}
              title={label('reject')}
              className="text-danger hover:text-danger"
              isLoading={loading['rejectSubscriptionRequest']}
            >
              <X size={16} />
            </Button>
          )}
          {canShowSubscriptionAction(row.status, 'complete') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPendingAction({ key: 'complete', row })}
              title={label('complete')}
              className="text-success hover:text-success"
              isLoading={loading['completeSubscriptionRequest']}
            >
              <CheckCheck size={16} />
            </Button>
          )}
          {canShowSubscriptionAction(row.status, 'cancel') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPendingAction({ key: 'cancel', row })}
              title={label('cancel')}
              className="text-danger hover:text-danger"
              isLoading={loading['cancelSubscriptionRequestByGeneralManager']}
            >
              <Ban size={16} />
            </Button>
          )}
        </div>
      ),
    },
  ], [t, loading]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{label('title') || 'Subscription Requests'}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} leftIcon={<Filter size={14} />}>
            {t('common.filter', 'shared') || 'Filter'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetFilter}>
            {t('common.reset', 'shared') || 'Reset'}
          </Button>
          <Button
            size="sm"
            onClick={() => window.open('/investments/transactions/create', '_blank')}
            requiredPermission="investments.plot_subscription_requests.create"
          >
            <Plus size={16} className="mr-1" />
            {t('transactions.create_title', 'investments') || 'Create Subscription'}
          </Button>
        </div>
      </div>

      <ActiveFilters filters={filters} fields={filterFields} formatValue={formatValue} />

      {error['getAllSubscriptionRequests'] ? (
        <ErrorState message={error['getAllSubscriptionRequests']} onRetry={() => getAllSubscriptionRequests(plotId)} />
      ) : (
        <DataTable
          columns={columns}
          data={requests}
          rowKey="id"
          emptyMessage={label('empty')}
          loading={loading['getAllSubscriptionRequests']}
          sortColumn={sortColumn}
          sortOrder={sortOrder}
          onSort={setSort}
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

      <ChangeSubscriptionStatusDialog
        isOpen={pendingAction !== null}
        title={`${(pendingAction && label(pendingAction.key)) || ''} — ${label('title')}`}
        message={label('note_message') || ''}
        confirmLabel={pendingAction ? label(pendingAction.key) : undefined}
        danger={pendingAction?.key === 'reject' || pendingAction?.key === 'cancel'}
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}