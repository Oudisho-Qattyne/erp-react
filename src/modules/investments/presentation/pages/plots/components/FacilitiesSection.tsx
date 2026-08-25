import { useState, useMemo, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import type { Facility } from '../../../../domain/entities/facility';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { inputBaseClasses } from '../../../../../../core/presentation/layouts/ui/inputs/styles';
import { ErrorState } from '../../../../../../core/presentation/layouts/ui/state/ErrorState';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { ConfirmDialog } from '../../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { FilterDialog, type FilterField } from '../../../../../../core/presentation/layouts/ui/filter/FilterDialog';
import { ActiveFilters } from '../../../../../../core/presentation/layouts/ui/filter/ActiveFilters';
import { GenericCreateForm } from '../../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { SectionCard } from '../../../../../../core/presentation/layouts/ui/card/SectionCard';
import { AuditLog } from '../../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { getCreateFacilityFormSchema } from '../../../schemas/facilityForm.schema';
import { buildFacilityFormFields, buildFacilityFormGroups, buildFacilityDefaultValues } from '../../../forms/facilityFormConfig';
import type { PartnershipType } from '../../../../domain/entities/partnershipType';
import type { Country } from '../../../../../../core/domain/entities/regions/Country';
import type { ConsumptionMaterial } from '../../../../domain/entities/consumptionMaterial';
import { getLocalizedName } from '../../../../../../core/presentation/utils/helpes';
import { Factory, Plus, Eye, Pencil, Trash2, History, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { handleApiError } from '../../../../../../core/presentation/utils/handleApiError';
import { LoadingState } from '../../../../../../core/presentation/layouts/ui/state/LoadingState';

interface FacilitiesSectionProps {
  plotId: string;
  dossierId: string;
}

export function FacilitiesSection({ plotId, dossierId }: FacilitiesSectionProps) {
  const { t } = useLanguage();

  const { entities: facilities, create, update, remove, loadingMap, errorMap, list, pagination , getById:getFacilityById } = useEntityCrud<Facility>(
    `/investments/facilities?plot_id=${plotId}&plot_dossier_id=${dossierId}`,
    '/investments/facilities',
    { listState: true }
  );
  const { entities: partnershipTypes, getAll: laodPartnershipTypes, create: createPartnershipType } = useEntityCrud<PartnershipType>('/investments/partnership-types', '/investments/partnership-types');
  const { entities: countries, getAll: loadCountries, create: createCountry } = useEntityCrud<Country>('/shared-kernal/countries', '/shared-kernal/countries');
  const { entities: consumptionMaterials, getAll: loadConsumptionMaterials, create: createConsumptionMaterial } = useEntityCrud<ConsumptionMaterial>('/investments/consumable-materials', '/investments/consumable-materials');

  const [localSearch, setLocalSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [faclitiy , setFacility] = useState<Facility | null>(null) 
  const [deletingFacility, setDeletingFacility] = useState<Facility | null>(null);
  const [auditItem, setAuditItem] = useState<Facility | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);


  useEffect(() => {
    loadConsumptionMaterials()
    laodPartnershipTypes()
    loadCountries()
  } ,[])

  const loadFacility = useCallback(async (id: number) => {
    const res = await getFacilityById(id);
    if (res) setFacility(res.data);
  }, [getFacilityById]);

  useEffect(() => {
    if (editingFacility) loadFacility(editingFacility.id);
  } , [editingFacility, loadFacility])
  const handleSearch = () => {
    list.setSearch(localSearch);
  };

  const handleCreate = async (data: any) => {
    try {
      const res = await create({ ...data, plot_id: Number(plotId), plot_dossier_id: Number(dossierId) });
      toast.success(t('facilities.created', 'investments') || 'Facility created successfully');
      list.refresh();
      setIsCreateOpen(false);
      return res;
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
      throw err;
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingFacility) return;
    try {
      const res = await update(editingFacility.id, data);
      toast.success(t('facilities.updated', 'investments') || 'Facility updated successfully');
      list.refresh();
      setEditingFacility(null);
      return res;
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deletingFacility) return;
    try {
      await remove(deletingFacility.id);
      toast.success(t('facilities.deleted', 'investments') || 'Facility deleted successfully');
      setDeletingFacility(null);
      list.refresh();
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
    }
  };

  const fields = buildFacilityFormFields(t, { partnershipTypes , createPartnershipType, countries, loadCountries, createCountry, consumptionMaterials, loadConsumptionMaterials, createConsumptionMaterial });
  const formGroups = buildFacilityFormGroups(t);

  const filterFields: FilterField[] = [
    { name: 'email', label: t('facilities.email', 'investments') || 'Email', type: 'text' },
    {
      name: 'company_type',
      label: t('facilities.company_type', 'investments') || 'Company Type',
      type: 'select',
      options: [
        { value: '', label: t('common.all', 'shared') || 'All' },
        { value: 'existing', label: t('facilities.company_type_existing', 'investments') || 'ُExisting' },
        { value: 'under_incorporation', label: t('facilities.company_type_under_incorporation', 'investments') || 'Under Incorporation' },
      ],
    },
    {
      name: 'company_nationality_id',
      label: t('facilities.company_nationality', 'investments') || 'Nationality',
      type: 'select',
      searchable:true,
      options: [
        { value: '', label: t('common.all', 'shared') || 'All' },
        ...countries.map((c) => ({ value: c.id, label: getLocalizedName(c.name) })),
      ],
    },
    {
      name: 'partnership_type_id',
      label: t('facilities.partnership_type', 'investments') || 'Partnership Type',
      type: 'select',
      options: [
        { value: '', label: t('common.all', 'shared') || 'All' },
        ...partnershipTypes.map((p) => ({ value: p.id, label: getLocalizedName(p.name) })),
      ],
    },
    { name: 'number_or_patrols', label: t('facilities.number_or_patrols', 'investments') || 'Patrols', type: 'text' },
    { name: 'commercial_register_date', label: t('facilities.commercial_register_date', 'investments') || 'Register Date', type: 'date' },
    { name: 'from_commercial_register_date', label: t('facilities.from_commercial_register_date', 'investments') || 'From Register Date', type: 'date' },
    { name: 'to_commercial_register_date', label: t('facilities.to_commercial_register_date', 'investments') || 'To Register Date', type: 'date' },
    { name: 'from_created_at', label: t('facilities.from_created_at', 'investments') || 'From Created', type: 'date' },
    { name: 'to_created_at', label: t('facilities.to_created_at', 'investments') || 'To Created', type: 'date' },
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
      if (val === '' || val === undefined) { parsed[key] = undefined; continue; }
      if (key === 'company_nationality_id' || key === 'partnership_type_id') parsed[key] = Number(val);
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

  const handleTranslateValues = (field: string, value: string) => {
    if (field === 'company_type') {
      if (value === 'commercial_register') return t('facilities.commercial_register', 'investments') || 'Commercial Register';
      if (value === 'national_id') return t('facilities.national_id', 'investments') || 'National ID';
    }
    return value;
  };

  const columns = [
    { key: "name", label: t("facilities.name", "investments") || "Name", width: 180, sortable: true },
    {
      key: "partnership_type",
      label: t("facilities.partnership_type", "investments") || "Partnership Type",
      width: 150,
      render: (row: Facility) => row.partnership_type ? getLocalizedName(row.partnership_type.name) : '—',
    },
    { key: "first_phone_number", label: t("facilities.first_phone_number", "investments") || "Phone", width: 130 },
    { key: "email", label: t("facilities.email", "investments") || "Email", width: 180 },
    { key: "number_of_workers", label: t("facilities.number_of_workers", "investments") || "Workers", width: 100 },
    {
      key: "created_at",
      label: t("facilities.created_at", "investments") || "Created At",
      width: 160,
      sortable: true,
      render: (row: Facility) => row.created_at || '—',
    },
    {
      key: "actions",
      label: t("common.actions", "shared") || "Actions",
      width: 130,
      render: (row: Facility) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => window.open(`/investments/plots/${plotId}/dossiers/${dossierId}/facilities/${row.id}`, '_blank')} title={t('common.view', 'shared') || 'View'} requiredPermission="investments.facilities.view">
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setEditingFacility(row)} title={t('common.edit', 'shared') || 'Edit'} requiredPermission="investments.facilities.update">
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeletingFacility(row)} title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.facilities.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)} title={t('facilities.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
            <History size={16} />
          </Button>
        </div>
      )
    },
  ];

  return (
    <>
      <SectionCard
        title={t('facilities.title', 'investments') || 'Facilities'}
        icon={<Factory size={20} />}
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
          <Button variant="outline" size="sm" className="ms-auto" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus size={16} />} requiredPermission="investments.facilities.create">
            {t('facilities.add', 'investments') || 'Add Facility'}
          </Button>
        </div>

        <ActiveFilters filters={filterInitialValues} fields={filterFields} className="mt-1" />

        {errorMap["getAll"] ? (
          <ErrorState message={errorMap["getAll"]} onRetry={() => list.refresh()} />
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
      </SectionCard>

      <Dialog size='3xl' isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('facilities.add', 'investments') || 'Add Facility'}>
        <GenericCreateForm
          schema={getCreateFacilityFormSchema(t)}
          fields={fields}
          groups={formGroups}
          onSubmit={handleCreate}
          onSuccess={() => setIsCreateOpen(false)}
          onCancel={() => setIsCreateOpen(false)}
          submitLabel={t('facilities.add', 'investments') || 'Add Facility'}
        />
      </Dialog>

      <Dialog size='3xl' isOpen={!!editingFacility} onClose={() => setEditingFacility(null)} title={t('facilities.edit', 'investments') || 'Edit Facility'}>
        {editingFacility && (
          errorMap['getById'] ? (
            <ErrorState
              message={errorMap['getById']}
              retryLabel={t('common.retry', 'shared') || 'Retry'}
              onRetry={() => loadFacility(editingFacility.id)}
            />
          ) : loadingMap['getById'] || !faclitiy ? (
            <LoadingState message={t('facilities.loading', 'investments') || 'Loading facility...'} />
          ) : (
            <GenericCreateForm
              schema={getCreateFacilityFormSchema(t)}
              fields={fields}
              groups={formGroups}
              defaultValues={buildFacilityDefaultValues(faclitiy, consumptionMaterials)}
              onSubmit={handleUpdate}
              onSuccess={() => setEditingFacility(null)}
              onCancel={() => setEditingFacility(null)}
              submitLabel={t('common.edit', 'shared') || 'Edit'}
            />
          )
        )}
      </Dialog>

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

      <ConfirmDialog
        isOpen={!!deletingFacility}
        title={t('facilities.delete_title', 'investments') || 'Delete Facility'}
        message={t('facilities.delete_message', 'investments') || 'Are you sure you want to delete this facility?'}
        onConfirm={handleDelete}
        onCancel={() => setDeletingFacility(null)}
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
