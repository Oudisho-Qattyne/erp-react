import { useState, useMemo } from 'react';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import type { FacilityIndustrialLicense } from '../../../../domain/entities/facilityIndustrialLicense';
import type { IndustryCategory } from '../../../../domain/entities/industryCategory';
import type { IndustryType } from '../../../../domain/entities/industryType';
import type { IndustrialDecisionType } from '../../../../domain/entities/industrialDecisionType';
import type { IndustrialLicenseSource } from '../../../../domain/entities/industrialLicenseSource';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { inputBaseClasses } from '../../../../../../core/presentation/layouts/ui/inputs/styles';
import { ErrorState } from '../../../../../../core/presentation/layouts/ui/state/ErrorState';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { FilterDialog, type FilterField } from '../../../../../../core/presentation/layouts/ui/filter/FilterDialog';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { ConfirmDialog } from '../../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { GenericCreateForm } from '../../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { SectionCard } from '../../../../../../core/presentation/layouts/ui/card/SectionCard';
import { getCreateFacilityIndustrialLicenseFormSchema } from '../../../schemas/facilityIndustrialLicenseForm.schema';
import { buildFacilityIndustrialLicenseFormFields, buildFacilityIndustrialLicenseFormGroups, buildFacilityIndustrialLicenseDefaultValues } from '../../../forms/facilityIndustrialLicenseFormConfig';
import { AuditLog } from '../../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { FileCheck, Plus, Pencil, Trash2, Eye, History, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { handleApiError } from '../../../../../../core/presentation/utils/handleApiError';
import { getLocalizedName } from '../../../../../../core/presentation/utils/helpes';

interface FacilityIndustrialLicensesSectionProps {
  facilityId: string;
}

