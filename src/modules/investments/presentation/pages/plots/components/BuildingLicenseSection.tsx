import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import type { BuildingLicense } from '../../../../domain/entities/buildinglicense';
import type { LicensingStatus } from '../../../../domain/entities/licensingStatus';
import type { ByDurationLicense } from '../../../../domain/entities/byDurationLicense';
import type { ByIndustryLicense } from '../../../../domain/entities/byIndustryLicense';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { inputBaseClasses } from '../../../../../../core/presentation/layouts/ui/inputs/styles';
import { ErrorState } from '../../../../../../core/presentation/layouts/ui/state/ErrorState';
import { LoadingState } from '../../../../../../core/presentation/layouts/ui/state/LoadingState';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { ConfirmDialog } from '../../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { FilterDialog, type FilterField } from '../../../../../../core/presentation/layouts/ui/filter/FilterDialog';
import { ActiveFilters } from '../../../../../../core/presentation/layouts/ui/filter/ActiveFilters';
import { GenericCreateForm } from '../../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { SectionCard } from '../../../../../../core/presentation/layouts/ui/card/SectionCard';
import { getCreateBuildingLicenseFormSchema } from '../../../schemas/buildingLicenseForm.schema';
import { buildBuildingLicenseFormFields, buildBuildingLicenseFormGroups, buildBuildingLicenseDefaultValues } from '../../../forms/buildingLicenseFormConfig';
import { AuditLog } from '../../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { FileText, Plus, Eye, Pencil, Trash2, History, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { handleApiError } from '../../../../../../core/presentation/utils/handleApiError';
import { getLocalizedName } from '../../../../../../core/presentation/utils/helpes';

interface BuildingLicenseSectionProps {
  facilityId: string;
}

