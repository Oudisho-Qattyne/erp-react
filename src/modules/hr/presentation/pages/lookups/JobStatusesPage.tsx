import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../hooks';
import { JobStatusFormSchema } from '../../schemas/jobStatus/jobStatus.schema';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { Dialog } from '../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { GenericCreateForm } from '../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import Input from '../../../../../core/presentation/layouts/ui/inputs/Input';
import { inputBaseClasses } from '../../../../../core/presentation/layouts/ui/inputs/styles';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { LoadingState } from '../../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { toast } from 'sonner';
import { Pencil, Trash2, Star } from 'lucide-react';
import type { JobStatus } from '../../../domain/entities/jobStatus/jobStatus';

export function JobStatusesPage() {
  const { t } = useLanguage();
  const { entities: items, getAll, create, update, remove, loadingMap, errorMap } = useEntityCrud<JobStatus>('/hr/job-statuses', '/hr/job-statuses');
  const entity = t('lookups.tabs.job_statuses', 'hr') || 'Job Status';
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [confirmSetDefault, setConfirmSetDefault] = useState<any>(null);
  const filtered = items.filter((item: any) =>
    (typeof item.name === 'string' ? item.name : item.name?.ar || item.name?.en || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => { getAll(); }, []);

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await remove(confirmDelete.id);
      toast.success(t('lookups.deleted', 'hr').replace('{name}', entity));
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err?.message || t('lookups.delete_error', 'hr').replace('{name}', entity));
    }
  };

  const handleSetDefaultConfirm = async () => {
    if (!confirmSetDefault) return;
    try {
      await update(confirmSetDefault.id, { is_default: true });
      toast.success(t('lookups.set_default_success', 'hr').replace('{name}', entity));
      getAll();
      setConfirmSetDefault(null);
    } catch (err) {
      toast.error(err?.message || t('lookups.set_default_error', 'hr').replace('{name}', entity));
    }
  };

  const columns = [
    { key: 'name', label: t('employee_form.job_status', 'hr') || 'Job Status', width: 300,
      render: (row: any) => typeof row.name === 'string' ? row.name : (row.name?.ar || row.name?.en || '') },
    { key: 'is_default', label: t('common.is_default', 'shared') || 'Default', width: 120,
      render: (row: any) => row.is_default
        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><Star size={12} /> {t('common.yes', 'shared') || 'Yes'}</span>
        : <span className="text-xs text-text-muted">—</span> },
    { key: 'actions', label: t('common.actions', 'shared') || 'Actions', width: 200,
      render: (row: any) => (
        <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
          {!row.is_default && (
            <Button variant="ghost" size="sm" onClick={() => setConfirmSetDefault(row)}
              title={t('common.set_default', 'shared') || 'Set as default'} requiredPermission="hr.job-statuses.update">
              <Star size={16} />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setEditItem(row)}
            title={t('common.edit', 'shared') || 'Edit'} requiredPermission="hr.job-statuses.update">
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)}
            title={t('common.delete', 'shared') || 'Delete'} requiredPermission="hr.job-statuses.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
        </div>
      ) },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t('lookups.tabs.job_statuses', 'hr') || 'Job Statuses'}</h1>
        <div className="w-full flex gap-2">
          <Input type="text" value={searchQuery} onChange={setSearchQuery}
            placeholder={t('common.search', 'shared') || 'Search...'}
            baseClasses={inputBaseClasses} className="w-60" />
          <Button onClick={() => setIsCreateOpen(true)} requiredPermission="hr.job-statuses.create">{t('employee_form.add_job_status', 'hr') || 'Add Job Status'}</Button>
        </div>
      </div>

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}
        title={t('employee_form.add_job_status', 'hr') || 'Add Job Status'}>
        <GenericCreateForm
          fields={[{ name: 'name', type: 'alpha', label: t('employee_form.job_status', 'hr') || 'Job Status', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'Default', required: false, type: 'checkbox' }]}
          schema={JobStatusFormSchema}
          onSubmit={async (data) => { try { return await create({ ...data, name: data.name }); } catch (err) { toast.error(err?.message || t('lookups.create_error', 'hr').replace('{name}', entity)); throw {}; } }}
          onSuccess={() => { toast.success(t('lookups.created', 'hr').replace('{name}', entity)); getAll(); setIsCreateOpen(false); }}
          onCancel={() => setIsCreateOpen(false)}
          submitLabel={t('employee_form.add_job_status', 'hr') || 'Add Job Status'}
        />
      </Dialog>

      <Dialog isOpen={!!editItem} onClose={() => setEditItem(null)}
        title={t('common.edit', 'shared') + ' ' + entity}>
        <GenericCreateForm
          fields={[{ name: 'name', type: 'alpha', label: t('employee_form.job_status', 'hr') || 'Job Status', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'Default', required: false, type: 'checkbox' }]}
          schema={JobStatusFormSchema}
          defaultValues={editItem ? { name: typeof editItem.name === 'string' ? editItem.name : (editItem.name?.ar || editItem.name?.en || ''), is_default: Boolean(editItem.is_default) } : undefined}
          onSubmit={async (data) => { try { await update(editItem.id, { ...data, name: data.name }); } catch (err) { toast.error(err?.message || t('lookups.update_error', 'hr').replace('{name}', entity)); throw {}; } }}
          onSuccess={() => { toast.success(t('lookups.updated', 'hr').replace('{name}', entity)); getAll(); setEditItem(null); }}
          onCancel={() => setEditItem(null)}
          submitLabel={t('common.save', 'shared') || 'Save'}
        />
      </Dialog>

      {errorMap['getAll'] && <ErrorState message={errorMap['getAll']} onRetry={() => getAll()} />}
      {!errorMap['getAll'] && (
        <DataTable columns={columns} data={filtered} rowKey="id" loading={loadingMap['getAll']}
          emptyMessage={t('lookups.no_job_statuses', 'hr') || 'No job statuses found'} />
      )}

      <ConfirmDialog isOpen={!!confirmDelete} type="danger"
        title={t('common.confirm_delete_title', 'shared').replace('{entity}', entity)}
        message={t('common.confirm_delete_message', 'shared').replace('{entity}', entity)}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        confirmLoading={loadingMap['remove']}
        onConfirm={handleDeleteConfirm} onCancel={() => setConfirmDelete(null)} />

      <ConfirmDialog isOpen={!!confirmSetDefault}
        title={t('common.set_default_title', 'shared')?.replace('{entity}', entity) || 'Set as default'}
        message={t('common.set_default_message', 'shared')?.replace('{entity}', entity) || `Are you sure you want to set this ${entity} as default?`}
        confirmLabel={t('common.set_default', 'shared') || 'Set as default'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        confirmLoading={loadingMap['remove']}
        onConfirm={handleSetDefaultConfirm} onCancel={() => setConfirmSetDefault(null)} />
    </div>
  );
}
