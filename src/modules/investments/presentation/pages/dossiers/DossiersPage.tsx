import { useState, useMemo, useRef } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Dossier } from '../../../domain/entities/dossier';
import type { Plot } from '../../../domain/entities/plot';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { inputBaseClasses } from '../../../../../core/presentation/layouts/ui/inputs/styles';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { FilterDialog, type FilterField } from '../../../../../core/presentation/layouts/ui/filter/FilterDialog';
import { AuditLog } from '../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { toast } from 'sonner';
import { handleApiError } from '../../../../../core/presentation/utils/handleApiError';
import { Eye, Trash2, Search, History, FileText, Filter, X, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PlotPickerDialog } from '../plots/components/PlotPickerDialog';
const statusStyles: Record<string, { color: string; bg: string }> = {
  active: { color: '#16a34a', bg: '#dcfce7' },
  cancelled: { color: '#dc2626', bg: '#fef2f2' },
  allocatable: { color: '#2563eb', bg: '#dbeafe' },
  draft: { color: '#ca8a04', bg: '#fefce8' },
  pending_subscription_fee: { color: '#d97706', bg: '#fef3c7' },
  subscription_fee_paid: { color: '#059669', bg: '#d1fae5' },
  subscription_approved: { color: '#16a34a', bg: '#dcfce7' },
};

