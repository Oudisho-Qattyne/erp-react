import { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { FacilityIndustrialLicense } from '../../../domain/entities/facilityIndustrialLicense';
import type { Facility } from '../../../domain/entities/facility';
import type { IndustryCategory } from '../../../domain/entities/industryCategory';
import type { IndustryType } from '../../../domain/entities/industryType';
import type { IndustrialDecisionType } from '../../../domain/entities/industrialDecisionType';
import type { IndustrialLicenseSource } from '../../../domain/entities/industrialLicenseSource';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { FilterDialog, type FilterField } from '../../../../../core/presentation/layouts/ui/filter/FilterDialog';
import { ActiveFilters } from '../../../../../core/presentation/layouts/ui/filter/ActiveFilters';
import { AuditLog } from '../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { FacilityPickerDialog } from '../plots/components/FacilityPickerDialog';
import { toast } from 'sonner';
import { handleApiError } from '../../../../../core/presentation/utils/handleApiError';
import { Eye, Trash2, History, FileCheck, Filter, Factory, X } from 'lucide-react';
import { getLocalizedName } from '../../../../../core/presentation/utils/helpes';

const FILTER_KEYS = ["facility_id", "industry_category_id", "industry_type_id", "industrial_decision_type_id", "industrial_license_source_id"];

export function FacilityIndustrialLicensesPage() {
  const { t } = useLanguage();
  const { entities: licenses, getAll, remove, loadingMap, errorMap, pagination, list } = useEntityCrud<FacilityIndustrialLicense>(
    '/investments/facility-industrial-licenses',
    '/investments/facility-industrial-licenses',
    { listState: true }
  );

  const { entities: categories, getAll: getCategories } = useEntityCrud<IndustryCategory>('/investments/industry-categories', '/investments/industry-categories');
  const { entities: industryTypes, getAll: getIndustryTypes } = useEntityCrud<IndustryType>('/investments/industry-types', '/investments/industry-types');
  const { entities: decisionTypes, getAll: getDecisionTypes } = useEntityCrud<IndustrialDecisionType>('/investments/industrial-decision-types', '/investments/industrial-decision-types');
  const { entities: licenseSources, getAll: getLicenseSources } = useEntityCrud<IndustrialLicenseSource>('/investments/industrial-license-sources', '/investments/industrial-license-sources');

  const [confirmDelete, setConfirmDelete] = useState<FacilityIndustrialLicense | null>(null);
  const [auditItem, setAuditItem] = useState<FacilityIndustrialLicense | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFacilityPickerOpen, setIsFacilityPickerOpen] = useState(false);
  const [filterFacilityName, setFilterFacilityName] = useState('');
  const formRef = useRef<any>(null);
  const confirmedFilterRef = useRef({ facilityName: '' });

  useEffect(() => {
    getCategories('/investments/industry-categories?is_active=true');
    getIndustryTypes('/investments/industry-types?is_active=true');
    getDecisionTypes('/investments/industrial-decision-types?is_active=true');
    getLicenseSources('/investments/industrial-license-sources?is_active=true');
  }, []);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await remove(confirmDelete.id);
      toast.success(t('facility_industrial_licenses.deleted', 'investments') || 'License deleted successfully');
      setConfirmDelete(null);
      getAll(`/investments/facility-industrial-licenses?page=${list.page}&per_page=${list.perPage}`);
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
      name: "industry_category_id",
      label: t('facility_industrial_licenses.industry_category', 'investments') || 'Category',
      type: "select",
      options: selectOptions(categories),
    },
    {
      name: "industry_type_id",
      label: t('facility_industrial_licenses.industry_type', 'investments') || 'Type',
      type: "select",
      options: selectOptions(industryTypes),
    },
    {
      name: "industrial_decision_type_id",
      label: t('facility_industrial_licenses.decision_type', 'investments') || 'Decision Type',
      type: "select",
      options: selectOptions(decisionTypes),
    },
    {
      name: "industrial_license_source_id",
      label: t('facility_industrial_licenses.license_source', 'investments') || 'Source',
      type: "select",
      options: selectOptions(licenseSources),
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
    { key: "industrial_decision_number", label: t("facility_industrial_licenses.decision_number", "investments") || "Decision #", width: 160, sortable: true },
    {
      key: "facility",
      label: t("facilities.name", "investments") || "Facility",
      width: 180,
      render: (row: FacilityIndustrialLicense) => row.facility?.name || '—',
    },
    {
      key: "industry_category",
      label: t("facility_industrial_licenses.industry_category", "investments") || "Category",
      width: 140,
      render: (row: FacilityIndustrialLicense) => getLocalizedName(row.industry_category?.name) || '—',
    },
    {
      key: "industry_type",
      label: t("facility_industrial_licenses.industry_type", "investments") || "Type",
      width: 140,
      render: (row: FacilityIndustrialLicense) => getLocalizedName(row.industry_type?.name) || '—',
    },
    { key: "industrial_decision_date", label: t("facility_industrial_licenses.decision_date", "investments") || "Date", width: 120, sortable: true },
    {
      key: "industrial_decision_type",
      label: t("facility_industrial_licenses.decision_type", "investments") || "Decision Type",
      width: 130,
      render: (row: FacilityIndustrialLicense) => getLocalizedName(row.industrial_decision_type?.name) || '—',
    },
    {
      key: "industrial_license_source",
      label: t("facility_industrial_licenses.license_source", "investments") || "Source",
      width: 130,
      render: (row: FacilityIndustrialLicense) => getLocalizedName(row.industrial_license_source?.name) || '—',
    },
    {
      key: "created_at",
      label: t("common.created_at", "shared") || "Created At",
      width: 150,
      sortable: true,
    },
    {
      key: "is_active",
      label: t("common.is_active", "shared") || "Active",
      width: 90,
      align: "center" as const,
      render: (row: FacilityIndustrialLicense) => row.is_active ? (t('common.yes', 'shared') || 'Yes') : (t('common.no', 'shared') || 'No'),
    },
    {
      key: "actions",
      label: t("common.actions", "shared") || "Actions",
      width: 130,
      render: (row: FacilityIndustrialLicense) => (
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
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)} title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.facility-industrial-licenses.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)} title={t('facility_industrial_licenses.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
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
          {t('facility_industrial_licenses.title', 'investments') || 'Industrial Licenses'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} leftIcon={<Filter size={14} />}>
          {t('common.filter', 'shared') || 'Filter'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleResetFilter}>
          {t('common.reset', 'shared') || 'Reset'}
        </Button>
      </div>

      <ActiveFilters filters={filterInitialValues} fields={filterFields} className="mt-1" />

      {errorMap["getAll"] ? (
        <ErrorState message={errorMap["getAll"]} onRetry={() => getAll(`/investments/facility-industrial-licenses?page=${list.page}&per_page=${list.perPage}`)} />
      ) : (
        <DataTable
          columns={columns}
          data={licenses}
          rowKey="id"
          loading={loadingMap["getAll"]}
          emptyMessage={t('facility_industrial_licenses.no_records', 'investments') || 'No licenses found'}
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
        title={t('facility_industrial_licenses.delete_title', 'investments') || 'Delete License'}
        message={t('facility_industrial_licenses.delete_message', 'investments') || 'Are you sure you want to delete this license?'}
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
        model="facility_industrial_license"
        modelId={auditItem?.id}
        module="investments"
        labels={{
          title: t('facility_industrial_licenses.edit_log', 'investments') || 'Edit Log',
          event: t('facility_industrial_licenses.event', 'investments') || 'Event',
          created_at: t('facility_industrial_licenses.created_at', 'investments') || 'Created At',
          changed_by: t('facility_industrial_licenses.changed_by', 'investments') || 'Changed By',
          changes: t('facility_industrial_licenses.changes', 'investments') || 'Changes',
          field: t('facility_industrial_licenses.field', 'investments') || 'Field',
          old_value: t('facility_industrial_licenses.old_value', 'investments') || 'Old Value',
          new_value: t('facility_industrial_licenses.new_value', 'investments') || 'New Value',
          no_records: t('facility_industrial_licenses.no_edit_log', 'investments') || 'No edit logs found',
          subject_id: t('facility_industrial_licenses.subject_id', 'investments') || 'License ID',
        }}
        translateField={(key) => t(`facility_industrial_licenses.${key}`, 'investments') || key}
        translateValues={handleTranslateValues}
      />
    </div>
  );
}