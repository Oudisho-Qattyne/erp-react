import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import type { RentContract } from '../../../../domain/entities/rentContract';
import type { RentContractIndustry } from '../../../../domain/entities/rentContractIndustry';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { inputBaseClasses } from '../../../../../../core/presentation/layouts/ui/inputs/styles';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { ErrorState } from '../../../../../../core/presentation/layouts/ui/state/ErrorState';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { ConfirmDialog } from '../../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { FilterDialog, type FilterField } from '../../../../../../core/presentation/layouts/ui/filter/FilterDialog';
import { ActiveFilters } from '../../../../../../core/presentation/layouts/ui/filter/ActiveFilters';
import { GenericCreateForm } from '../../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { SectionCard } from '../../../../../../core/presentation/layouts/ui/card/SectionCard';
import { AuditLog } from '../../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { getCreateRentContractFormSchema } from '../../../schemas/rentContractForm.schema';
import { buildRentContractFormFields, buildRentContractFormGroups, buildRentContractDefaultValues } from '../../../forms/rentContractFormConfig';
import { FileSignature, Plus, Pencil, Trash2, History, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { handleApiError } from '../../../../../../core/presentation/utils/handleApiError';
import { getLocalizedName } from '../../../../../../core/presentation/utils/helpes';

interface RentContractSectionProps {
  plotId: string;
  dossierId: string;
}

export function RentContractSection({ plotId, dossierId }: RentContractSectionProps) {
  const { t } = useLanguage();

  const { entities: contracts, create, update, remove, loadingMap, errorMap, list, pagination } = useEntityCrud<RentContract>(
    `/investments/rent-contracts?dossier_id=${dossierId}`,
    '/investments/rent-contracts',
    { listState: true }
  );

  const { entities: industries, getAll: getIndustries } = useEntityCrud<RentContractIndustry>('/investments/rent-contract-industries', '/investments/rent-contract-industries');
  const { create: createIndustry } = useEntityCrud<RentContractIndustry>('/investments/rent-contract-industries', '/investments/rent-contract-industries');

  useEffect(() => {
    getIndustries('/investments/rent-contract-industries?is_active=true');
  }, [getIndustries]);

  const [localSearch, setLocalSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<RentContract | null>(null);
  const [deletingContract, setDeletingContract] = useState<RentContract | null>(null);
  const [auditItem, setAuditItem] = useState<RentContract | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = () => {
    list.setSearch(localSearch);
  };

  const handleCreate = async (data: any) => {
    try {
      const res = await create({ ...data, dossier_id: Number(dossierId), plot_id: Number(plotId) } as any);
      toast.success(t('rent_contract.created', 'investments') || 'Rent contract created successfully');
      list.refresh();
      setIsCreateOpen(false);
      return res;
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
      throw err;
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingContract) return;
    try {
      const res = await update(editingContract.id, { ...data, dossier_id: Number(dossierId) } as any);
      toast.success(t('rent_contract.updated', 'investments') || 'Rent contract updated successfully');
      list.refresh();
      setEditingContract(null);
      return res;
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deletingContract) return;
    try {
      await remove(deletingContract.id);
      toast.success(t('rent_contract.deleted', 'investments') || 'Rent contract deleted successfully');
      setDeletingContract(null);
      list.refresh();
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
    }
  };

  const fields = buildRentContractFormFields(t, { industries, createIndustry, getIndustries });
  const formGroups = buildRentContractFormGroups(t);

  const filterFields: FilterField[] = [
    {
      name: 'rent_contract_industry_id',
      label: t('rent_contract.rent_contract_industry_id', 'investments') || 'Industry',
      type: 'select',
      options: [
        { value: '', label: t('common.all', 'shared') || 'All' },
        ...industries.map((ind) => ({ value: ind.id, label: getLocalizedName(ind.name) })),
      ],
    },
    { name: 'renter_phone', label: t('rent_contract.renter_phone', 'investments') || 'Renter Phone', type: 'text' },
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
      if (key === 'dossier_id' || key === 'rent_contract_industry_id') parsed[key] = Number(val);
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

  const handleTranslateValues = (field: string, value: string) => value;

  const columns = [
    { key: "rent_contract_number", label: t("rent_contract.rent_contract_number", "investments") || "Contract No.", width: 140, sortable: true },
    { key: "rent_contract_date", label: t("rent_contract.rent_contract_date", "investments") || "Date", width: 120, sortable: true },
    { key: "renter_name", label: t("rent_contract.renter_name", "investments") || "Renter Name", width: 160, sortable: true },
    { key: "renter_phone", label: t("rent_contract.renter_phone", "investments") || "Phone", width: 130 },
    { key: "rent_area", label: t("rent_contract.rent_area", "investments") || "Area", width: 100 },
    {
      key: "rent_contract_industry_id",
      label: t("rent_contract.rent_contract_industry_id", "investments") || "Industry",
      width: 140,
      render: (row: RentContract) => getLocalizedName(row.rent_contract_industry?.name) || row.rent_contract_industry_id || '—',
    },
    {
      key: "created_at",
      label: t("rent_contract.created_at", "investments") || "Created At",
      width: 160,
      sortable: true,
      render: (row: RentContract) => row.created_at || '—',
    },
    {
      key: "actions",
      label: t("common.actions", "shared") || "Actions",
      width: 130,
      render: (row: RentContract) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => setEditingContract(row)} title={t('common.edit', 'shared') || 'Edit'} requiredPermission="investments.rent-contracts.update">
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeletingContract(row)} title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.rent-contracts.delete" >
            <Trash2 size={16} className="text-danger" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)} title={t('rent_contract.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
            <History size={16} />
          </Button>
        </div>
      )
    },
  ];

  return (
    <>
      <SectionCard
        title={t('rent_contract.title', 'investments') || 'Rent Contracts'}
        icon={<FileSignature size={20} />}
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
          <Button variant="outline" size="sm" className="ms-auto" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus size={16} />} requiredPermission="investments.rent-contracts.create">
            {t('rent_contract.add', 'investments') || 'Add Rent Contract'}
          </Button>
        </div>

        <ActiveFilters filters={filterInitialValues} fields={filterFields} className="mt-1" />

        {errorMap["getAll"] ? (
          <ErrorState message={errorMap["getAll"]} onRetry={() => list.refresh()} />
        ) : (
          <DataTable
            columns={columns}
            data={contracts}
            rowKey="id"
            loading={loadingMap["getAll"]}
            emptyMessage={t('rent_contract.no_records', 'investments') || 'No rent contracts found'}
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

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('rent_contract.add', 'investments') || 'Add Rent Contract'} size="3xl">
        <GenericCreateForm
          schema={getCreateRentContractFormSchema(t)}
          fields={fields}
          groups={formGroups}
          onSubmit={handleCreate}
          onSuccess={() => setIsCreateOpen(false)}
          onCancel={() => setIsCreateOpen(false)}
          submitLabel={t('rent_contract.add', 'investments') || 'Add Rent Contract'}
        />
      </Dialog>

      <Dialog isOpen={!!editingContract} onClose={() => setEditingContract(null)} title={t('rent_contract.edit', 'investments') || 'Edit Rent Contract'} size="3xl">
        {editingContract && (
          <GenericCreateForm
            schema={getCreateRentContractFormSchema(t)}
            fields={fields}
            groups={formGroups}
            defaultValues={buildRentContractDefaultValues(editingContract)}
            onSubmit={handleUpdate}
            onSuccess={() => setEditingContract(null)}
            onCancel={() => setEditingContract(null)}
            submitLabel={t('common.edit', 'shared') || 'Edit'}
          />
        )}
      </Dialog>

      <AuditLog
        isOpen={!!auditItem}
        onClose={() => setAuditItem(null)}
        model="rent_contract"
        modelId={auditItem?.id}
        module="investments"
        labels={{
          title: t('rent_contract.edit_log', 'investments') || 'Edit Log',
          event: t('rent_contract.event', 'investments') || 'Event',
          created_at: t('rent_contract.created_at', 'investments') || 'Created At',
          changed_by: t('rent_contract.changed_by', 'investments') || 'Changed By',
          changes: t('rent_contract.changes', 'investments') || 'Changes',
          field: t('rent_contract.field', 'investments') || 'Field',
          old_value: t('rent_contract.old_value', 'investments') || 'Old Value',
          new_value: t('rent_contract.new_value', 'investments') || 'New Value',
          no_records: t('rent_contract.no_edit_log', 'investments') || 'No edit logs found',
          subject_id: t('rent_contract.subject_id', 'investments') || 'Rent Contract ID',
        }}
        translateField={(key) => t(`rent_contract.${key}`, 'investments') || key}
        translateValues={handleTranslateValues}
      />

      <ConfirmDialog
        isOpen={!!deletingContract}
        title={t('rent_contract.delete_title', 'investments') || 'Delete Rent Contract'}
        message={t('rent_contract.delete_message', 'investments') || 'Are you sure you want to delete this rent contract?'}
        onConfirm={handleDelete}
        onCancel={() => setDeletingContract(null)}
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
