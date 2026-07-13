import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import { getCreatePlotAreaFormSchema } from '../../schemas/plotAreaForm.schema';
import type { PlotArea } from '../../../domain/entities/plotArea';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { Dialog } from '../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { GenericCreateForm } from '../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import Input from '../../../../../core/presentation/layouts/ui/inputs/Input';
import { inputBaseClasses } from '../../../../../core/presentation/layouts/ui/inputs/styles';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { toast } from 'sonner';
import { AuditLog } from '../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { Pencil, Trash2, Star, Check, X, History } from 'lucide-react';

export function PlotAreasPage() {
  const { t } = useLanguage();
  const { entities: plotAreas, getAll, create, update, remove, loadingMap, errorMap } = useEntityCrud<PlotArea>('/investments/plot-areas', '/investments/plot-areas');
  const entityName = t('plot_areas.title', 'investments') || 'Plot Area';
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<PlotArea | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PlotArea | null>(null);
  const [confirmSetDefault, setConfirmSetDefault] = useState<PlotArea | null>(null);
  const [auditItem, setAuditItem] = useState<PlotArea | null>(null);

  const filtered = plotAreas.filter((c: any) => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => { getAll(); }, []);

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await remove(confirmDelete.id);
      toast.success(t('plot_areas.deleted', 'investments').replace('{name}', entityName));
    } catch (err: any) {
      toast.error(err?.message || t('plot_areas.delete_error', 'investments').replace('{name}', entityName));
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
      toast.error(err?.message || t('common.set_default_error', 'shared')?.replace('{name}', entityName) || `Failed to set ${entityName} as default`);
    }
    setConfirmSetDefault(null);
  };

  const columns = [
    {
      key: 'name',
      label: t('plot_areas.name', 'investments') || 'Area Name',
      width: 250,
      render: (row: PlotArea) => row.name
    },
    {
      key: 'is_active',
      label: t('plot_areas.is_active', 'investments') || 'Is Active?',
      width: 120,
      render: (row: PlotArea) => row.is_active
        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><Check size={12} /> {t('common.yes', 'shared') || 'Yes'}</span>
        : <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><X size={12} /> {t('common.no', 'shared') || 'No'}</span>
    },
    {
      key: 'is_default',
      label: t('plot_areas.is_default', 'investments') || 'Default',
      width: 120,
      render: (row: PlotArea) => row.is_default
        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><Star size={12} /> {t('common.yes', 'shared') || 'Yes'}</span>
        : <span className="text-xs text-text-muted">—</span>
    },
    {
      key: 'actions',
      label: t('common.actions', 'shared') || 'Actions',
      width: 200,
      render: (row: PlotArea) => (
        <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
          {!row.is_default && (
            <Button variant="ghost" size="sm" onClick={() => setConfirmSetDefault(row)}
              title={t('common.set_default', 'shared') || 'Set as default'} requiredPermission="investments.plot-areas.update">
              <Star size={16} />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setEditItem(row)}
            title={t('common.edit', 'shared') || 'Edit'} requiredPermission="investments.plot-areas.update">
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)}
            title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.plot-areas.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)}
            title={t('plot_areas.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
            <History size={16} />
          </Button>
        </div>
      )
    },
  ];

  const handleTranslateValues = (field: string, value: string) => {
    if (field === 'is_active' || field === 'is_default') {
      return value === 'true' ? (t('common.yes', 'shared') || 'Yes') : value === 'false' ? (t('common.no', 'shared') || 'No') : value;
    }
    return value;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t('plot_areas.title', 'investments')}</h1>
        <div className="w-full flex gap-2">
          <Input type="text" value={searchQuery} onChange={setSearchQuery}
            placeholder={t('common.search', 'shared') || 'Search...'}
            baseClasses={inputBaseClasses} className="w-60" />
            <Button onClick={() => setIsCreateOpen(true)} requiredPermission="investments.plot-areas.create">{t('plot_areas.add', 'investments')}</Button>
        </div>
      </div>

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('plot_areas.add', 'investments')}>
        <GenericCreateForm
          fields={[
            { name: 'name', label: t('plot_areas.name', 'investments'), required: true },
            { name: 'is_active', type: 'checkbox', label: t('plot_areas.is_active', 'investments') },
            { name: 'is_default', type: 'checkbox', label: t('plot_areas.is_default', 'investments') }
          ]}
          schema={getCreatePlotAreaFormSchema(t)}
          onSubmit={async (data) => {
            try {
              return await create(data);
    } catch (err: any) {
      toast.error(err?.message || t('plot_areas.create_error', 'investments').replace('{name}', entityName)); throw err;
    }
          }}
          onSuccess={() => { toast.success(t('plot_areas.created', 'investments').replace('{name}', entityName)); getAll(); setIsCreateOpen(false); }}
          onCancel={() => setIsCreateOpen(false)}
          submitLabel={t('plot_areas.add', 'investments')}
        />
      </Dialog>

      <Dialog isOpen={!!editItem} onClose={() => setEditItem(null)} title={t('common.edit', 'shared') + ' ' + entityName}>
        <GenericCreateForm
          fields={[
            { name: 'name', label: t('plot_areas.name', 'investments'), required: true },
            { name: 'is_active', type: 'checkbox', label: t('plot_areas.is_active', 'investments') },
            { name: 'is_default', type: 'checkbox', label: t('plot_areas.is_default', 'investments') }
          ]}
          schema={getCreatePlotAreaFormSchema(t)}
          defaultValues={editItem ? { name: editItem.name, is_active: Boolean(editItem.is_active), is_default: Boolean(editItem.is_default) } : undefined}
          onSubmit={async (data) => {
            try {
              await update(editItem!.id, data);
    } catch (err: any) {
      toast.error(err?.message || t('common.update_error', 'shared')?.replace('{name}', entityName) || `Failed to update ${entityName}`); throw err;
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
          emptyMessage={t('plot_areas.no_records', 'investments')} />
      )}

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

      <AuditLog
        isOpen={!!auditItem}
        onClose={() => setAuditItem(null)}
        model="plot_area"
        modelId={auditItem?.id}
        module="investments"
        labels={{
          title: t('plot_areas.edit_log', 'investments') || 'Edit Log',
          event: t('plot_areas.event', 'investments') || 'Event',
          created_at: t('plot_areas.created_at', 'investments') || 'Created At',
          changed_by: t('plot_areas.changed_by', 'investments') || 'Changed By',
          changes: t('plot_areas.changes', 'investments') || 'Changes',
          field: t('plot_areas.field', 'investments') || 'Field',
          old_value: t('plot_areas.old_value', 'investments') || 'Old Value',
          new_value: t('plot_areas.new_value', 'investments') || 'New Value',
          no_records: t('plot_areas.no_edit_log', 'investments') || 'No edit logs found',
          subject_id: t('plot_areas.subject_id', 'investments') || 'Plot Area ID',
        }}
        translateField={(key) => t(`plot_areas.${key}`, 'investments') || key}
        translateValues={handleTranslateValues}
      />

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
    </div>
  );
}
