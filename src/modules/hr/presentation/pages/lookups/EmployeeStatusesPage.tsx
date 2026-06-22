import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../hooks';
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
import type { EmployeeStatus } from '../../../domain/entities/employeeStatus/employeeStatus';
import { EmployeeStatusFormSchema } from '../../schemas/employeeStatus/EmployeeStatus';

export function EmployeeStatusesPage() {
  const { t } = useLanguage();
  const { entities: items, getAll, create, update, remove, loading, error } = useEntityCrud<EmployeeStatus>('/hr/employee-statuses', '/hr/employee-statuses');
  const entity = t('lookups.tabs.employee_statuses', 'hr') || 'Employee Status';
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
    } catch {
      toast.error(t('lookups.delete_error', 'hr').replace('{name}', entity));
    }
    setConfirmDelete(null);
  };

  const handleSetDefaultConfirm = async () => {
    if (!confirmSetDefault) return;
    try {
      await update(confirmSetDefault.id, { is_default: true });
      toast.success(t('lookups.set_default_success', 'hr').replace('{name}', entity));
      getAll();
    } catch {
      toast.error(t('lookups.set_default_error', 'hr').replace('{name}', entity));
    }
    setConfirmSetDefault(null);
  };

  const columns = [
    { key: 'name', label: t('employee_form.employee_status', 'hr') || 'Employee Status', width: 300,
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
              title={t('common.set_default', 'shared') || 'Set as default'}>
              <Star size={16} />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setEditItem(row)}
            title={t('common.edit', 'shared') || 'Edit'}>
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)}
            title={t('common.delete', 'shared') || 'Delete'}>
            <Trash2 size={16} className="text-danger" />
          </Button>
        </div>
      ) },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t('lookups.tabs.employee_statuses', 'hr') || 'Employee Statuses'}</h1>
        <div className="w-full flex gap-2">
          <Input type="text" value={searchQuery} onChange={setSearchQuery}
            placeholder={t('common.search', 'shared') || 'Search...'}
            baseClasses={inputBaseClasses} className="w-60" />
          <Button onClick={() => setIsCreateOpen(true)}>{t('employee_form.add_employee_status', 'hr') || 'Add Employee Status'}</Button>
        </div>
      </div>

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}
        title={t('employee_form.add_employee_status', 'hr') || 'Add Employee Status'}>
        <GenericCreateForm
          fields={[{ name: 'name', label: t('employee_form.employee_status', 'hr') || 'Employee Status', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'Default', required: false, type: 'checkbox' }]}
          schema={EmployeeStatusFormSchema}
          onSubmit={async (data) => { try { return await create({ ...data, name: { ar: data.name } }); } catch { toast.error(t('lookups.create_error', 'hr').replace('{name}', entity)); throw {}; } }}
          onSuccess={() => { toast.success(t('lookups.created', 'hr').replace('{name}', entity)); getAll(); setIsCreateOpen(false); }}
          onCancel={() => setIsCreateOpen(false)}
          submitLabel={t('employee_form.add_employee_status', 'hr') || 'Add Employee Status'}
        />
      </Dialog>

      <Dialog isOpen={!!editItem} onClose={() => setEditItem(null)}
        title={t('common.edit', 'shared') + ' ' + entity}>
        <GenericCreateForm
          fields={[{ name: 'name', label: t('employee_form.employee_status', 'hr') || 'Employee Status', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'Default', required: false, type: 'checkbox' }]}
          schema={EmployeeStatusFormSchema}
          defaultValues={editItem ? { name: typeof editItem.name === 'string' ? editItem.name : (editItem.name?.ar || editItem.name?.en || ''), is_default: editItem.is_default } : undefined}
          onSubmit={async (data) => { try { await update(editItem.id, { ...data, name: { ar: data.name } }); } catch { toast.error(t('lookups.update_error', 'hr').replace('{name}', entity)); throw {}; } }}
          onSuccess={() => { toast.success(t('lookups.updated', 'hr').replace('{name}', entity)); getAll(); setEditItem(null); }}
          onCancel={() => setEditItem(null)}
          submitLabel={t('common.save', 'shared') || 'Save'}
        />
      </Dialog>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={getAll} />}
      {!loading && !error && (
        <DataTable columns={columns} data={filtered} rowKey="id" loading={false}
          emptyMessage={t('lookups.no_employee_statuses', 'hr') || 'No employee statuses found'} />
      )}

      <ConfirmDialog isOpen={!!confirmDelete} type="danger"
        title={t('common.confirm_delete_title', 'shared').replace('{entity}', entity)}
        message={t('common.confirm_delete_message', 'shared').replace('{entity}', entity)}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        onConfirm={handleDeleteConfirm} onCancel={() => setConfirmDelete(null)} />

      <ConfirmDialog isOpen={!!confirmSetDefault}
        title={t('common.set_default_title', 'shared')?.replace('{entity}', entity) || 'Set as default'}
        message={t('common.set_default_message', 'shared')?.replace('{entity}', entity) || `Are you sure you want to set this ${entity} as default?`}
        confirmLabel={t('common.set_default', 'shared') || 'Set as default'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        onConfirm={handleSetDefaultConfirm} onCancel={() => setConfirmSetDefault(null)} />
    </div>
  );
}
