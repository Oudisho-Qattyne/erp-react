import { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { BuildingLicense } from '../../../domain/entities/buildinglicense';
import type { Facility } from '../../../domain/entities/facility';
import type { LicensingStatus } from '../../../domain/entities/licensingStatus';
import type { ByDurationLicense } from '../../../domain/entities/byDurationLicense';
import type { ByIndustryLicense } from '../../../domain/entities/byIndustryLicense';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import Input from '../../../../../core/presentation/layouts/ui/inputs/Input';
import { inputBaseClasses } from '../../../../../core/presentation/layouts/ui/inputs/styles';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { FilterDialog, type FilterField } from '../../../../../core/presentation/layouts/ui/filter/FilterDialog';
import { AuditLog } from '../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { FacilityPickerDialog } from '../plots/components/FacilityPickerDialog';
import { toast } from 'sonner';
import { handleApiError } from '../../../../../core/presentation/utils/handleApiError';
import { Eye, Trash2, History, FileCheck, Filter, Factory, X, Search } from 'lucide-react';
import { getLocalizedName } from '../../../../../core/presentation/utils/helpes';

const FILTER_KEYS = ["facility_id", "licensing_status_id", "by_duration_license_id", "by_industry_license_id"];

export function BuildingLicensesPage() {
  const { t } = useLanguage();
  const { entities: licenses, getAll, remove, loadingMap, errorMap, pagination, list } = useEntityCrud<BuildingLicense>(
    '/investments/building-licenses',
    '/investments/building-licenses',
    { listState: true, defaultSortColumn: 'building_license_number', debounceMs: 300 }
  );

  const { entities: licensingStatuses, getAll: getLicensingStatuses } = useEntityCrud<LicensingStatus>('/investments/license-statuses', '/investments/license-statuses');
  const { entities: durationLicenses, getAll: getDurationLicenses } = useEntityCrud<ByDurationLicense>('/investments/by-duration-licenses', '/investments/by-duration-licenses');
  const { entities: industryLicenses, getAll: getIndustryLicenses } = useEntityCrud<ByIndustryLicense>('/investments/by-industry-licenses', '/investments/by-industry-licenses');

  const [confirmDelete, setConfirmDelete] = useState<BuildingLicense | null>(null);
  const [auditItem, setAuditItem] = useState<BuildingLicense | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFacilityPickerOpen, setIsFacilityPickerOpen] = useState(false);
  const [filterFacilityName, setFilterFacilityName] = useState('');
  const formRef = useRef<any>(null);
  const confirmedFilterRef = useRef({ facilityName: '' });

  useEffect(() => {
    getLicensingStatuses('/investments/license-statuses?is_active=true');
    getDurationLicenses('/investments/by-duration-licenses?is_active=true');
    getIndustryLicenses('/investments/by-industry-licenses?is_active=true');
  }, []);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await remove(confirmDelete.id);
      toast.success(t('building_license.deleted', 'investments') || 'License deleted successfully');
      setConfirmDelete(null);
      getAll(`/investments/building-licenses?page=${list.page}&per_page=${list.perPage}`);
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
    }
  };

  const selectOptions = (entities: { id: number; name: any }[]) => [
    { value: "", label: t('common.all', 'shared') || 'All' },
    ...entities.map((e) => ({ value: String(e.id), label: getLocalizedName(e.name) })),
  ];

  const filterFields: FilterField[] = [
    {
      name: "facility_id",
      render: (form) => {
        formRef.current = form;
        return (
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              {t('facilities.name', 'investments') || 'Facility'}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-sm text-text-muted">
                <Factory size={14} />
                {filterFacilityName || (t('common.all', 'shared') || 'All')}
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsFacilityPickerOpen(true)}>
                {t('common.select', 'shared') || 'Select'}
              </Button>
              {filterFacilityName && (
                <Button variant="ghost" size="sm" onClick={() => { setFilterFacilityName(''); form.setValue('facility_id', '') }}>
                  <X size={14} />
                </Button>
              )}
            </div>
          </div>
        );
      },
    },
    {
      name: "licensing_status_id",
      label: t('building_license.licensing_status_id', 'investments') || 'Licensing Status',
      type: "select",
      options: selectOptions(licensingStatuses),
    },
    {
      name: "by_duration_license_id",
      label: t('building_license.by_duration_license_id', 'investments') || 'Duration License',
      type: "select",
      options: selectOptions(durationLicenses),
    },
    {
      name: "by_industry_license_id",
      label: t('building_license.by_industry_license_id', 'investments') || 'Industry License',
      type: "select",
      options: selectOptions(industryLicenses),
    },
  ];

  const filterInitialValues = useMemo(() => {
    const values: Record<string, any> = {};
    for (const key of FILTER_KEYS) {
      const val = (list.filter as any)[key];
      values[key] = val === undefined || val === null ? '' : String(val);
    }
    return values;
  }, [list.filter]);

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val === '' || val === undefined) { parsed[key] = undefined; continue; }
      parsed[key] = String(val);
    }
    if (parsed.facility_id) {
      confirmedFilterRef.current.facilityName = filterFacilityName;
    } else {
      setFilterFacilityName('');
      confirmedFilterRef.current.facilityName = '';
    }
    list.setFilter(parsed);
    setIsFilterOpen(false);
  };

  const handleResetFilter = () => {
    list.resetFilter();
    setFilterFacilityName('');
    confirmedFilterRef.current.facilityName = '';
    setIsFilterOpen(false);
  };

  const handleFacilityPicked = (selected: Facility[]) => {
    const s = selected[0];
    if (s) {
      formRef.current?.setValue('facility_id', String(s.id));
      setFilterFacilityName(getLocalizedName(s.name));
    }
    setIsFacilityPickerOpen(false);
  };

  const handleTranslateValues = (field: string, value: string) => {
    if (field === 'is_active') {
      return value === 'true' ? (t('common.yes', 'shared') || 'Yes') : value === 'false' ? (t('common.no', 'shared') || 'No') : value;
    }
    return value;
  };

  const columns = [
    {
      key: "facility",
      label: t("facilities.name", "investments") || "Facility",
      width: 180,
      render: (row: BuildingLicense) => row.facility?.name || '—',
    },
    { key: "building_license_number", label: t("building_license.building_license_number", "investments") || "License Number", width: 160, sortable: true },
    { key: "building_license_date", label: t("building_license.building_license_date", "investments") || "Date", width: 120 },
    { key: "licensed_area", label: t("building_license.licensed_area", "investments") || "Area", width: 100 },
    {
      key: "licensing_status",
      label: t("building_license.licensing_status_id", "investments") || "Licensing Status",
      width: 140,
      render: (row: BuildingLicense) => getLocalizedName(row.licensing_status?.name) || '—',
    },
    {
      key: "by_duration_license",
      label: t("building_license.by_duration_license_id", "investments") || "Duration License",
      width: 140,
      render: (row: BuildingLicense) => getLocalizedName(row.by_duration_license?.name) || '—',
    },
    {
      key: "by_industry_license",
      label: t("building_license.by_industry_license_id", "investments") || "Industry License",
      width: 140,
      render: (row: BuildingLicense) => getLocalizedName(row.by_industry_license?.name) || '—',
    },
    { key: "administrative_license_decision_number", label: t("building_license.administrative_license_decision_number", "investments") || "Admin Decision", width: 150 },
    {
      key: "created_at",
      label: t("building_license.created_at", "investments") || "Created At",
      width: 180,
      sortable: true,
      render: (row: BuildingLicense) => row.created_at || '—',
    },
    {
      key: "actions",
      label: t("common.actions", "shared") || "Actions",
      width: 130,
      render: (row: BuildingLicense) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const plotId = row.facility?.plot_id || row.facility?.plot?.id;
              const dossierId = row.facility?.plot_dossier_id || row.facility?.plot_dossier?.id;
              if (plotId && dossierId) {
                window.open(`/investments/plots/${plotId}/dossiers/${dossierId}/facilities/${row.facility_id}`, '_blank');
              }
            }}
            title={t('common.view', 'shared') || 'View'}
            requiredPermission="investments.facilities.view"
          >
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)} title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.building-licenses.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)} title={t('building_license.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
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
          <FileCheck size={24} className="text-primary" />
          {t('building_license.title', 'investments') || 'Building Licenses'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            type="text"
            value={list.filter.search ?? ''}
            onChange={list.setSearch}
            placeholder={t('common.search', 'shared') || 'Search...'}
            baseClasses={inputBaseClasses}
            className="w-60 pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} leftIcon={<Filter size={14} />}>
          {t('common.filter', 'shared') || 'Filter'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleResetFilter}>
          {t('common.reset', 'shared') || 'Reset'}
        </Button>
      </div>

      {errorMap["getAll"] ? (
        <ErrorState message={errorMap["getAll"]} onRetry={() => getAll(`/investments/building-licenses?page=${list.page}&per_page=${list.perPage}`)} />
      ) : (
        <DataTable
          columns={columns}
          data={licenses}
          rowKey="id"
          loading={loadingMap["getAll"]}
          emptyMessage={t('building_license.no_records', 'investments') || 'No licenses found'}
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
        title={t('building_license.delete_title', 'investments') || 'Delete License'}
        message={t('building_license.delete_message', 'investments') || 'Are you sure you want to delete this license?'}
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
          setFilterFacilityName(confirmedFilterRef.current.facilityName);
          setIsFilterOpen(false);
        }}
        onReset={handleResetFilter}
      />

      <FacilityPickerDialog
        isOpen={isFacilityPickerOpen}
        onClose={() => setIsFacilityPickerOpen(false)}
        onConfirm={handleFacilityPicked}
        multiple={false}
      />

      <AuditLog
        isOpen={!!auditItem}
        onClose={() => setAuditItem(null)}
        model="building_license"
        modelId={auditItem?.id}
        module="investments"
        labels={{
          title: t('building_license.edit_log', 'investments') || 'Edit Log',
          event: t('building_license.event', 'investments') || 'Event',
          created_at: t('building_license.created_at', 'investments') || 'Created At',
          changed_by: t('building_license.changed_by', 'investments') || 'Changed By',
          changes: t('building_license.changes', 'investments') || 'Changes',
          field: t('building_license.field', 'investments') || 'Field',
          old_value: t('building_license.old_value', 'investments') || 'Old Value',
          new_value: t('building_license.new_value', 'investments') || 'New Value',
          no_records: t('building_license.no_edit_log', 'investments') || 'No edit logs found',
          subject_id: t('building_license.subject_id', 'investments') || 'License ID',
        }}
        translateField={(key) => t(`building_license.${key}`, 'investments') || key}
        translateValues={handleTranslateValues}
      />
    </div>
  );
}
