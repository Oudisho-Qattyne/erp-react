import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Plot } from '../../../domain/entities/plot';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import Input from '../../../../../core/presentation/layouts/ui/inputs/Input';
import { inputBaseClasses } from '../../../../../core/presentation/layouts/ui/inputs/styles';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { FilterDialog, type FilterField } from '../../../../../core/presentation/layouts/ui/filter/FilterDialog';
import { toast } from 'sonner';
import { Eye, Trash2, MapPin, History, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { EntityWithNameOnly } from '../../../../../core/domain/entities/EntityWithNameOnly';
import { AuditLog } from '../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { PlotAuditLogModal } from './components/PlotAuditLogModal';
import { getLocalizedName } from '../../../../../core/presentation/utils/helpes';

export function PlotsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { entities: plots, getAll, remove, loadingMap, errorMap, pagination } = useEntityCrud<Plot>('/investments/plots', '/investments/plots');
  const { entities: areas, getAll: getAreas } = useEntityCrud<EntityWithNameOnly>('/investments/plot-areas', '/investments/plot-areas');
  const { entities: classifications, getAll: getClassifications } = useEntityCrud<EntityWithNameOnly>('/investments/plot-classifications', '/investments/plot-classifications');

  const entityName = t('plots.title', 'investments') || 'Plot';
  const [localSearch, setLocalSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Plot | null>(null);
  // const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditItem, setAuditItem] = useState<Plot | null>(null);

  // Table State
  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  // Filter State
  const [extraFilters, setExtraFilters] = useState<Record<string, string>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch Lookups
  useEffect(() => {
    getAreas();
    getClassifications();
  }, []);

  // Fetch Data (Server Side)
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('code', searchQuery);

    for (const [key, val] of Object.entries(extraFilters)) {
      if (val) params.append(key, val);
    }

    if (sortColumn) {
      params.append('sortColumn', sortColumn);
      params.append('sortOrder', sortOrder);
    }

    params.append('page', String(page));

    getAll(`/investments/plots?${params.toString()}`);
  }, [searchQuery, sortColumn, sortOrder, page, extraFilters]);

  const handleSearch = () => {
    setSearchQuery(localSearch);
    setPage(1);
  };

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(key);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, string> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val !== '' && val !== undefined) parsed[key] = val;
    }
    setExtraFilters(parsed);
    setPage(1);
    setIsFilterOpen(false);
  };

  const handleResetFilter = () => {
    setExtraFilters({});
    setPage(1);
    setIsFilterOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await remove(confirmDelete.id);
      toast.success((t('plots.deleted', 'investments') || 'Plot deleted').replace('{name}', entityName));
      setPage(prev => prev);
    } catch {
      toast.error((t('plots.delete_error', 'investments') || 'Failed to delete plot').replace('{name}', entityName));
    }
    setConfirmDelete(null);
  };

  const areaOptions = useMemo(() => areas.map(a => ({ value: String(a.id), label: getLocalizedName(a.name) })), [areas]);
  const classificationOptions = useMemo(() => classifications.map(c => ({ value: String(c.id), label: getLocalizedName(c.name) })), [classifications]);
  const statusOptions = useMemo(() => [
    { value: 'unsold', label: t('plot_status.unsold', 'investments') || 'Unsold' },
    { value: 'announced', label: t('plot_status.announced', 'investments') || 'Announced' },
    { value: 'subscribed', label: t('plot_status.subscribed', 'investments') || 'Subscribed' },
    { value: 'allocated', label: t('plot_status.allocated', 'investments') || 'Allocated' },
    { value: 'separated', label: t('plot_status.separated', 'investments') || 'Separated' }
  ], [t]);

  const filterFields: FilterField[] = useMemo(() => [
    { name: 'status', label: t('plots.status', 'investments') || 'Status', type: 'select', options: statusOptions },
    { name: 'plot_area_id', label: t('plots.plot_area_id', 'investments') || 'Region', type: 'select', options: areaOptions },
    { name: 'plot_classification_id', label: t('plots.plot_classification_id', 'investments') || 'Classification', type: 'select', options: classificationOptions },
    { name: 'from_date', label: t('plots.from_date', 'investments') || 'From Date', type: 'date' },
    { name: 'to_date', label: t('plots.to_date', 'investments') || 'To Date', type: 'date' },
  ], [t, areaOptions, classificationOptions, statusOptions]);

  const columns = [
    {
      key: 'code',
      label: t('plots.code', 'investments') || 'Plot Code',
      width: 120,
      sortable: true,
      render: (row: Plot) => <span className="font-medium">{row.code}</span>
    },
    {
      key: 'identifier',
      label: t('plots.identifier', 'investments') || 'Plot Identifier',
      width: 120,
      sortable: true,
      render: (row: Plot) => <span className="font-medium">{row.identifier}</span>
    },
    {
      key: 'status',
      label: t('plots.status', 'investments') || 'Status',
      width: 140,
      sortable: true,
      render: (row: Plot) => (
        <div className="flex flex-col gap-1 items-start">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-dark bg-primary-light/20 px-2 py-0.5 rounded-full">
            {t(`plot_status.${row.status}`, 'investments') || row.status}
          </span>
          {row.status_date && (
            <span className="text-[10px] text-text-muted">{row.status_date}</span>
          )}
        </div>
      )
    },
    {
      key: 'area',
      label: t('plots.area', 'investments') || 'Area',
      width: 100,
      sortable: true,
      render: (row: Plot) => `${row.area} ㎡`
    },
    {
      key: 'plot_area_id',
      label: t('plots.plot_area_id', 'investments') || 'Region',
      width: 150,
      sortable: true,
      render: (row: Plot) => row.plot_area_name || '—'
    },
    {
      key: 'plot_classification_id',
      label: t('plots.plot_classification_id', 'investments') || 'Classification',
      width: 150,
      sortable: true,
      render: (row: Plot) => row.plot_classification_name || '—'
    },
    {
      key: 'created_at',
      label: t('plots.created_at', 'investments') || 'Created At',
      width: 110,
      sortable: true,
      render: (row: Plot) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'
    },
    {
      key: 'actions',
      label: t('common.actions', 'shared') || 'Actions',
      width: 140,
      render: (row: Plot) => (
        <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
          {row.latitude && row.longitude && (
            <Button variant="ghost" size="sm" onClick={() => window.open(`https://www.google.com/maps?q=${row.latitude},${row.longitude}`, '_blank')}
              title={t('plots.show_map', 'investments') || 'Show in Map'}>
              <MapPin size={16} className="text-success" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => navigate(`/investments/plots/${row.id}/edit`)}
            title={t('common.view', 'shared') || 'View'} requiredPermission="investments.plots.view">
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)}
            title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.plots.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)}
            title={t('plots.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
            <History size={16} />
          </Button>
        </div>
      )
    },
  ];

  const tablePagination = {
    page: pagination?.currentPage || 1,
    totalPages: pagination?.lastPage || 1,
    totalItems: pagination?.total || 0,
    onPageChange: (newPage: number) => setPage(newPage),
  };

  const handleTranslateValues = (field: string, value: string) => {
    if (field === 'status') {
      const statusKey = `plot_status.${value}`;
      const translated = t(statusKey, 'investments');
      if (translated && translated !== statusKey) return translated;
    }
    return value;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">{t('plots.title', 'investments') || 'Plots'}</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* <Button onClick={() => setIsAuditModalOpen(true)} variant="outline" className="flex items-center gap-2" requiredPermission="shared.audit-logs.view">
            <History size={16} />
            {t('plots.edit_log', 'investments') || 'سجل التعديلات'}
          </Button> */}
          <Button onClick={() => navigate('/investments/plots/create')} requiredPermission="investments.plots.create">{t('plots.add', 'investments') || 'Add Plot'}</Button>
        </div>
      </div>
        <div className="flex flex-wrap items-center gap-3">
          <Input type="text" value={localSearch} onChange={setLocalSearch}
            placeholder={t('common.search', 'shared') || 'Search by code...'}
            baseClasses={inputBaseClasses} className="w-64" />
          <Button variant="primary" onClick={handleSearch} size="sm" leftIcon={<Search size={14} />}>
            {t('common.search', 'shared') || 'Search'}
          </Button>
          <Button variant="outline" onClick={() => setIsFilterOpen(true)} size="sm" leftIcon={<Filter size={14} />}>
            {t('common.filter', 'shared') || 'Filter'}
          </Button>
          <Button variant="outline" onClick={handleResetFilter} size="sm">
            {t('common.reset', 'shared') || 'Reset'}
          </Button>
        </div>

      <FilterDialog
        isOpen={isFilterOpen}
        fields={filterFields}
        initialValues={extraFilters}
        onFilter={handleApplyFilter}
        onCancel={() => setIsFilterOpen(false)}
        onReset={handleResetFilter}
      />

      {errorMap['getAll'] && <ErrorState message={errorMap['getAll']} onRetry={() => setPage(prev => prev)} />}

      {!errorMap['getAll'] && (
        <DataTable
          columns={columns}
          data={plots}
          rowKey="id"
          loading={loadingMap['getAll']}
          emptyMessage={t('plots.no_records', 'investments') || 'No plots found'}
          sortColumn={sortColumn}
          sortOrder={sortOrder}
          onSort={handleSort}
          pagination={tablePagination}
        />
      )}

      <AuditLog
        isOpen={!!auditItem}
        onClose={() => setAuditItem(null)}
        model="plot"
        modelId={auditItem?.id}
        module="investments"
        labels={{
          title: t('plots.edit_log', 'investments') || 'Edit Log',
          event: t('plots.event', 'investments') || 'Event',
          created_at: t('plots.created_at', 'investments') || 'Created At',
          changed_by: t('plots.changed_by', 'investments') || 'Changed By',
          changes: t('plots.changes', 'investments') || 'Changes',
          field: t('plots.field', 'investments') || 'Field',
          old_value: t('plots.old_value', 'investments') || 'Old Value',
          new_value: t('plots.new_value', 'investments') || 'New Value',
          no_records: t('plots.no_edit_log', 'investments') || 'No edit logs found',
          subject_id: t('plots.plot_id', 'investments') || 'Plot ID',
        }}
        translateField={(key) => t(`plots.${key}`, 'investments') || key}
        translateValues={handleTranslateValues}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title={t('common.delete', 'shared') || 'Delete'}
        message={t('common.delete_confirm', 'shared').replace("{name}" , "") || 'Are you sure you want to delete this?'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
        confirmLoading={loadingMap['remove']}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
      />

      {/* <PlotAuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      /> */}
    </div>
  );
}