export function FacilityIndustrialLicensesSection({ facilityId }: FacilityIndustrialLicensesSectionProps) {
  const { t } = useLanguage();

  const { entities: licenses, create, update, remove, loadingMap, errorMap, list, pagination } = useEntityCrud<FacilityIndustrialLicense>(
    `/investments/facility-industrial-licenses?facility_id=${facilityId}`,
    '/investments/facility-industrial-licenses',
    { listState: true }
  );

  const { entities: categories, getAll: getCategories, create: createCategory } = useEntityCrud<IndustryCategory>('/investments/industry-categories', '/investments/industry-categories');
  const { entities: industryTypes, getAll: getIndustryTypes, create: createIndustryType } = useEntityCrud<IndustryType>('/investments/industry-types', '/investments/industry-types');
  const { entities: decisionTypes, getAll: getDecisionTypes, create: createDecisionType } = useEntityCrud<IndustrialDecisionType>('/investments/industrial-decision-types', '/investments/industrial-decision-types');
  const { entities: licenseSources, getAll: getLicenseSources, create: createLicenseSource } = useEntityCrud<IndustrialLicenseSource>('/investments/industrial-license-sources', '/investments/industrial-license-sources');

  const [localSearch, setLocalSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<FacilityIndustrialLicense | null>(null);
  const [viewingLicense, setViewingLicense] = useState<FacilityIndustrialLicense | null>(null);
  const [deletingLicense, setDeletingLicense] = useState<FacilityIndustrialLicense | null>(null);
  const [auditItem, setAuditItem] = useState<FacilityIndustrialLicense | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = () => {
    list.setSearch(localSearch);
  };

  const handleCreate = async (data: any) => {
    try {
      const res = await create({ ...data, facility_id: Number(facilityId) });
      toast.success(t('facility_industrial_licenses.created', 'investments') || 'License created successfully');
      list.refresh();
      setIsCreateOpen(false);
      return res;
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
      throw err;
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingLicense) return;
    try {
      const res = await update(editingLicense.id, data);
      toast.success(t('facility_industrial_licenses.updated', 'investments') || 'License updated successfully');
      list.refresh();
      setEditingLicense(null);
      return res;
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deletingLicense) return;
    try {
      await remove(deletingLicense.id);
      toast.success(t('facility_industrial_licenses.deleted', 'investments') || 'License deleted successfully');
      setDeletingLicense(null);
      list.refresh();
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

  const filterInitialValues = useMemo(
    () => {
      const entries = Object.entries(list.filter).filter(([k]) => !['search', 'sortColumn', 'sortOrder'].includes(k));
      return Object.fromEntries(entries.map(([k, v]) => [k, v === undefined || v === null ? '' : v]));
    },
    [list.filter]
  );

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val === "" || val === undefined) { parsed[key] = undefined; continue; }
      parsed[key] = Number(val);
    }
    list.setFilter(parsed);
    list.setSearch('');
    setLocalSearch('');
    setIsFilterOpen(false);
  };

  const handleResetFilter = () => {
    list.resetFilter();
    setLocalSearch('');
    setIsFilterOpen(false);
  };

  const fields = buildFacilityIndustrialLicenseFormFields(t, { categories, createCategory, industryTypes, createIndustryType, decisionTypes, createDecisionType, licenseSources, createLicenseSource });
  const formGroups = buildFacilityIndustrialLicenseFormGroups(t);

  const columns = [
    { key: "industrial_decision_number", label: t("facility_industrial_licenses.decision_number", "investments") || "Decision #", width: 160, sortable: true },
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
      width: 120,
      render: (row: FacilityIndustrialLicense) => getLocalizedName(row.industrial_decision_type?.name) || '—',
    },
    {
      key: "industrial_license_source",
      label: t("facility_industrial_licenses.license_source", "investments") || "Source",
      width: 120,
      render: (row: FacilityIndustrialLicense) => getLocalizedName(row.industrial_license_source?.name) || '—',
    },
    {
      key: "created_at",
      label: t("facility_industrial_licenses.created_at", "investments") || "Created At",
      width: 160,
      sortable: true,
      render: (row: FacilityIndustrialLicense) => row.created_at || '—',
    },
    {
      key: "actions",
      label: t("common.actions", "shared") || "Actions",
      width: 130,
      render: (row: FacilityIndustrialLicense) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => setViewingLicense(row)} title={t('common.view', 'shared') || 'View'} requiredPermission="investments.facility-industrial-licenses.view">
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setEditingLicense(row) }} title={t('common.edit', 'shared') || 'Edit'} requiredPermission="investments.facility-industrial-licenses.update">
            <Pencil size={16} />
          </Button>
          {
            licenses.length > 1 &&
            <Button variant="ghost" size="sm" onClick={() => setDeletingLicense(row)} title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.facility-industrial-licenses.delete">
              <Trash2 size={16} className="text-danger" />
            </Button>
          }
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)} title={t('facility_industrial_licenses.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
            <History size={16} />
          </Button>
        </div>
      ),
    },
  ];

  const handleTranslateValues = (field: string, value: string) => {
    if (field === 'is_active') {
      return value === 'true' ? (t('common.yes', 'shared') || 'Yes') : value === 'false' ? (t('common.no', 'shared') || 'No') : value;
    }
    return value;
  };

  return (
    <>
      <SectionCard
        title={t('facility_industrial_licenses.title', 'investments') || 'Industrial Licenses'}
        icon={<FileCheck size={20} />}
      >
        <div className="flex items-center justify-between mb-4">
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
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={handleSearch}>
              {t('common.search', 'shared') || 'Search'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} leftIcon={<Filter size={14} />}>
              {t('common.filter', 'shared') || 'Filter'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetFilter}>
              {t('common.reset', 'shared') || 'Reset'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus size={16} />} requiredPermission="investments.facility-industrial-licenses.create">
              {t('facility_industrial_licenses.add', 'investments') || 'Add License'}
            </Button>
          </div>
        </div>
        {errorMap["getAll"] ? (
          <ErrorState message={errorMap["getAll"]} onRetry={() => list.refresh()} />
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
      </SectionCard>

      <Dialog size='3xl' isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('facility_industrial_licenses.add', 'investments') || 'Add License'}>
        <GenericCreateForm
          schema={getCreateFacilityIndustrialLicenseFormSchema(t)}
          fields={fields}
          groups={formGroups}
          onSubmit={handleCreate}
          onSuccess={() => setIsCreateOpen(false)}
          onCancel={() => setIsCreateOpen(false)}
          submitLabel={t('facility_industrial_licenses.add', 'investments') || 'Add License'}
        />
      </Dialog>

      <Dialog size='3xl' isOpen={!!editingLicense} onClose={() => setEditingLicense(null)} title={t('facility_industrial_licenses.edit', 'investments') || 'Edit License'}>
        {editingLicense && (
          <GenericCreateForm
            schema={getCreateFacilityIndustrialLicenseFormSchema(t)}
            fields={fields}
            groups={formGroups}
            defaultValues={buildFacilityIndustrialLicenseDefaultValues(editingLicense)}
            onSubmit={handleUpdate}
            onSuccess={() => setEditingLicense(null)}
            onCancel={() => setEditingLicense(null)}
            submitLabel={t('common.edit', 'shared') || 'Edit'}
          />
        )}
      </Dialog>

      <Dialog isOpen={!!viewingLicense} onClose={() => setViewingLicense(null)} title={t('facility_industrial_licenses.view', 'investments') || 'View License'} size="lg">
        {viewingLicense && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">{t('facility_industrial_licenses.decision_number', 'investments') || 'Decision Number'}</span>
                <p className="font-medium">{viewingLicense.industrial_decision_number}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{t('facility_industrial_licenses.decision_date', 'investments') || 'Decision Date'}</span>
                <p className="font-medium">{viewingLicense.industrial_decision_date}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{t('facility_industrial_licenses.industry_category', 'investments') || 'Industry Category'}</span>
                <p className="font-medium">{getLocalizedName(viewingLicense.industry_category?.name) || '—'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{t('facility_industrial_licenses.industry_type', 'investments') || 'Industry Type'}</span>
                <p className="font-medium">{getLocalizedName(viewingLicense.industry_type?.name) || '—'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{t('facility_industrial_licenses.decision_type', 'investments') || 'Decision Type'}</span>
                <p className="font-medium">{getLocalizedName(viewingLicense.industrial_decision_type?.name) || '—'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{t('facility_industrial_licenses.license_source', 'investments') || 'License Source'}</span>
                <p className="font-medium">{getLocalizedName(viewingLicense.industrial_license_source?.name) || '—'}</p>
              </div>
            </div>
          </div>
        )}
      </Dialog>

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

      <ConfirmDialog
        isOpen={!!deletingLicense}
        title={t('facility_industrial_licenses.delete_title', 'investments') || 'Delete License'}
        message={t('facility_industrial_licenses.delete_message', 'investments') || 'Are you sure you want to delete this license?'}
        onConfirm={handleDelete}
        onCancel={() => setDeletingLicense(null)}
        confirmLoading={loadingMap["remove"]}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
      />

      <FilterDialog
        isOpen={isFilterOpen}
        fields={filterFields}
        initialValues={filterInitialValues}
        onFilter={handleApplyFilter}
        onCancel={() => setIsFilterOpen(false)}
        onReset={handleResetFilter}
      />
    </>
  );
}
