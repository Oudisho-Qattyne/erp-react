import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import type { Contract } from '../../../../domain/entities/contract';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { ErrorState } from '../../../../../../core/presentation/layouts/ui/state/ErrorState';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { ConfirmDialog } from '../../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { GenericCreateForm } from '../../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { SectionCard } from '../../../../../../core/presentation/layouts/ui/card/SectionCard';
import { AuditLog } from '../../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { getCreateContractFormSchema } from '../../../schemas/contractForm.schema';
import { buildContractFormFields, buildContractDefaultValues } from '../../../forms/contractFormConfig';
import { FileSignature, Plus, Eye, Pencil, Trash2, History } from 'lucide-react';
import { toast } from 'sonner';
import { handleApiError } from '../../../../../../core/presentation/utils/handleApiError';

interface ContractsSectionProps {
  plotId: string;
  dossierId: string;
}

export function ContractsSection({ plotId, dossierId }: ContractsSectionProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const baseUrl = `/investments/contracts`;
  const { entities: contracts, getAll: getContracts, create: createContract, update: updateContract, remove: deleteContract, loadingMap, errorMap } = useEntityCrud<Contract>(baseUrl, baseUrl);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null);
  const [auditItem, setAuditItem] = useState<Contract | null>(null);

  const listUrl = `/investments/contracts?dossier_id=${dossierId}`;

  useEffect(() => {
    if (dossierId) getContracts(listUrl);
  }, [dossierId]);

  const handleCreate = async (data: any) => {
    try {
      const res = await createContract({ ...data, dossier_id: Number(dossierId) });
      toast.success(t('contract.created', 'investments') || 'Contract created successfully');
      getContracts(listUrl);
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
      const res = await updateContract(editingContract.id, { ...data, dossier_id: Number(dossierId) });
      toast.success(t('contract.updated', 'investments') || 'Contract updated successfully');
      getContracts(listUrl);
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
      await deleteContract(deletingContract.id);
      toast.success(t('contract.deleted', 'investments') || 'Contract deleted successfully');
      getContracts(listUrl);
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
    }
    setDeletingContract(null);
  };

  const fields = buildContractFormFields(t);

  const columns = [
    { key: "contract_number", label: t("contract.contract_number", "investments") || "Contract Number", width: 160 },
    { key: "contract_date", label: t("contract.contract_date", "investments") || "Date", width: 120 },
    { key: "unit_price_per_square_meter", label: t("contract.unit_price_per_square_meter", "investments") || "Unit Price", width: 120 },
    { key: "weighting_factor", label: t("contract.weighting_factor", "investments") || "Weighting", width: 100 },
    { key: "final_price_per_square_meter", label: t("contract.final_price_per_square_meter", "investments") || "Final Price", width: 120 },
    { key: "total_price", label: t("contract.total_price", "investments") || "Total", width: 130 },
    {
      key: "payment_method", label: t("contract.payment_method", "investments") || "Payment", width: 110,
      render: (row: Contract) => t(`contract.payment_method_${row.payment_method}`, 'investments') || row.payment_method
    },
    {
      key: "actions",
      label: t("common.actions", "shared") || "Actions",
      width: 130,
      render: (row: Contract) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/investments/plots/${plotId}/dossiers/${dossierId}/contract/${row.id}`)} title={t('common.view', 'shared') || 'View'} requiredPermission="investments.contracts.view">
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

  const handleTranslateValues = (field: string, value: string) => {
    if (field === 'payment_method') {
      return t(`contract.payment_method_${value}`, 'investments') || value;
    }
    return value;
  };

  return (
    <>
      <SectionCard
        title={t('contract.title', 'investments') || 'Contracts'}
        icon={<FileSignature size={20} />}
      >
        <div className="flex items-center justify-between mb-4">
          <div />
          {
            contracts.length == 0 &&

            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus size={16} />} requiredPermission="investments.contracts.create">
              {t('contract.add', 'investments') || 'Add Contract'}
            </Button>
          }
        </div>
        {errorMap["getAll"] ? (
          <ErrorState message={errorMap["getAll"]} onRetry={() => getContracts(listUrl)} />
        ) : (
          <DataTable
            columns={columns}
            data={contracts}
            rowKey="id"
            loading={loadingMap["getAll"]}
            emptyMessage={t('contract.no_records', 'investments') || 'No contracts found'}
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
    </>
  );
}