export function DossiersPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { entities: dossiers, getAll, remove, loadingMap, errorMap, pagination, list } = useEntityCrud<Dossier>(
    '/investments/dossiers',
    '/investments/dossiers',
    { listState: true }
  );

  const [localSearch, setLocalSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Dossier | null>(null);
  const [auditItem, setAuditItem] = useState<Dossier | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterPlotName, setFilterPlotName] = useState<string>('');
  const confirmedFilterRef = useRef<{ plotName: string; status: string }>({ plotName: '', status: '' });
  const [plotPickerOpen, setPlotPickerOpen] = useState(false);
  const formRef = useRef<any>(null);

  const handleSearch = () => {
    list.setSearch(localSearch);
  };

  const handlePlotPicked = (plots: Plot[]) => {
    const p = plots[0];
    if (p) {
      setFilterPlotName(`${p.code} - ${p.identifier}`);
      formRef.current?.setValue('plot_id', p.id);
    }
    setPlotPickerOpen(false);
  };

  const filterFields: FilterField[] = [
    {
      name: 'dossier_number',
      label: t('dossier.number', 'investments') || 'Dossier Number',
      type: 'text',
    },
    {
      name: 'from_dossier_date',
      label: t('dossier.from_dossier_date', 'investments') || 'From Dossier Date',
      type: 'date',
    },
    {
      name: 'to_dossier_date',
      label: t('dossier.to_dossier_date', 'investments') || 'To Dossier Date',
      type: 'date',
    },
    {
      name: 'from_subscription_date',
      label: t('dossier.from_subscription_date', 'investments') || 'From Subscription Date',
      type: 'date',
    },
    {
      name: 'to_subscription_date',
      label: t('dossier.to_subscription_date', 'investments') || 'To Subscription Date',
      type: 'date',
    },
    {
      name: 'plot_id',
      render: (form) => {
        formRef.current = form;
        return (
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              {t('plots.title', 'investments') || 'Plot'}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-sm text-text-muted">
                <MapPin size={14} />
                {filterPlotName || (t('common.all', 'shared') || 'All')}
              </div>
              <Button variant="outline" size="sm" onClick={() => setPlotPickerOpen(true)}>
                {t('common.select', 'shared') || 'Select'}
              </Button>
              {filterPlotName && (
                <Button variant="ghost" size="sm" onClick={() => { setFilterPlotName(''); form.setValue('plot_id', '') }}>
                  <X size={14} />
                </Button>
              )}
            </div>
          </div>
        );
      },
    },
    {
      name: 'status',
      label: t('dossier.status', 'investments') || 'Status',
      type: 'select',
      options: [
        { value: '', label: t('common.all', 'shared') || 'All' },
        { value: 'draft', label: t('dossier.status_draft', 'investments') || 'Draft' },
        { value: 'pending_subscription_fee', label: t('dossier.status_pending_subscription_fee', 'investments') || 'Pending Subscription Fee' },
        { value: 'subscription_fee_paid', label: t('dossier.status_subscription_fee_paid', 'investments') || 'Subscription Fee Paid' },
        { value: 'allocatable', label: t('dossier.status_allocatable', 'investments') || 'Allocatable' },
        { value: 'active', label: t('dossier.status_active', 'investments') || 'Allocated' },
        { value: 'subscription_approved', label: t('dossier.status_subscription_approved', 'investments') || 'Subscription Approved' },
        { value: 'cancelled', label: t('dossier.status_cancelled', 'investments') || 'Cancelled' },
      ],
    },
  ];

  const filterInitialValues = useMemo(() => ({
    dossier_number: (list.filter.dossier_number as string | undefined) || '',
    from_dossier_date: (list.filter.from_dossier_date as string | undefined) || '',
    to_dossier_date: (list.filter.to_dossier_date as string | undefined) || '',
    from_subscription_date: (list.filter.from_subscription_date as string | undefined) || '',
    to_subscription_date: (list.filter.to_subscription_date as string | undefined) || '',
    plot_id: (list.filter.plot_id as number | undefined) || '',
    status: (list.filter.status as string | undefined) || '',
  }), [list.filter]);

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val === '' || val === undefined) continue;
      if (key === 'plot_id') {
        parsed[key] = Number(val);
      } else {
        parsed[key] = val;
      }
    }
    if (parsed.plot_id) {
      confirmedFilterRef.current.plotName = filterPlotName;
    } else {
      setFilterPlotName('');
      confirmedFilterRef.current.plotName = '';
    }
    const status = String(parsed.status || '');
    if (status) parsed.status = status;
    confirmedFilterRef.current.status = status;
    list.setFilter(parsed);
    list.setSearch('');
    setLocalSearch('');
    setIsFilterOpen(false);
  };

  const handleResetFilter = () => {
    list.resetFilter();
    setFilterPlotName('');
    confirmedFilterRef.current = { plotName: '', status: '' };
    setLocalSearch('');
    setIsFilterOpen(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await remove(confirmDelete.id);
      toast.success(t('dossier.deleted', 'investments') || 'Dossier deleted successfully');
      setConfirmDelete(null);
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
    }
  };

  const handleTranslateValues = (field: string, value: string) => {
    if (field === 'status') {
      return t(`dossier.status_${value}`, 'investments') || value;
    }
    return value;
  };

  const columns = [
    { key: "dossier_number", label: t("dossier.number", "investments") || "Dossier Number", width: 160 },
    { key: "dossier_date", label: t("dossier.date", "investments") || "Dossier Date", width: 120, sortable: true },
    { key: "allocated_date", label: t("dossier.allocated_date", "investments") || "Allocated Date", width: 120 },
    {
      key: "status",
      label: t("dossier.status", "investments") || "Status",
      width: 130,
      render: (row: Dossier) => {
        const st = statusStyles[row.status] || statusStyles.draft;
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
            style={{ color: st.color, background: st.bg }}>
            {t(`dossier.status_${row.status}`, 'investments') || row.status}
          </span>
        );
      },
    },
    {
      key: "plot",
      label: t("plots.section_title", "investments") || "Plot",
      width: 140,
      render: (row: Dossier) => {
        const pid = row.plot?.id;
        if (!pid) return '—';
        return (
          <button type="button" onClick={() => navigate(`/investments/plots/${pid}/edit`)} className="flex items-center gap-1.5 text-primary hover:underline cursor-pointer">
            <MapPin size={14} />
            {row.plot?.code || row.plot?.identifier || pid}
          </button>
        );
      },
    },
    {
      key: "notes",
      label: t("plots.notes", "investments") || "Notes",
      width: 200,
      render: (row: Dossier) => row.notes ? (
        <span className="truncate block max-w-45" title={row.notes}>{row.notes}</span>
      ) : '—',
    },
    {
      key: "actions",
      label: t("common.actions", "shared") || "Actions",
      width: 120,
      render: (row: Dossier) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => {
            const pid = row.plot?.id || row.plot_id;
              navigate(`/investments/plots/${pid}/dossiers/${row.id}`);
          }} title={t('common.view', 'shared') || 'View'} requiredPermission="investments.plot-dossier.view"
            disabled={!row.plot?.id}>
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)} title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.plot-dossier.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)} title={t('dossier.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
            <History size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText size={24} className="text-primary" />
          {t('dossier.title', 'investments') || 'Dossiers'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            placeholder={t('common.search', 'shared') || 'Search...'}
            className={`${inputBaseClasses} pl-8 rtl:pr-8 rtl:pl-4`}
          />
          <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
        <Button variant="primary" size="sm" onClick={handleSearch}>
          {t('common.search', 'shared') || 'Search'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} leftIcon={<Filter size={14} />}>
          {t('common.filter', 'shared') || 'Filter'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleResetFilter}>
          {t('common.reset', 'shared') || 'Reset'}
        </Button>
      </div>

      {errorMap["getAll"] ? (
        <ErrorState message={errorMap["getAll"]} onRetry={() => getAll(`/investments/dossiers?page=${list.page}&per_page=${list.perPage}`)} />
      ) : (
        <DataTable
          columns={columns}
          data={dossiers}
          rowKey="id"
          loading={loadingMap["getAll"]}
          emptyMessage={t('dossier.no_records', 'investments') || 'No dossiers found'}
          sortColumn={list.filter.sortColumn}
          sortOrder={list.filter.sortOrder}
          onSort={list.setSort}
          pagination={{
            page: pagination?.currentPage || 1,
            totalPages: pagination?.lastPage || 1,
            totalItems: pagination?.total || 0,
            onPageChange: list.setPage,
            itemsPerPage: list.perPage,
            onItemsPerPageChange: (size: number) => list.setPerPage(size),
            itemsPerPageOptions: [10, 25, 50, 100],
          }}
        />
      )}

      <FilterDialog
        isOpen={isFilterOpen}
        fields={filterFields}
        initialValues={filterInitialValues}
        onFilter={handleApplyFilter}
        onCancel={() => {
          setFilterPlotName(confirmedFilterRef.current.plotName);
          setIsFilterOpen(false);
        }}
        onReset={handleResetFilter}
      />

      <PlotPickerDialog
        isOpen={plotPickerOpen}
        onClose={() => setPlotPickerOpen(false)}
        onConfirm={handlePlotPicked}
        multiple={false}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title={t('dossier.delete_title', 'investments') || 'Delete Dossier'}
        message={t('dossier.delete_message', 'investments') || 'Are you sure you want to delete this dossier?'}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmLoading={loadingMap["remove"]}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
      />

      <AuditLog
        isOpen={!!auditItem}
        onClose={() => setAuditItem(null)}
        model="plot_dossier"
        modelId={auditItem?.id}
        module="investments"
        labels={{
          title: t('dossier.edit_log', 'investments') || 'Edit Log',
          event: t('dossier.event', 'investments') || 'Event',
          created_at: t('dossier.created_at', 'investments') || 'Created At',
          changed_by: t('dossier.changed_by', 'investments') || 'Changed By',
          changes: t('dossier.changes', 'investments') || 'Changes',
          field: t('dossier.field', 'investments') || 'Field',
          old_value: t('dossier.old_value', 'investments') || 'Old Value',
          new_value: t('dossier.new_value', 'investments') || 'New Value',
          no_records: t('dossier.no_edit_log', 'investments') || 'No edit logs found',
          subject_id: t('dossier.subject_id', 'investments') || 'Dossier ID',
        }}
        translateField={(key) => t(`dossier.${key}`, 'investments') || key}
        translateValues={handleTranslateValues}
      />
    </div>
  );
}
