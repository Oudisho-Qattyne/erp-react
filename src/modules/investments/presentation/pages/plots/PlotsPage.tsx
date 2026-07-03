import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Plot } from '../../../domain/entities/plot';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import Input from '../../../../../core/presentation/layouts/ui/inputs/Input';
import { inputBaseClasses } from '../../../../../core/presentation/layouts/ui/inputs/styles';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { LoadingState } from '../../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { toast } from 'sonner';
import { Eye, Trash2, MapPin, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { EntityWithNameOnly } from '../../../../../core/domain/entities/EntityWithNameOnly';
import { PlotAuditLogModal } from './components/PlotAuditLogModal';
import { getLocalizedName } from '../../../../../core/presentation/utils/helpes';

export function PlotsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { entities: plots, getAll, remove, loading, error, pagination } = useEntityCrud<Plot>('/investments/plots', '/investments/plots');
  const { entities: areas, getAll: getAreas } = useEntityCrud<EntityWithNameOnly>('/investments/plot-areas', '/investments/plot-areas');
  const { entities: classifications, getAll: getClassifications } = useEntityCrud<EntityWithNameOnly>('/investments/plot-classifications', '/investments/plot-classifications');
  const { entities: users, getAll: getUsers } = useEntityCrud<EntityWithNameOnly>('/users', '/users');
  
  const entityName = t('plots.title', 'investments') || 'Plot';
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Plot | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Table State
  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  // Fetch Lookups
  useEffect(() => {
    getAreas();
    getClassifications();
    getUsers();
  }, []);

  // Fetch Data (Server Side)
  useEffect(() => { 
    const params = new URLSearchParams();
    if (searchQuery) params.append('code', searchQuery);
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    if (sortColumn) {
      params.append('sortColumn', sortColumn);
      params.append('sortOrder', sortOrder);
    }
    
    params.append('page', String(page));
    
    getAll(`/investments/plots?${params.toString()}`);
  }, [searchQuery, fromDate, toDate, filters, sortColumn, sortOrder, page]);

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(key);
      setSortOrder('asc');
    }
    setPage(1); // Reset page on sort
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset page on filter
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setConfirmLoading(true);
    try {
      await remove(confirmDelete.id);
      toast.success(t('plots.deleted', 'investments') || 'Plot deleted');
      // Refresh current page
      setPage(prev => prev);
    } catch {
      toast.error(t('plots.delete_error', 'investments') || 'Failed to delete plot');
    }
    setConfirmDelete(null);
    setConfirmLoading(false);
  };

  const areaOptions = useMemo(() => areas.map(a => ({ value: String(a.id), label: getLocalizedName(a.name) })), [areas]);
  const classificationOptions = useMemo(() => classifications.map(c => ({ value: String(c.id), label: getLocalizedName(c.name) })), [classifications]);
  const userOptions = useMemo(() => users.map(u => ({ value: String(u.id), label: getLocalizedName(u.name) })), [users]);
  const statusOptions = useMemo(() => [
    { value: 'unsold', label: t('plot_status.unsold', 'investments') || 'Unsold' },
    { value: 'reserved', label: t('plot_status.reserved', 'investments') || 'Reserved' },
    { value: 'sold', label: t('plot_status.sold', 'investments') || 'Sold' },
    { value: 'hold', label: t('plot_status.hold', 'investments') || 'Hold' },
    { value: 'rented', label: t('plot_status.rented', 'investments') || 'Rented' },
    { value: 'shared', label: t('plot_status.shared', 'investments') || 'Shared' }
  ], [t]);

  const columns = [
    { 
      key: 'code', 
      label: t('plots.code', 'investments') || 'Plot Code', 
      width: 120,
      sortable: true,
      filterable: true,
      render: (row: Plot) => <span className="font-medium">{row.code}</span>
    },
    { 
      key: 'status', 
      label: t('plots.status', 'investments') || 'Status', 
      width: 140,
      sortable: true,
      filterable: true,
      filter: {
        type: 'select' as const,
        options: statusOptions
      },
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
      filterable: true,
      render: (row: Plot) => `${row.area} ㎡`
    },
    { 
      key: 'plot_area_id', 
      label: t('plots.plot_area_id', 'investments') || 'Region', 
      width: 150,
      sortable: true,
      filterable: true,
      filter: {
        type: 'select' as const,
        options: areaOptions
      },
      render: (row: Plot) => row.plot_area_name || '—'
    },
    { 
      key: 'plot_classification_id', 
      label: t('plots.plot_classification_id', 'investments') || 'Classification', 
      width: 150,
      sortable: true,
      filterable: true,
      filter: {
        type: 'select' as const,
        options: classificationOptions
      },
      render: (row: Plot) => row.plot_classification_name || '—'
    },
    { 
      key: 'created_at', 
      label: t('plots.created_at', 'investments') || 'Created At', 
      width: 110,
      sortable: true,
      filterable: false,
      render: (row: Plot) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'
    },
    // { 
    //   key: 'user_id', 
    //   label: t('plots.added_by', 'investments') || 'Added By', 
    //   width: 120,
    //   sortable: false,
    //   filterable: true,
    //   filter: {
    //     type: 'select' as const,
    //     options: userOptions
    //   },
    //   render: (row: Plot) => row.user?.name || '—'
    // },
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
            title={t('common.view', 'shared') || 'View'}>
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)}
            title={t('common.delete', 'shared') || 'Delete'}>
            <Trash2 size={16} className="text-danger" />
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">{t('plots.title', 'investments') || 'Plots'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsAuditModalOpen(true)} variant="outline" className="flex items-center gap-2">
            <History size={16} />
            {t('plots.edit_log', 'investments') || 'سجل التعديلات'}
          </Button>
          <Button onClick={() => navigate('/investments/plots/create')}>{t('plots.add', 'investments') || 'Add Plot'}</Button>
        </div>
      </div>
        <div className="flex flex-wrap items-center gap-3">
          <Input type="text" value={searchQuery} onChange={setSearchQuery} 
            placeholder={t('common.search', 'shared') || 'Search by code...'} 
            baseClasses={inputBaseClasses} className="w-64" />
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-text-muted">{t('plots.from_date', 'investments') || 'From:'}</label>
            <Input type="date" value={fromDate} onChange={(val) => setFromDate(val as string)} baseClasses={inputBaseClasses} className="w-40" />
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-text-muted">{t('plots.to_date', 'investments') || 'To:'}</label>
            <Input type="date" value={toDate} onChange={(val) => setToDate(val as string)} baseClasses={inputBaseClasses} className="w-40" />
          </div>
        </div>

      {error && <ErrorState message={error} onRetry={() => setPage(prev => prev)} />}
      
      {!error && (
        <DataTable 
          columns={columns} 
          data={plots} 
          rowKey="id" 
          loading={loading}
          emptyMessage={t('plots.no_records', 'investments') || 'No plots found'}
          sortColumn={sortColumn}
          sortOrder={sortOrder}
          onSort={handleSort}
          filters={filters}
          onFilterChange={handleFilterChange}
          pagination={tablePagination}
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title={t('common.delete', 'shared') || 'Delete'}
        message={t('common.delete_confirm', 'shared').replace("{name}" , "") || 'Are you sure you want to delete this?'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
        confirmLoading={confirmLoading}
      />
      
      <PlotAuditLogModal 
        isOpen={isAuditModalOpen} 
        onClose={() => setIsAuditModalOpen(false)} 
        // plotId is explicitly omitted to fetch global logs
      />
    </div>
  );
}
