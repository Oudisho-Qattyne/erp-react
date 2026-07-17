import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Dossier } from '../../../domain/entities/dossier';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { inputBaseClasses } from '../../../../../core/presentation/layouts/ui/inputs/styles';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { AuditLog } from '../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { toast } from 'sonner';
import { Eye, Trash2, Search, History, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const statusStyles: Record<string, { color: string; bg: string }> = {
  active: { color: '#16a34a', bg: '#dcfce7' },
  cancelled: { color: '#dc2626', bg: '#fef2f2' },
  allocatable: { color: '#2563eb', bg: '#dbeafe' },
  draft: { color: '#ca8a04', bg: '#fefce8' },
};

export function DossiersPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { entities: dossiers, getAll, remove, loadingMap, errorMap, pagination } = useEntityCrud<Dossier>('/investments/dossiers', '/investments/dossiers');

  const [localSearch, setLocalSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Dossier | null>(null);
  const [auditItem, setAuditItem] = useState<Dossier | null>(null);

  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (sortColumn) { params.append('sortColumn', sortColumn); params.append('sortOrder', sortOrder); }
    params.append('page', String(page));
    params.append('per_page', String(perPage));
    getAll(`/investments/dossiers?${params.toString()}`);
  }, [searchQuery, sortColumn, sortOrder, page, perPage]);

  const handleSearch = () => {
    setSearchQuery(localSearch);
    setPage(1);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await remove(confirmDelete.id);
      toast.success(t('dossier.deleted', 'investments') || 'Dossier deleted successfully');
      setConfirmDelete(null);
    } catch (err: any) {
      toast.error(err?.message || t('dossier.delete_error', 'investments') || 'Failed to delete dossier');
    }
  };

  const handleTranslateValues = (field: string, value: string) => {
    if (field === 'status') {
      return t(`dossier.status_${value}`, 'investments') || value;
    }
    return value;
  };

  const columns = [
    { key: "dossier_number", label: t("dossier.number", "investments") || "Dossier Number", width: 160, sortable: true },
    { key: "dossier_date", label: t("dossier.date", "investments") || "Dossier Date", width: 120, sortable: true },
    { key: "allocated_date", label: t("dossier.allocated_date", "investments") || "Allocated Date", width: 120, sortable: true },
    {
      key: "status",
      label: t("dossier.status", "investments") || "Status",
      width: 130,
      sortable: true,
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
      render: (row: Dossier) => row.plot?.code || row.plot?.identifier || row.plot_id?.toString() || '—',
    },
    {
      key: "notes",
      label: t("plots.notes", "investments") || "Notes",
      width: 200,
      render: (row: Dossier) => row.notes ? (
        <span className="truncate block max-w-[180px]" title={row.notes}>{row.notes}</span>
      ) : '—',
    },
    {
      key: "actions",
      label: t("common.actions", "shared") || "Actions",
      width: 120,
      render: (row: Dossier) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => {
            if (row.plot_id) {
              navigate(`/investments/plots/${row.plot_id}/dossiers/${row.id}`);
            }
          }} title={t('common.view', 'shared') || 'View'} requiredPermission="investments.plot-dossier.view"
            disabled={!row.plot_id}>
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
      </div>

      {errorMap["getAll"] ? (
        <ErrorState message={errorMap["getAll"]} onRetry={() => getAll(`/investments/dossiers?page=${page}&per_page=${perPage}`)} />
      ) : (
        <DataTable
          columns={columns}
          data={dossiers}
          rowKey="id"
          loading={loadingMap["getAll"]}
          emptyMessage={t('dossier.no_records', 'investments') || 'No dossiers found'}
          sortColumn={sortColumn}
          sortOrder={sortOrder}
          onSort={handleSort}
          pagination={{
            page: pagination?.currentPage || 1,
            totalPages: pagination?.lastPage || 1,
            totalItems: pagination?.total || 0,
            onPageChange: (newPage: number) => setPage(newPage),
            itemsPerPage: perPage,
            onItemsPerPageChange: (size: number) => { setPerPage(size); setPage(1); },
            itemsPerPageOptions: [10, 25, 50, 100],
          }}
        />
      )}

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
