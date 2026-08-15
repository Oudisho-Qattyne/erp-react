import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../hooks';
import { CountryFormSchema } from '../../../../../core/presentation/schemas/regions/countryForm.schema';
import type { Country } from '../../../../../core/domain/entities/regions/Country';
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
import { handleApiError } from '../../../../../core/presentation/utils/handleApiError';
import { Pencil, Trash2, Star } from 'lucide-react';
import { getLocalizedName } from '../../../../../core/presentation/utils/helpes';

export function CountriesPage() {
  const { t } = useLanguage();
  const { entities: countries, getAll, create, update, remove, loadingMap, errorMap } = useEntityCrud<Country>('/shared-kernal/countries', '/shared-kernal/countries');
  const entity = t('lookups.tabs.countries', 'hr') || 'Country';
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [confirmSetDefault, setConfirmSetDefault] = useState<any>(null);

  const listParams = useCallback(
    () => ({ search: searchQuery || undefined, sortBy: sortColumn, sortOrder }),
    [searchQuery, sortColumn, sortOrder]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      getAll(undefined, listParams());
    }, 300);
    return () => clearTimeout(timer);
  }, [getAll, listParams]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await remove(confirmDelete.id);
      toast.success(t('lookups.deleted', 'hr').replace('{name}', entity));
      setConfirmDelete(null);
    } catch (err : any) {
      handleApiError(err, { module: "hr" });
    }
  };

  const handleSetDefaultConfirm = async () => {
    if (!confirmSetDefault) return;
    try {
      await update(confirmSetDefault.id, { is_default: true });
      toast.success(t('lookups.set_default_success', 'hr').replace('{name}', entity));
      getAll(undefined, listParams());
      setConfirmSetDefault(null);
    } catch (err : any) {
      handleApiError(err, { module: "hr" });
    }
  };

  const columns = [
    {
      key: 'name', label: t('employees.country', 'hr') || 'Country', width: 300, sortable: true,
      render: (row: any) => typeof row.name === 'string' ? row.name : (row.name?.ar || row.name?.en || '')
    },
    {
      key: 'is_default', label: t('common.is_default', 'shared') || 'Default', width: 120,
      render: (row: any) => row.is_default
        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><Star size={12} /> {t('common.yes', 'shared') || 'Yes'}</span>
        : <span className="text-xs text-text-muted">—</span>
    },
    {
      key: 'actions', label: t('common.actions', 'shared') || 'Actions', width: 200,
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
      )
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t('lookups.tabs.countries', 'hr') || 'Countries'}</h1>
        <div className="w-full flex gap-2">
          <Input type="text" value={searchQuery} onChange={setSearchQuery}
            placeholder={t('common.search', 'shared') || 'Search...'}
            baseClasses={inputBaseClasses} className="w-60" />
          <Button onClick={() => setIsCreateOpen(true)}>{t('employee_form.add_country', 'hr') || 'Add Country'}</Button>
        </div>
      </div>

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}
        title={t('employee_form.add_country', 'hr') || 'Add Country'}>
        <GenericCreateForm
          fields={[{ name: 'name', type: 'alpha', label: t('employees.country', 'hr') || 'Country name', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'Default', required: false, type: 'checkbox' }]}
          schema={CountryFormSchema}
          onSubmit={async (data) => { try { return await create({ ...data, name: { ar: data.name } }); } catch (err : any) { handleApiError(err, { module: "hr" }); throw {}; } }}
          onSuccess={() => { toast.success(t('lookups.created', 'hr').replace('{name}', entity)); getAll(undefined, listParams()); setIsCreateOpen(false); }}
          onCancel={() => setIsCreateOpen(false)}
          submitLabel={t('employee_form.add_country', 'hr') || 'Add Country'}
        />
      </Dialog>
      <Dialog isOpen={!!editItem} onClose={() => setEditItem(null)}
        title={t('common.edit', 'shared') + ' ' + entity}>
        <GenericCreateForm
          fields={[{ name: 'name', type: 'alpha', label: t('employees.country', 'hr') || 'Country name', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'Default', required: false, type: 'checkbox' }]}
          schema={CountryFormSchema}
          defaultValues={editItem ? { name: getLocalizedName(editItem.name), is_default: Boolean(editItem.is_default) } : undefined}
          onSubmit={async (data) => { try { await update(editItem.id, { ...data, name: { ar: data.name } }); } catch (err : any) { handleApiError(err, { module: "hr" }); throw {}; } }}
          onSuccess={() => { toast.success(t('lookups.updated', 'hr').replace('{name}', entity)); getAll(undefined, listParams()); setEditItem(null); }}
          onCancel={() => setEditItem(null)}
          submitLabel={t('common.save', 'shared') || 'Save'}
        />
      </Dialog>

      {errorMap['getAll'] && <ErrorState message={errorMap['getAll']} onRetry={() => getAll(undefined, listParams())} />}
      {!errorMap['getAll'] && (
        <DataTable columns={columns} data={countries} rowKey="id" loading={loadingMap['getAll']}
          sortColumn={sortColumn} sortOrder={sortOrder} onSort={handleSort}
          emptyMessage={t('lookups.no_countries', 'hr') || 'No countries found'} />
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