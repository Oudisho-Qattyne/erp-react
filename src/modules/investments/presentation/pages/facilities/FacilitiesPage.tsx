import { useState, useMemo, useRef } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Facility } from '../../../domain/entities/facility';
import type { Plot } from '../../../domain/entities/plot';
import type { Dossier } from '../../../domain/entities/dossier';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { inputBaseClasses } from '../../../../../core/presentation/layouts/ui/inputs/styles';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { FilterDialog, type FilterField } from '../../../../../core/presentation/layouts/ui/filter/FilterDialog';
import { AuditLog } from '../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { toast } from 'sonner';
import { handleApiError } from '../../../../../core/presentation/utils/handleApiError';
import { Eye, Trash2, Search, History, Factory, Filter, X, MapPin, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLocalizedName } from '../../../../../core/presentation/utils/helpes';
import { PlotPickerDialog } from '../plots/components/PlotPickerDialog';
import { DossierPickerDialog } from '../plots/components/DossierPickerDialog';

export function FacilitiesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { entities: facilities, getAll, remove, loadingMap, errorMap, pagination, list } = useEntityCrud<Facility>(
    '/investments/facilities',
    '/investments/facilities',
    { listState: true }
  );

  const [localSearch, setLocalSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Facility | null>(null);
  const [auditItem, setAuditItem] = useState<Facility | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterPlotName, setFilterPlotName] = useState<string>('');
  const [filterDossierName, setFilterDossierName] = useState<string>('');
  const confirmedFilterRef = useRef<{ plotName: string; dossierName: string }>({ plotName: '', dossierName: '' });
  const [plotPickerOpen, setPlotPickerOpen] = useState(false);
  const [dossierPickerOpen, setDossierPickerOpen] = useState(false);
  const formRef = useRef<any>(null);

  const handlePlotPicked = (plots: Plot[]) => {
    const p = plots[0];
    if (p) {
      setFilterPlotName(`${p.code} - ${p.identifier}`);
      formRef.current?.setValue('plot_id', p.id);
    }
    setPlotPickerOpen(false);
  };

  const handleDossierPicked = (dossiers: Dossier[]) => {
    const d = dossiers[0];
    if (d) {
      setFilterDossierName(d.dossier_number);
      formRef.current?.setValue('plot_dossier_id', d.id);
    }
    setDossierPickerOpen(false);
  };

  const handleSearch = () => {
    list.setSearch(localSearch);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await remove(confirmDelete.id);
      toast.success(t('facilities.deleted', 'investments') || 'Facility deleted successfully');
      setConfirmDelete(null);
      getAll(`/investments/facilities?page=${list.page}&per_page=${list.perPage}`);
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
    }
  };

  const filterFields: FilterField[] = [
    {
      name: 'email',
      label: t('facilities.email', 'investments') || 'Email',
      type: 'text',
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
      name: 'plot_dossier_id',
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
                <Button variant="ghost" size="sm" onClick={() => { setFilterDossierName(''); form.setValue('plot_dossier_id', '') }}>
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
    email: (list.filter.email as string | undefined) || '',
    plot_id: (list.filter.plot_id as number | undefined) || '',
    plot_dossier_id: (list.filter.plot_dossier_id as number | undefined) || '',
  }), [list.filter]);

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val === '' || val === undefined) continue;
      if (key === 'plot_id' || key === 'plot_dossier_id') {
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
    if (parsed.plot_dossier_id) {
      confirmedFilterRef.current.dossierName = filterDossierName;
    } else {
      setFilterDossierName('');
      confirmedFilterRef.current.dossierName = '';
    }
    list.setFilter(parsed);
    list.setSearch('');
    setLocalSearch('');
    setIsFilterOpen(false);
  };

  const handleResetFilter = () => {
    list.resetFilter();
    setFilterPlotName('');
    setFilterDossierName('');
    confirmedFilterRef.current = { plotName: '', dossierName: '' };
    setLocalSearch('');
    setIsFilterOpen(false);
  };

  const handleTranslateValues = (field: string, value: string) => value;

  const columns = [
    { key: "name", label: t("facilities.name", "investments") || "Name", width: 180, sortable: true },
    {
      key: "partnership_type",
      label: t("facilities.partnership_type", "investments") || "Partnership Type",
      width: 150,
      render: (row: Facility) => row.partnership_type ? getLocalizedName(row.partnership_type.name) : '—',
    },
    { key: "city", label: t("facilities.city", "investments") || "City", width: 120 },
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
          <button type="button" onClick={() => window.open(`/investments/plots/${pid}/edit` , '_blank')} className="flex items-center gap-1.5 text-primary hover:underline cursor-pointer">
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
          <button type="button" onClick={() => window.open(`/investments/plots/${pid}/dossiers/${did}` , '_blank')} className="flex items-center gap-1.5 text-primary hover:underline cursor-pointer">
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
              window.open(`/investments/plots/${pid}/dossiers/${did}/facilities/${row.id}` , '_blank');
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
        <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} leftIcon={<Filter size={14} />}>
          {t('common.filter', 'shared') || 'Filter'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleResetFilter}>
          {t('common.reset', 'shared') || 'Reset'}
        </Button>
      </div>

      {errorMap["getAll"] ? (
        <ErrorState message={errorMap["getAll"]} onRetry={() => getAll(`/investments/facilities?page=${list.page}&per_page=${list.perPage}`)} />
      ) : (
        <DataTable
          columns={columns}
          data={facilities}
          rowKey="id"
          loading={loadingMap["getAll"]}
          emptyMessage={t('facilities.no_records', 'investments') || 'No facilities found'}
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

      <FilterDialog
        isOpen={isFilterOpen}
        fields={filterFields}
        initialValues={filterInitialValues}
        onFilter={handleApplyFilter}
        onCancel={() => {
          setFilterPlotName(confirmedFilterRef.current.plotName);
          setFilterDossierName(confirmedFilterRef.current.dossierName);
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

      <DossierPickerDialog
        isOpen={dossierPickerOpen}
        onClose={() => setDossierPickerOpen(false)}
        onConfirm={handleDossierPicked}
        multiple={false}
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
