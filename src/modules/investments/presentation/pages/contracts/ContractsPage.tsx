import { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Contract } from '../../../domain/entities/contract';
import type { Dossier } from '../../../domain/entities/dossier';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { inputBaseClasses } from '../../../../../core/presentation/layouts/ui/inputs/styles';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { FilterDialog, type FilterField } from '../../../../../core/presentation/layouts/ui/filter/FilterDialog';
import { AuditLog } from '../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { toast } from 'sonner';
import { Eye, Trash2, Search, History, FileSignature, Filter, X, MapPin, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DossierPickerDialog } from '../plots/components/DossierPickerDialog';

export function ContractsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { entities: contracts, getAll, remove, loadingMap, errorMap, pagination } = useEntityCrud<Contract>('/investments/contracts', '/investments/contracts');

  const [localSearch, setLocalSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Contract | null>(null);
  const [auditItem, setAuditItem] = useState<Contract | null>(null);

  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDossierId, setFilterDossierId] = useState<number | undefined>(undefined);
  const [filterDossierName, setFilterDossierName] = useState<string>('');
  const confirmedFilterRef = useRef<{ dossierName: string }>({ dossierName: '' });
  const [dossierPickerOpen, setDossierPickerOpen] = useState(false);
  const formRef = useRef<any>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (sortColumn) { params.append('sortColumn', sortColumn); params.append('sortOrder', sortOrder); }
    if (filterDossierId) params.append('dossier_id', String(filterDossierId));
    params.append('page', String(page));
    params.append('per_page', String(perPage));
    getAll(`/investments/contracts?${params.toString()}`);
  }, [searchQuery, sortColumn, sortOrder, page, perPage, filterDossierId]);

  const handleDossierPicked = (dossiers: Dossier[]) => {
    const d = dossiers[0];
    if (d) {
      setFilterDossierName(d.dossier_number);
      formRef.current?.setValue('dossier_id', d.id);
    }
    setDossierPickerOpen(false);
  };

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
      toast.success(t('contract.deleted', 'investments') || 'Contract deleted successfully');
      setConfirmDelete(null);
      getAll(`/investments/contracts?page=${page}&per_page=${perPage}`);
    } catch (err: any) {
      toast.error(err?.message || t('contract.delete_error', 'investments') || 'Failed to delete contract');
    }
  };

  const filterFields: FilterField[] = [
    {
      name: 'dossier_id',
      render: (form) => {
        formRef.current = form;
        return (
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              {t('dossier.number', 'investments') || 'Dossier'}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-sm text-text-muted">
                <FileText size={14} />
                {filterDossierName || (t('common.all', 'shared') || 'All')}
              </div>
              <Button variant="outline" size="sm" onClick={() => setDossierPickerOpen(true)}>
                {t('common.select', 'shared') || 'Select'}
              </Button>
              {filterDossierName && (
                <Button variant="ghost" size="sm" onClick={() => { setFilterDossierName(''); form.setValue('dossier_id', '') }}>
                  <X size={14} />
                </Button>
              )}
            </div>
          </div>
        );
      },
    },
  ];

  const filterInitialValues = useMemo(() => ({
    dossier_id: filterDossierId || '',
  }), [filterDossierId]);

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = { page: 1, per_page: perPage };
    for (const [key, val] of Object.entries(values)) {
      if (val === '' || val === undefined) continue;
      if (key === 'plot_id' || key === 'dossier_id') {
        parsed[key] = Number(val);
      } else {
        parsed[key] = val;
      }
    }
    if (parsed.dossier_id) {
      setFilterDossierId(parsed.dossier_id);
      confirmedFilterRef.current.dossierName = filterDossierName;
    } else {
      setFilterDossierId(undefined);
      setFilterDossierName('');
      confirmedFilterRef.current.dossierName = '';
    }
    setPage(1);
    setSearchQuery('');
    setLocalSearch('');
    setIsFilterOpen(false);
  };

  const handleResetFilter = () => {
    setFilterDossierId(undefined);
    setFilterDossierName('');
    confirmedFilterRef.current = { dossierName: '' };
    setIsFilterOpen(false);
  };

  const handleTranslateValues = (field: string, value: string) => {
    if (field === 'payment_method') {
      return t(`contract.payment_method_${value}`, 'investments') || value;
    }
    return value;
  };

  const columns = [
    { key: "contract_number", label: t("contract.contract_number", "investments") || "Contract Number", width: 160, sortable: true },
    { key: "contract_date", label: t("contract.contract_date", "investments") || "Date", width: 120, sortable: true },
    { key: "total_price", label: t("contract.total_price", "investments") || "Total", width: 130, sortable: true },
    {
      key: "payment_method",
      label: t("contract.payment_method", "investments") || "Payment",
      width: 110,
      render: (row: Contract) => t(`contract.payment_method_${row.payment_method}`, 'investments') || row.payment_method,
    },
    {
      key: "plot",
      label: t("plots.code", "investments") || "Code",
      width: 140,
      render: (row: Contract) => {
        const p = row.plot || row.dossier?.plot;
        const pid = row.plot_id || row.dossier?.plot_id;
        const label = p?.code || p?.identifier || pid?.toString() || '—';
        return pid ? (
          <button type="button" onClick={() => navigate(`/investments/plots/${pid}/edit`)} className="flex items-center gap-1.5 text-primary hover:underline cursor-pointer">
            <Eye size={14} />
            <span>{label}</span>
          </button>
        ) : <span>{label}</span>;
      },
    },
    {
      key: "dossier",
      label: t("dossier.number", "investments") || "Dossier Number",
      width: 140,
      render: (row: Contract) => {
        const did = row.dossier_id || row.dossier?.id;
        const pid = row.plot_id || row.dossier?.plot_id;
        const label = row.dossier?.dossier_number || did?.toString() || '—';
        return pid && did ? (
          <button type="button" onClick={() => navigate(`/investments/plots/${pid}/dossiers/${did}`)} className="flex items-center gap-1.5 text-primary hover:underline cursor-pointer">
            <Eye size={14} />
            <span>{label}</span>
          </button>
        ) : <span>{label}</span>;
      },
    },
    {
      key: "actions",
      label: t("common.actions", "shared") || "Actions",
      width: 120,
      render: (row: Contract) => {
        const pid = row.plot_id || row.dossier?.plot_id;
        const did = row.dossier_id || row.dossier?.id;
        return (
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="sm" onClick={() => {
              if (pid && did) {
                navigate(`/investments/plots/${pid}/dossiers/${did}/contract/${row.id}`);
              }
            }} title={t('common.view', 'shared') || 'View'} requiredPermission="investments.contracts.view">
              <Eye size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)} title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.contracts.delete">
              <Trash2 size={16} className="text-danger" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)} title={t('contract.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
              <History size={16} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileSignature size={24} className="text-primary" />
          {t('contract.title', 'investments') || 'Contracts'}
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
        <ErrorState message={errorMap["getAll"]} onRetry={() => getAll(`/investments/contracts?page=${page}&per_page=${perPage}`)} />
      ) : (
        <DataTable
          columns={columns}
          data={contracts}
          rowKey="id"
          loading={loadingMap["getAll"]}
          emptyMessage={t('contract.no_records', 'investments') || 'No contracts found'}
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
        title={t('contract.delete_title', 'investments') || 'Delete Contract'}
        message={t('contract.delete_message', 'investments') || 'Are you sure you want to delete this contract?'}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmLoading={loadingMap["remove"]}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
      />

      <FilterDialog
        isOpen={isFilterOpen}
        fields={filterFields}
        initialValues={filterInitialValues}
        onFilter={handleApplyFilter}
        onCancel={() => {
          setFilterDossierName(confirmedFilterRef.current.dossierName);
          setIsFilterOpen(false);
        }}
        onReset={handleResetFilter}
      />

      <DossierPickerDialog
        isOpen={dossierPickerOpen}
        onClose={() => setDossierPickerOpen(false)}
        onConfirm={handleDossierPicked}
        multiple={false}
      />

      <AuditLog
        isOpen={!!auditItem}
        onClose={() => setAuditItem(null)}
        model="contract"
        modelId={auditItem?.id}
        module="investments"
        labels={{
          title: t('contract.edit_log', 'investments') || 'Edit Log',
          event: t('contract.event', 'investments') || 'Event',
          created_at: t('contract.created_at', 'investments') || 'Created At',
          changed_by: t('contract.changed_by', 'investments') || 'Changed By',
          changes: t('contract.changes', 'investments') || 'Changes',
          field: t('contract.field', 'investments') || 'Field',
          old_value: t('contract.old_value', 'investments') || 'Old Value',
          new_value: t('contract.new_value', 'investments') || 'New Value',
          no_records: t('contract.no_edit_log', 'investments') || 'No edit logs found',
          subject_id: t('contract.subject_id', 'investments') || 'Contract ID',
        }}
        translateField={(key) => t(`contract.${key}`, 'investments') || key}
        translateValues={handleTranslateValues}
      />
    </div>
  );
}
