import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import { getCreateIndustryTypeFormSchema } from '../../schemas/industryTypeForm.schema';
import type { IndustryType } from '../../../domain/entities/industryType';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { Dialog } from '../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { GenericCreateForm } from '../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import Input from '../../../../../core/presentation/layouts/ui/inputs/Input';
import { inputBaseClasses } from '../../../../../core/presentation/layouts/ui/inputs/styles';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { toast } from 'sonner';
import { Pencil, Trash2, Star, Check, X } from 'lucide-react';
import { getLocalizedName } from '../../../../../core/presentation/utils/helpes';

export function IndustryTypesPage() {
  const { t } = useLanguage();
  const { entities: items, getAll, create, update, remove, loading, error } = useEntityCrud<IndustryType>('/investments/industry-types', '/investments/industry-types');
  const entityName = t('industry_types.title', 'investments') || 'Industry Type';
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<IndustryType | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<IndustryType | null>(null);
  const [confirmSetDefault, setConfirmSetDefault] = useState<IndustryType | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const filtered = items.filter((c: any) => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => { getAll(); }, []);

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setConfirmLoading(true);
    try {
      await remove(confirmDelete.id);
      toast.success(t('industry_types.deleted', 'investments').replace('{name}', entityName));
    } catch {
      toast.error(t('industry_types.delete_error', 'investments').replace('{name}', entityName));
    }
    setConfirmDelete(null);
    setConfirmLoading(false);
  };

  const handleSetDefaultConfirm = async () => {
    if (!confirmSetDefault) return;
    setConfirmLoading(true);
    try {
      await update(confirmSetDefault.id, { ...confirmSetDefault, is_default: true });
      toast.success(t('common.set_default_success', 'shared')?.replace('{name}', entityName) || `${entityName} set as default successfully`);
      getAll();
    } catch {
      toast.error(t('common.set_default_error', 'shared')?.replace('{name}', entityName) || `Failed to set ${entityName} as default`);
    }
    setConfirmSetDefault(null);
    setConfirmLoading(false);
  };

  const columns = [
    {
      key: 'name',
      label: t('industry_types.name', 'investments') || 'Type Name',
      width: 250,
      render: (row: IndustryType) => getLocalizedName(row.name) 
    },
    {
      key: 'is_active',
      label: t('industry_types.is_active', 'investments') || 'Is Active?',
      width: 120,
      render: (row: IndustryType) => row.is_active
        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><Check size={12} /> {t('common.yes', 'shared') || 'Yes'}</span>
        : <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><X size={12} /> {t('common.no', 'shared') || 'No'}</span>
    },
    {
      key: 'is_default',
      label: t('industry_types.is_default', 'investments') || 'Default',
      width: 120,
      render: (row: IndustryType) => row.is_default
        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><Star size={12} /> {t('common.yes', 'shared') || 'Yes'}</span>
        : <span className="text-xs text-text-muted">—</span>
    },
    {
      key: 'actions',
      label: t('common.actions', 'shared') || 'Actions',
      width: 200,
      render: (row: IndustryType) => (
        <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
          {!row.is_default && (
            <Button variant="ghost" size="sm" onClick={() => setConfirmSetDefault(row)}
              title={t('common.set_default', 'shared') || 'Set as default'} requiredPermission="investments.industry-types.update">
              <Star size={16} />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setEditItem(row)}
            title={t('common.edit', 'shared') || 'Edit'} requiredPermission="investments.industry-types.update">
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)}
            title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.industry-types.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t('industry_types.title', 'investments')}</h1>
        <div className="w-full flex gap-2">
          <Input type="text" value={searchQuery} onChange={setSearchQuery}
            placeholder={t('common.search', 'shared') || 'Search...'}
            baseClasses={inputBaseClasses} className="w-60" />
            <Button onClick={() => setIsCreateOpen(true)} requiredPermission="investments.industry-types.create">{t('industry_types.add', 'investments')}</Button>
        </div>
      </div>

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('industry_types.add', 'investments')}>
        <GenericCreateForm
          fields={[
            { name: 'name', label: t('industry_types.name', 'investments'), required: true },
            { name: 'is_active', type: 'checkbox', label: t('industry_types.is_active', 'investments') },
            { name: 'is_default', type: 'checkbox', label: t('industry_types.is_default', 'investments') }
          ]}
          schema={getCreateIndustryTypeFormSchema(t)}
          onSubmit={async (data) => {
            try {
              return await create(data);
            } catch {
              toast.error(t('industry_types.create_error', 'investments').replace('{name}', entityName)); throw {};
            }
          }}
          onSuccess={() => { toast.success(t('industry_types.created', 'investments').replace('{name}', entityName)); getAll(); setIsCreateOpen(false); }}
          onCancel={() => setIsCreateOpen(false)}
          submitLabel={t('industry_types.add', 'investments')}
        />
      </Dialog>

      <Dialog isOpen={!!editItem} onClose={() => setEditItem(null)} title={t('common.edit', 'shared') + ' ' + entityName}>
        <GenericCreateForm
          fields={[
            { name: 'name', label: t('industry_types.name', 'investments'), required: true },
            { name: 'is_active', type: 'checkbox', label: t('industry_types.is_active', 'investments') },
            { name: 'is_default', type: 'checkbox', label: t('industry_types.is_default', 'investments') }
          ]}
          schema={getCreateIndustryTypeFormSchema(t)}
          defaultValues={editItem ? { name: editItem.name, is_active: Boolean(editItem.is_active), is_default: Boolean(editItem.is_default) } : undefined}
          onSubmit={async (data) => {
            try {
              await update(editItem!.id, data);
            } catch {
              toast.error(t('common.update_error', 'shared')?.replace('{name}', entityName) || `Failed to update ${entityName}`); throw {};
            }
          }}
          onSuccess={() => { toast.success(t('common.updated', 'shared')?.replace('{name}', entityName) || `${entityName} updated successfully`); getAll(); setEditItem(null); }}
          onCancel={() => setEditItem(null)}
          submitLabel={t('common.save', 'shared') || 'Save'}
        />
      </Dialog>

      {error && <ErrorState message={error} onRetry={getAll} />}
      {!error && (
        <DataTable columns={columns} data={filtered} rowKey="id" loading={loading}
          emptyMessage={t('industry_types.no_records', 'investments')} />
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        type="danger"
        title={t('common.confirm_delete_title', 'shared').replace('{entity}', entityName)}
        message={t('common.confirm_delete_message', 'shared').replace('{entity}', entityName)}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        confirmLoading={confirmLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        isOpen={!!confirmSetDefault}
        title={t('common.set_default_title', 'shared')?.replace('{entity}', entityName) || 'Set as default'}
        message={t('common.set_default_message', 'shared')?.replace('{entity}', entityName) || `Are you sure you want to set this ${entityName} as default?`}
        confirmLabel={t('common.set_default', 'shared') || 'Set as default'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        confirmLoading={confirmLoading}
        onConfirm={handleSetDefaultConfirm}
        onCancel={() => setConfirmSetDefault(null)}
      />
    </div>
  );
}
