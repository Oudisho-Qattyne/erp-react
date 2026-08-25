import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import type { Contract } from '../../../../domain/entities/contract';
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
import { getCreateContractFormSchema } from '../../../schemas/contractForm.schema';
import { buildContractFormFields, buildContractDefaultValues } from '../../../forms/contractFormConfig';
import { FileSignature, Plus, Eye, Pencil, Trash2, History, Search, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { handleApiError } from '../../../../../../core/presentation/utils/handleApiError';

interface ContractsSectionProps {
  plotId: string;
  dossierId: string;
}

export function ContractsSection({ plotId, dossierId }: ContractsSectionProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const { entities: contracts, create, update, remove, loadingMap, errorMap, list, pagination } = useEntityCrud<Contract>(
    `/investments/contracts?dossier_id=${dossierId}`,
    '/investments/contracts',
    { listState: true }
  );

  const [localSearch, setLocalSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null);
  const [auditItem, setAuditItem] = useState<Contract | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = () => {
    list.setSearch(localSearch);
  };

  const handleCreate = async (data: any) => {
    try {
      const res = await create({ ...data, dossier_id: Number(dossierId) } as any);
      toast.success(t('contract.created', 'investments') || 'Contract created successfully');
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
      toast.success(t('contract.updated', 'investments') || 'Contract updated successfully');
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
      toast.success(t('contract.deleted', 'investments') || 'Contract deleted successfully');
      setDeletingContract(null);
      list.refresh();
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
    }
  };

  const fields = buildContractFormFields(t);

  const filterFields: FilterField[] = [
    { name: 'contract_number', label: t('contract.contract_number', 'investments') || 'Contract Number', type: 'text' },
    {
      name: 'payment_method',
      label: t('contract.payment_method', 'investments') || 'Payment Method',
      type: 'select',
      options: [
        { value: '', label: t('common.all', 'shared') || 'All' },
        { value: 'cash', label: t('contract.payment_method_cash', 'investments') || 'Cash' },
        { value: 'installment', label: t('contract.payment_method_installment', 'investments') || 'Installment' },
      ],
    },
    { name: 'paid_full_amount', label: t('contract.paid_full_amount', 'investments') || 'Paid Full Amount', type: 'checkbox' },
    { name: 'from_date', label: t('contract.from_date', 'investments') || 'From Date', type: 'date' },
    { name: 'to_date', label: t('contract.to_date', 'investments') || 'To Date', type: 'date' },
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
      if (val === 'true') parsed[key] = true;
      else if (val === 'false') parsed[key] = false;
      else if (key === 'plot_id' || key === 'dossier_id') parsed[key] = Number(val);
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
    if (field === 'payment_method') {
      return t(`contract.payment_method_${value}`, 'investments') || value;
    }
    return value;
  };

  const columns = [
    { key: "contract_number", label: t("contract.contract_number", "investments") || "Contract Number", width: 160, sortable: true },
    { key: "contract_date", label: t("contract.contract_date", "investments") || "Date", width: 120, sortable: true },
    { key: "unit_price_per_square_meter", label: t("contract.unit_price_per_square_meter", "investments") || "Unit Price", width: 120 },
    { key: "weighting_factor", label: t("contract.weighting_factor", "investments") || "Weighting", width: 100 },
    { key: "final_price_per_square_meter", label: t("contract.final_price_per_square_meter", "investments") || "Final Price", width: 120 },
    { key: "total_price", label: t("contract.total_price", "investments") || "Total", width: 130, sortable: true },
    {
      key: "payment_method", label: t("contract.payment_method", "investments") || "Payment", width: 110,
      render: (row: Contract) => t(`contract.payment_method_${row.payment_method}`, 'investments') || row.payment_method
    },
    {
      key: "created_at",
      label: t("contract.created_at", "investments") || "Created At",
      width: 180,
      sortable: true,
      render: (row: Contract) => row.created_at || '—',
    },
    {
      key: "actions",
      label: t("common.actions", "shared") || "Actions",
      width: 130,
      render: (row: Contract) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => window.open(`/investments/plots/${plotId}/dossiers/${dossierId}/contract/${row.id}`, '_blank')} title={t('common.view', 'shared') || 'View'} requiredPermission="investments.contracts.view">
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setEditingContract(row)} title={t('common.edit', 'shared') || 'Edit'} requiredPermission="investments.contracts.update">
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeletingContract(row)} title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.contracts.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)} title={t('contract.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
            <History size={16} />
          </Button>
        </div>
      )
    },
  ];

  return (
    <>
      <SectionCard
        title={t('contract.title', 'investments') || 'Contracts'}
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
          {
            contracts.length == 0 &&
            <Button variant="outline" size="sm" className="ms-auto" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus size={16} />} requiredPermission="investments.contracts.create">
              {t('contract.add', 'investments') || 'Add Contract'}
            </Button>
          }
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
            emptyMessage={t('contract.no_records', 'investments') || 'No contracts found'}
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

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('contract.add', 'investments') || 'Add Contract'}>
        <GenericCreateForm
          schema={getCreateContractFormSchema(t)}
          fields={fields}
          onSubmit={handleCreate}
          onSuccess={() => setIsCreateOpen(false)}
          onCancel={() => setIsCreateOpen(false)}
          submitLabel={t('contract.add', 'investments') || 'Add Contract'}
        />
      </Dialog>

      <Dialog isOpen={!!editingContract} onClose={() => setEditingContract(null)} title={t('contract.edit', 'investments') || 'Edit Contract'}>
        {editingContract && (
          <GenericCreateForm
            schema={getCreateContractFormSchema(t)}
            fields={fields}
            defaultValues={buildContractDefaultValues(editingContract)}
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

      <ConfirmDialog
        isOpen={!!deletingContract}
        title={t('contract.delete_title', 'investments') || 'Delete Contract'}
        message={t('contract.delete_message', 'investments') || 'Are you sure you want to delete this contract?'}
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