export function BuildingLicenseSection({ facilityId }: BuildingLicenseSectionProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { entities: licenses, getById, create, update, remove, loadingMap, errorMap, list, pagination } = useEntityCrud<BuildingLicense>(
    `/investments/building-licenses?facility_id=${facilityId}`,
    '/investments/building-licenses',
    { listState: true }
  );

  const { entities: licensingStatuses, getAll: getLicensingStatuses, create: createLicensingStatus } = useEntityCrud<LicensingStatus>('/investments/license-statuses', '/investments/license-statuses');
  const { entities: durationLicenses, getAll: getDurationLicenses, create: createDurationLicense } = useEntityCrud<ByDurationLicense>('/investments/by-duration-licenses', '/investments/by-duration-licenses');
  const { entities: industryLicenses, getAll: getIndustryLicenses, create: createIndustryLicense } = useEntityCrud<ByIndustryLicense>('/investments/by-industry-licenses', '/investments/by-industry-licenses');

  useEffect(() => {
    getLicensingStatuses();
    getDurationLicenses();
    getIndustryLicenses();
  }, [getLicensingStatuses, getDurationLicenses, getIndustryLicenses]);

  const [localSearch, setLocalSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<BuildingLicense | null>(null);
  const [fullLicense, setFullLicense] = useState<BuildingLicense | null>(null);
  const [viewingLicense, setViewingLicense] = useState<BuildingLicense | null>(null);
  const [fullViewLicense, setFullViewLicense] = useState<BuildingLicense | null>(null);
  const [deletingLicense, setDeletingLicense] = useState<BuildingLicense | null>(null);
  const [auditItem, setAuditItem] = useState<BuildingLicense | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = () => {
    list.setSearch(localSearch);
  };

  const handleCreate = async (data: any) => {
    try {
      const res = await create({ ...data, facility_id: Number(facilityId) });
      toast.success(t('building_license.created', 'investments') || 'Building license created successfully');
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
      toast.success(t('building_license.updated', 'investments') || 'Building license updated successfully');
      list.refresh();
      setEditingLicense(null);
      setFullLicense(null);
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
      toast.success(t('building_license.deleted', 'investments') || 'Building license deleted successfully');
      setDeletingLicense(null);
      list.refresh();
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
    }
  };

  const fields = buildBuildingLicenseFormFields(t, { licensingStatuses, createLicensingStatus, durationLicenses, createDurationLicense, industryLicenses, createIndustryLicense });
  const formGroups = buildBuildingLicenseFormGroups(t);

  const selectOptions = (entities: { id: number; name?: any }[], fallback: (e: any) => string) => [
    { value: "", label: t('common.all', 'shared') || 'All' },
    ...entities.map((e) => ({ value: String(e.id), label: getLocalizedName(e.name) || fallback(e) })),
  ];

  const filterFields: FilterField[] = [
    {
      name: "licensing_status_id",
      label: t('building_license.licensing_status_id', 'investments') || 'Licensing Status',
      type: "select",
      options: selectOptions(licensingStatuses, (e) => String(e.id)),
    },
    {
      name: "by_duration_license_id",
      label: t('building_license.by_duration_license_id', 'investments') || 'Duration License',
      type: "select",
      options: selectOptions(durationLicenses, (e) => String(e.id)),
    },
    {
      name: "by_industry_license_id",
      label: t('building_license.by_industry_license_id', 'investments') || 'Industry License',
      type: "select",
      options: selectOptions(industryLicenses, (e) => String(e.id)),
    },
    { name: "from_building_license_date", label: t('building_license.from_building_license_date', 'investments') || 'From License Date', type: 'date' },
    { name: "to_building_license_date", label: t('building_license.to_building_license_date', 'investments') || 'To License Date', type: 'date' },
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
      if (['licensing_status_id', 'by_duration_license_id', 'by_industry_license_id'].includes(key)) parsed[key] = Number(val);
      else parsed[key] = val;
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

  const columns = [
    { key: "building_license_number", label: t("building_license.building_license_number", "investments") || "License Number", width: 160, sortable: true },
    { key: "building_license_date", label: t("building_license.building_license_date", "investments") || "License Date", width: 130 },
    { key: "licensed_area", label: t("building_license.licensed_area", "investments") || "Area", width: 100 },
    {
      key: "licensing_status",
      label: t("building_license.licensing_status_id", "investments") || "Licensing Status",
      width: 140,
      render: (row: BuildingLicense) => getLocalizedName(row.licensing_status?.name) || row.licensing_status_id || '—',
    },
    { key: "administrative_license_decision_number", label: t("building_license.administrative_license_decision_number", "investments") || "Admin Decision", width: 150 },
    {
      key: "created_at",
      label: t("building_license.created_at", "investments") || "Created At",
      width: 160,
      sortable: true,
      render: (row: BuildingLicense) => row.created_at || '—',
    },
    {
      key: "actions",
      label: t("common.actions", "shared") || "Actions",
      width: 130,
      render: (row: BuildingLicense) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={async () => { setViewingLicense(row); const res = await getById(row.id); if (res?.data) setFullViewLicense(res.data as BuildingLicense); }} title={t('common.view', 'shared') || 'View'} requiredPermission="investments.building-licenses.view">
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={async () => { setEditingLicense(row); const res = await getById(row.id); if (res?.data) setFullLicense(res.data as BuildingLicense); }} title={t('common.edit', 'shared') || 'Edit'} requiredPermission="investments.building-licenses.update">
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeletingLicense(row)} title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.building-licenses.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)} title={t('building_license.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
            <History size={16} />
          </Button>
        </div>
      )
    },
  ];

  return (
    <>
      <SectionCard
        title={t('building_license.title', 'investments') || 'Building Licenses'}
        icon={<FileText size={20} />}
      >
        <div className="flex items-center gap-3 mb-4">
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
          <Button variant="outline" size="sm" className="ms-auto" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus size={16} />} requiredPermission="investments.building-licenses.create">
            {t('building_license.add', 'investments') || 'Add Building License'}
          </Button>
        </div>

        <ActiveFilters filters={filterInitialValues} fields={filterFields} className="mt-1" />

        {errorMap["getAll"] ? (
          <ErrorState message={errorMap["getAll"]} onRetry={() => list.refresh()} />
        ) : (
          <DataTable
            columns={columns}
            data={licenses}
            rowKey="id"
            loading={loadingMap["getAll"]}
            emptyMessage={t('building_license.no_records', 'investments') || 'No building licenses found'}
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

      <Dialog size='3xl' isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('building_license.add', 'investments') || 'Add Building License'}>
        <GenericCreateForm
          schema={getCreateBuildingLicenseFormSchema(t)}
          fields={fields}
          groups={formGroups}
          onSubmit={handleCreate}
          onSuccess={() => setIsCreateOpen(false)}
          onCancel={() => setIsCreateOpen(false)}
          submitLabel={t('building_license.add', 'investments') || 'Add Building License'}
        />
      </Dialog>

      <Dialog size='3xl' isOpen={!!editingLicense} onClose={() => { setEditingLicense(null); setFullLicense(null); }} title={t('building_license.edit', 'investments') || 'Edit Building License'}>
        {editingLicense && loadingMap["getById"] && !fullLicense && (
          <LoadingState message={t('common.loading', 'shared') || 'Loading...'} />
        )}
        {editingLicense && fullLicense && (
          <GenericCreateForm
            schema={getCreateBuildingLicenseFormSchema(t)}
            fields={fields}
            groups={formGroups}
            defaultValues={buildBuildingLicenseDefaultValues(fullLicense)}
            onSubmit={handleUpdate}
            onSuccess={() => { setEditingLicense(null); setFullLicense(null); }}
            onCancel={() => { setEditingLicense(null); setFullLicense(null); }}
            submitLabel={t('common.edit', 'shared') || 'Edit'}
          />
        )}
      </Dialog>

      <Dialog isOpen={!!viewingLicense} onClose={() => { setViewingLicense(null); setFullViewLicense(null); }} title={t('building_license.view', 'investments') || 'View Building License'} size="lg">
        {viewingLicense && loadingMap["getById"] && !fullViewLicense && (
          <LoadingState message={t('common.loading', 'shared') || 'Loading...'} />
        )}
        {viewingLicense && fullViewLicense && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-text-muted">{t('building_license.building_license_number', 'investments') || 'License Number'}</span>
                <p className="font-medium">{fullViewLicense.building_license_number}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">{t('building_license.building_license_date', 'investments') || 'License Date'}</span>
                <p className="font-medium">{fullViewLicense.building_license_date}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">{t('building_license.licensed_area', 'investments') || 'Licensed Area'}</span>
                <p className="font-medium">{fullViewLicense.licensed_area}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">{t('building_license.licensing_status_id', 'investments') || 'Licensing Status'}</span>
                <p className="font-medium">{getLocalizedName(fullViewLicense.licensing_status?.name) || fullViewLicense.licensing_status_id || '—'}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">{t('building_license.date_of_displaying_license_info', 'investments') || 'Display Date'}</span>
                <p className="font-medium">{fullViewLicense.date_of_displaying_license_info}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">{t('building_license.administrative_license_decision_number', 'investments') || 'Admin Decision #'}</span>
                <p className="font-medium">{fullViewLicense.administrative_license_decision_number}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">{t('building_license.administrative_license_decision_date', 'investments') || 'Admin Decision Date'}</span>
                <p className="font-medium">{fullViewLicense.administrative_license_decision_date}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">{t('building_license.by_duration_license_id', 'investments') || 'Duration License'}</span>
                <p className="font-medium">{fullViewLicense.by_duration_license_id}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">{t('building_license.by_industry_license_id', 'investments') || 'Industry License'}</span>
                <p className="font-medium">{fullViewLicense.by_industry_license_id}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">{t('building_license.temp_administrative_license_expiration_date', 'investments') || 'Temp Expiration Date'}</span>
                <p className="font-medium">{fullViewLicense.temp_administrative_license_expiration_date}</p>
              </div>
            </div>
          </div>
        )}
      </Dialog>

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
          subject_id: t('building_license.subject_id', 'investments') || 'Building License ID',
        }}
        translateField={(key) => t(`building_license.${key}`, 'investments') || key}
      />

      <ConfirmDialog
        isOpen={!!deletingLicense}
        title={t('building_license.delete_title', 'investments') || 'Delete Building License'}
        message={t('building_license.delete_message', 'investments') || 'Are you sure you want to delete this building license?'}
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
