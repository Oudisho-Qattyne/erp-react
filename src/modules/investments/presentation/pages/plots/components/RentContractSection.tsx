import { useEffect, useState } from 'react';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import type { RentContract } from '../../../../domain/entities/rentContract';
import type { RentContractIndustry } from '../../../../domain/entities/rentContractIndustry';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { ErrorState } from '../../../../../../core/presentation/layouts/ui/state/ErrorState';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { ConfirmDialog } from '../../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { GenericCreateForm, type FieldConfig } from '../../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { SectionCard } from '../../../../../../core/presentation/layouts/ui/card/SectionCard';
import { AuditLog } from '../../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { getCreateRentContractFormSchema } from '../../../schemas/rentContractForm.schema';
import { getCreateRentContractIndustryFormSchema } from '../../../schemas/rentContractIndustryForm.schema';
import { FileSignature, Plus, Pencil, Trash2, History } from 'lucide-react';
import { toast } from 'sonner';
import { getLocalizedName } from '../../../../../../core/presentation/utils/helpes';

interface RentContractSectionProps {
  plotId: string;
  dossierId: string;
}

export function RentContractSection({ plotId, dossierId }: RentContractSectionProps) {
  const { t } = useLanguage();

  const baseUrl = `/investments/rent-contracts`;
  const { entities: contracts, getAll: getContracts, create: createContract, update: updateContract, remove: deleteContract, loadingMap, errorMap } = useEntityCrud<RentContract>(baseUrl, baseUrl);

  const { entities: industries, getAll: getIndustries } = useEntityCrud<RentContractIndustry>('/investments/rent-contract-industries', '/investments/rent-contract-industries');
  const { create: createIndustry } = useEntityCrud<RentContractIndustry>('/investments/rent-contract-industries', '/investments/rent-contract-industries');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<RentContract | null>(null);
  const [deletingContract, setDeletingContract] = useState<RentContract | null>(null);
  const [auditItem, setAuditItem] = useState<RentContract | null>(null);

  const listUrl = `/investments/rent-contracts?dossier_id=${dossierId}`;

  useEffect(() => {
    if (dossierId) getContracts(listUrl);
  }, [dossierId]);

  useEffect(() => {
    getIndustries('/investments/rent-contract-industries?is_active=true');
  }, []);

  const handleCreate = async (data: any) => {
    try {
      const res = await createContract({ ...data, dossier_id: Number(dossierId), plot_id: Number(plotId) });
      toast.success(t('rent_contract.created', 'investments') || 'Rent contract created successfully');
      getContracts(listUrl);
      setIsCreateOpen(false);
      return res;
    } catch (err: any) {
      toast.error(err?.message || t('rent_contract.create_error', 'investments') || 'Failed to create rent contract');
      throw err;
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingContract) return;
    try {
      const res = await updateContract(editingContract.id, { ...data, dossier_id: Number(dossierId) });
      toast.success(t('rent_contract.updated', 'investments') || 'Rent contract updated successfully');
      getContracts(listUrl);
      setEditingContract(null);
      return res;
    } catch (err: any) {
      toast.error(err?.message || t('rent_contract.update_error', 'investments') || 'Failed to update rent contract');
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deletingContract) return;
    try {
      await deleteContract(deletingContract.id);
      toast.success(t('rent_contract.deleted', 'investments') || 'Rent contract deleted successfully');
      getContracts(listUrl);
    } catch (err: any) {
      toast.error(err?.message || t('rent_contract.delete_error', 'investments') || 'Failed to delete rent contract');
    }
    setDeletingContract(null);
  };

  const fields: FieldConfig[] = [
    { name: 'renter_name', type: 'alpha', label: t('rent_contract.renter_name', 'investments') || 'Renter Name', required: true, group: 'renter_info' },
    { name: 'renter_phone', type: 'numeric', label: t('rent_contract.renter_phone', 'investments') || 'Phone', required: true, group: 'renter_info' },
    { name: 'rent_contract_number', type: 'numeric', label: t('rent_contract.rent_contract_number', 'investments') || 'Contract Number', required: true, group: 'contract_details' },
    { name: 'rent_contract_date', type: 'date', label: t('rent_contract.rent_contract_date', 'investments') || 'Contract Date', required: true, group: 'contract_details' },
    { name: 'rent_area', type: 'number', label: t('rent_contract.rent_area', 'investments') || 'Rent Area (㎡)', required: true, group: 'renter_info' },
    { name: 'rent_contract_duration', type: 'date', label: t('rent_contract.rent_contract_duration', 'investments') || 'Duration', required: true, group: 'contract_details' },
    {
      name: 'rent_contract_industry_id',
      type: 'select-or-create',
      searchable: true,
      label: t('rent_contract.rent_contract_industry_id', 'investments') || 'Industry',
      options: industries.map(i => ({ value: i.id, label: getLocalizedName(i.name), is_default: i.is_default })),
      createTitle: t('rent_contract_industries.add', 'investments') || 'Add Industry',
      renderCreateForm: (onSuccess, onCancel) => (
        <GenericCreateForm
          schema={getCreateRentContractIndustryFormSchema(t)}
          fields={[
            { name: 'name', type: 'alpha', label: t('rent_contract_industries.name', 'investments') || 'Name', required: true },
          ]}
          onSubmit={async (data) => {
            const res = await createIndustry(data);
            await getIndustries('/investments/rent-contract-industries?is_active=true');
            return res;
          }}
          onSuccess={(id, result) => {
            onSuccess(id ?? result?.data?.id, result?.data ?? result);
          }}
          onCancel={onCancel}
          submitLabel={t('rent_contract_industries.add', 'investments') || 'Add Industry'}
        />
      ),
      group: 'contract_details',
    },
  ];

  const formGroups = [
    { group: 'renter_info', title: t('rent_contract.group_renter_info', 'investments') || 'Renter Information', columns: 2 },
    { group: 'contract_details', title: t('rent_contract.group_contract_details', 'investments') || 'Contract Details', columns: 2 },
  ];

  const columns = [
    { key: "renter_name", label: t("rent_contract.renter_name", "investments") || "Renter Name", width: 160 },
    { key: "renter_phone", label: t("rent_contract.renter_phone", "investments") || "Phone", width: 130 },
    { key: "rent_contract_number", label: t("rent_contract.rent_contract_number", "investments") || "Contract No.", width: 130 },
    { key: "rent_contract_date", label: t("rent_contract.rent_contract_date", "investments") || "Date", width: 120 },
    { key: "rent_area", label: t("rent_contract.rent_area", "investments") || "Area", width: 100 },
    {
      key: "rent_contract_industry_id",
      label: t("rent_contract.rent_contract_industry_id", "investments") || "Industry",
      width: 140,
      render: (row: RentContract) => getLocalizedName(row.rent_contract_industry?.name) || row.rent_contract_industry_id || '—',
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
          <Button variant="ghost" size="sm" onClick={() => setDeletingContract(row)} title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.rent-contracts.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)} title={t('rent_contract.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
            <History size={16} />
          </Button>
        </div>
      )
    },
  ];

  const handleTranslateValues = (field: string, value: string) => {
    return value;
  };

  return (
    <>
      <SectionCard
        title={t('rent_contract.title', 'investments') || 'Rent Contracts'}
        icon={<FileSignature size={20} />}
      >
        <div className="flex items-center justify-between mb-4">
          <div />
          <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus size={16} />} requiredPermission="investments.rent-contracts.create">
            {t('rent_contract.add', 'investments') || 'Add Rent Contract'}
          </Button>
        </div>
        {errorMap["getAll"] ? (
          <ErrorState message={errorMap["getAll"]} onRetry={() => getContracts(listUrl)} />
        ) : (
          <DataTable
            columns={columns}
            data={contracts}
            rowKey="id"
            loading={loadingMap["getAll"]}
            emptyMessage={t('rent_contract.no_records', 'investments') || 'No rent contracts found'}
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
            defaultValues={{
              renter_name: editingContract.renter_name,
              renter_phone: editingContract.renter_phone,
              rent_contract_number: editingContract.rent_contract_number,
              rent_contract_date: editingContract.rent_contract_date,
              rent_area: editingContract.rent_area,
              rent_contract_duration: editingContract.rent_contract_duration,
              rent_contract_industry_id: editingContract.rent_contract_industry_id ?? null,
            }}
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
        title={t('rent_contract.deleted', 'investments') || 'Delete Rent Contract'}
        message={t('rent_contract.deleted', 'investments') || 'Are you sure you want to delete this rent contract?'}
        onConfirm={handleDelete}
        onCancel={() => setDeletingContract(null)}
        confirmLoading={loadingMap["remove"]}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
      />
    </>
  );
}
