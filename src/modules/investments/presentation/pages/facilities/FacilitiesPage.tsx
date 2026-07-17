import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Facility } from '../../../domain/entities/facility';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { inputBaseClasses } from '../../../../../core/presentation/layouts/ui/inputs/styles';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { AuditLog } from '../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { toast } from 'sonner';
import { Eye, Trash2, Search, History, Factory } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FacilitiesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { entities: facilities, getAll, remove, loadingMap, errorMap, pagination } = useEntityCrud<Facility>('/investments/facilities', '/investments/facilities');

  const [localSearch, setLocalSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Facility | null>(null);
  const [auditItem, setAuditItem] = useState<Facility | null>(null);

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
    getAll(`/investments/facilities?${params.toString()}`);
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
      toast.success(t('facilities.deleted', 'investments') || 'Facility deleted successfully');
      setConfirmDelete(null);
      getAll(`/investments/facilities?page=${page}&per_page=${perPage}`);
    } catch (err: any) {
      toast.error(err?.message || t('facilities.delete_error', 'investments') || 'Failed to delete facility');
    }
  };

  const handleTranslateValues = (field: string, value: string) => value;

  const columns = [
    { key: "name", label: t("facilities.name", "investments") || "Name", width: 180, sortable: true },
    { key: "city", label: t("facilities.city", "investments") || "City", width: 120, sortable: true },
    { key: "first_phone_number", label: t("facilities.first_phone_number", "investments") || "Phone", width: 140 },
    { key: "email", label: t("facilities.email", "investments") || "Email", width: 180 },
    {
      key: "plot",
      label: t("plots.code", "investments") || "Code",
      width: 140,
      render: (row: Facility) => {
        const pid = row.plot?.id || row.plot_id;
        const label = row.plot?.code || row.plot?.identifier || '—';
        return pid ? (
          <button type="button" onClick={() => navigate(`/investments/plots/${pid}/edit`)} className="flex items-center gap-1.5 text-primary hover:underline cursor-pointer">
            <Eye size={14} />
            <span>{label}</span>
          </button>
        ) : <span>{label}</span>;
      },
    },
    {
      key: "plot_dossier",
      label: t("dossier.number", "investments") || "Dossier Number",
      width: 140,
      render: (row: Facility) => {
        const pid = row.plot?.id || row.plot_id;
        const did = row.plot_dossier?.id || row.plot_dossier_id;
        const label = row.plot_dossier?.dossier_number || '—';
        return pid && did ? (
          <button type="button" onClick={() => navigate(`/investments/plots/${pid}/dossiers/${did}`)} className="flex items-center gap-1.5 text-primary hover:underline cursor-pointer">
            <Eye size={14} />
            <span>{label}</span>
          </button>
        ) : <span>{label}</span>;
      },
    },
    { key: "number_of_workers", label: t("facilities.number_of_workers", "investments") || "Workers", width: 100, sortable: true },
    { key: "capital_in_usd", label: t("facilities.capital_in_usd", "investments") || "Capital (USD)", width: 140, sortable: true },
    {
      key: "actions",
      label: t("common.actions", "shared") || "Actions",
      width: 120,
      render: (row: Facility) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => {
            const pid = row.plot?.id || row.plot_id;
            const did = row.plot_dossier?.id || row.plot_dossier_id;
            if (pid && did) {
              navigate(`/investments/plots/${pid}/dossiers/${did}/facilities/${row.id}`);
            }
          }} title={t('common.view', 'shared') || 'View'} requiredPermission="investments.facilities.view">
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)} title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.facilities.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)} title={t('facilities.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
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
          <Factory size={24} className="text-primary" />
          {t('facilities.title', 'investments') || 'Facilities'}
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
        <ErrorState message={errorMap["getAll"]} onRetry={() => getAll(`/investments/facilities?page=${page}&per_page=${perPage}`)} />
      ) : (
        <DataTable
          columns={columns}
          data={facilities}
          rowKey="id"
          loading={loadingMap["getAll"]}
          emptyMessage={t('facilities.no_records', 'investments') || 'No facilities found'}
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
        title={t('facilities.delete_title', 'investments') || 'Delete Facility'}
        message={t('facilities.delete_message', 'investments') || 'Are you sure you want to delete this facility?'}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmLoading={loadingMap["remove"]}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
      />

      <AuditLog
        isOpen={!!auditItem}
        onClose={() => setAuditItem(null)}
        model="facility"
        modelId={auditItem?.id}
        module="investments"
        labels={{
          title: t('facilities.edit_log', 'investments') || 'Edit Log',
          event: t('facilities.event', 'investments') || 'Event',
          created_at: t('facilities.created_at', 'investments') || 'Created At',
          changed_by: t('facilities.changed_by', 'investments') || 'Changed By',
          changes: t('facilities.changes', 'investments') || 'Changes',
          field: t('facilities.field', 'investments') || 'Field',
          old_value: t('facilities.old_value', 'investments') || 'Old Value',
          new_value: t('facilities.new_value', 'investments') || 'New Value',
          no_records: t('facilities.no_edit_log', 'investments') || 'No edit logs found',
          subject_id: t('facilities.subject_id', 'investments') || 'Facility ID',
        }}
        translateField={(key) => t(`facilities.${key}`, 'investments') || key}
        translateValues={handleTranslateValues}
      />
    </div>
  );
}
