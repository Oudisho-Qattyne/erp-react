import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import { getCreateRentContractIndustryFormSchema } from '../../schemas/rentContractIndustryForm.schema';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { Dialog } from '../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { GenericCreateForm } from '../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import Input from '../../../../../core/presentation/layouts/ui/inputs/Input';
import { inputBaseClasses } from '../../../../../core/presentation/layouts/ui/inputs/styles';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { toast } from 'sonner';
import { handleApiError } from '../../../../../core/presentation/utils/handleApiError';
import { AuditLog } from '../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { Pencil, Trash2, Star, Check, X, History } from 'lucide-react';
import { getLocalizedName } from '../../../../../core/presentation/utils/helpes';
import type { RentContractIndustry } from '../../../domain/entities/rentContractIndustry';

export function RentContractIndustriesPage() {
  const { t } = useLanguage();
  const { entities: items, getAll, create, update, remove, loadingMap, errorMap } = useEntityCrud<RentContractIndustry>('/investments/rent-contract-industries', '/investments/rent-contract-industries');
  const entityName = t('rent_contract_industries.title', 'investments') || 'Rent Contract Industry';
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<RentContractIndustry | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<RentContractIndustry | null>(null);
  const [confirmSetDefault, setConfirmSetDefault] = useState<RentContractIndustry | null>(null);
  const [auditItem, setAuditItem] = useState<RentContractIndustry | null>(null);

  const filtered = items.filter((c: any) => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => { getAll(); }, []);

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await remove(confirmDelete.id);
      toast.success(t('rent_contract_industries.deleted', 'investments').replace('{name}', entityName));
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
    }
    setConfirmDelete(null);
  };

  const handleSetDefaultConfirm = async () => {
    if (!confirmSetDefault) return;
    try {
      await update(confirmSetDefault.id, { ...confirmSetDefault, is_default: true });
      toast.success(t('common.set_default_success', 'shared')?.replace('{name}', entityName) || `${entityName} set as default successfully`);
      getAll();
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
    }
    setConfirmSetDefault(null);
  };

  const handleTranslateValues = (field: string, value: string) => {
    if (field === 'is_active' || field === 'is_default') {
      return value === 'true' ? (t('common.yes', 'shared') || 'Yes') : value === 'false' ? (t('common.no', 'shared') || 'No') : value;
    }
    return value;
  };

  const columns = [
    {
      key: 'name',
      label: t('rent_contract_industries.name', 'investments') || 'Name',
      width: 250,
      render: (row: RentContractIndustry) => getLocalizedName(row.name)
    },
    {
      key: 'is_active',
      label: t('common.is_active', 'shared') || 'Is Active?',
      width: 120,
      render: (row: RentContractIndustry) => row.is_active
        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><Check size={12} /> {t('common.yes', 'shared') || 'Yes'}</span>
        : <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><X size={12} /> {t('common.no', 'shared') || 'No'}</span>
    },
    {
      key: 'is_default',
      label: t('common.is_default', 'shared') || 'Default',
      width: 120,
      render: (row: RentContractIndustry) => row.is_default
        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><Star size={12} /> {t('common.yes', 'shared') || 'Yes'}</span>
        : <span className="text-xs text-text-muted">—</span>
    },
    {
      key: 'actions',
      label: t('common.actions', 'shared') || 'Actions',
      width: 200,
      render: (row: RentContractIndustry) => (
        <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
          {!row.is_default && (
            <Button variant="ghost" size="sm" onClick={() => setConfirmSetDefault(row)}
              title={t('common.set_default', 'shared') || 'Set as default'} requiredPermission="investments.rent-contract-industries.update">
              <Star size={16} />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setEditItem(row)}
            title={t('common.edit', 'shared') || 'Edit'} requiredPermission="investments.rent-contract-industries.update">
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)}
            title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.rent-contract-industries.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)}
            title={t('rent_contract_industries.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
            <History size={16} />
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t('rent_contract_industries.title', 'investments')}</h1>
        <div className="w-full flex gap-2">
          <Input type="text" value={searchQuery} onChange={setSearchQuery}
            placeholder={t('common.search', 'shared') || 'Search...'}
            baseClasses={inputBaseClasses} className="w-60" />
            <Button onClick={() => setIsCreateOpen(true)} requiredPermission="investments.rent-contract-industries.create">{t('rent_contract_industries.add', 'investments')}</Button>
        </div>
      </div>

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('rent_contract_industries.add', 'investments')}>
        <GenericCreateForm
          fields={[
            { name: 'name', type: 'alpha', label: t('rent_contract_industries.name', 'investments'), required: true },
          ]}
          schema={getCreateRentContractIndustryFormSchema(t)}
          onSubmit={async (data) => {
            try {
              return await create(data);
    } catch (err: any) {
      handleApiError(err, { module: "investments" }); throw err;
    }
          }}
          onSuccess={() => { toast.success(t('rent_contract_industries.created', 'investments').replace('{name}', entityName)); getAll(); setIsCreateOpen(false); }}
          onCancel={() => setIsCreateOpen(false)}
          submitLabel={t('rent_contract_industries.add', 'investments')}
        />
      </Dialog>

      <Dialog isOpen={!!editItem} onClose={() => setEditItem(null)} title={t('common.edit', 'shared') + ' ' + entityName}>
        <GenericCreateForm
          fields={[
            { name: 'name', type: 'alpha', label: t('rent_contract_industries.name', 'investments'), required: true },
            { name: 'is_active', type: 'checkbox', label: t('common.is_active', 'shared') },
            { name: 'is_default', type: 'checkbox', label: t('common.is_default', 'shared') }
          ]}
          schema={getCreateRentContractIndustryFormSchema(t)}
          defaultValues={editItem ? { name: editItem.name, is_active: Boolean(editItem.is_active), is_default: Boolean(editItem.is_default) } : undefined}
          onSubmit={async (data) => {
            try {
              await update(editItem!.id, data);
    } catch (err: any) {
      handleApiError(err, { module: "investments" }); throw err;
    }
          }}
          onSuccess={() => { toast.success(t('common.updated', 'shared')?.replace('{name}', entityName) || `${entityName} updated successfully`); getAll(); setEditItem(null); }}
          onCancel={() => setEditItem(null)}
          submitLabel={t('common.save', 'shared') || 'Save'}
        />
      </Dialog>

      {errorMap['getAll'] && <ErrorState message={errorMap['getAll']} onRetry={() => getAll()} />}
      {!errorMap['getAll'] && (
        <DataTable columns={columns} data={filtered} rowKey="id" loading={loadingMap['getAll']}
          emptyMessage={t('rent_contract_industries.no_records', 'investments')} />
      )}

      <ConfirmDialog
        isOpen={!!confirmSetDefault}
        title={t('common.set_default_title', 'shared')?.replace('{entity}', entityName) || 'Set as default'}
        message={t('common.set_default_message', 'shared')?.replace('{entity}', entityName) || `Are you sure you want to set this ${entityName} as default?`}
        confirmLabel={t('common.set_default', 'shared') || 'Set as default'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        confirmLoading={loadingMap['remove']}
        onConfirm={handleSetDefaultConfirm}
        onCancel={() => setConfirmSetDefault(null)}
      />

      <AuditLog
        isOpen={!!auditItem}
        onClose={() => setAuditItem(null)}
        model="rent_contract_industry"
        modelId={auditItem?.id}
        module="investments"
        labels={{
          title: t('rent_contract_industries.edit_log', 'investments') || 'Edit Log',
          event: t('rent_contract_industries.event', 'investments') || 'Event',
          created_at: t('rent_contract_industries.created_at', 'investments') || 'Created At',
          changed_by: t('rent_contract_industries.changed_by', 'investments') || 'Changed By',
          changes: t('rent_contract_industries.changes', 'investments') || 'Changes',
          field: t('rent_contract_industries.field', 'investments') || 'Field',
          old_value: t('rent_contract_industries.old_value', 'investments') || 'Old Value',
          new_value: t('rent_contract_industries.new_value', 'investments') || 'New Value',
          no_records: t('rent_contract_industries.no_edit_log', 'investments') || 'No edit logs found',
          subject_id: t('rent_contract_industries.subject_id', 'investments') || 'Rent Contract Industry ID',
        }}
        translateField={(key) => t(`rent_contract_industries.${key}`, 'investments') || key}
        translateValues={handleTranslateValues}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        type="danger"
        title={t('common.confirm_delete_title', 'shared').replace('{entity}', entityName)}
        message={t('common.confirm_delete_message', 'shared').replace('{entity}', entityName)}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        confirmLoading={loadingMap['remove']}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
