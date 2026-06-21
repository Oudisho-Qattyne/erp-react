import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud, useCities } from '../../hooks';
import { CityFormSchema } from '../../../../../core/presentation/schemas/regions/cityForm.schema';
import type { Country } from '../../../../../core/domain/entities/regions/Country';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { Dialog } from '../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { GenericCreateForm } from '../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import Input from '../../../../../core/presentation/layouts/ui/inputs/Input';

import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { LoadingState } from '../../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { EmptyState } from '../../../../../core/presentation/layouts/ui/state/EmptyState';
import { MapPin, Pencil, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { inputBaseClasses } from '../../../../../core/presentation/layouts/ui/inputs/styles';

export function CitiesPage() {
  const { t } = useLanguage();
  const { entities: countries, getAll: loadCountries } = useEntityCrud<Country>('/shared-kernal/countries', '/shared-kernal/countries');
  const { entities: cities, getAllByCountry, create, update, remove, loading, error } = useCities();
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [confirmSetDefault, setConfirmSetDefault] = useState<any>(null);
  const entity = t('lookups.tabs.cities', 'hr') || 'City';
  const filtered = cities.filter((c: any) =>
    (typeof c.name === 'string' ? c.name : c.name?.ar || c.name?.en || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => { loadCountries(); }, []);
  useEffect(() => { if (selectedCountry) getAllByCountry(selectedCountry); }, [selectedCountry]);

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
      selectedCountry && getAllByCountry(selectedCountry);
    } catch {
      toast.error(t('lookups.set_default_error', 'hr').replace('{name}', entity));
    }
    setConfirmSetDefault(null);
  };

  const columns = [
    {
      key: 'name', label: t('employees.city', 'hr') || 'City', width: 300,
      render: (row: any) => typeof row.name === 'string' ? row.name : (row.name?.ar || row.name?.en || '')
    },
    {
      key: 'is_default', label: t('common.is_default', 'shared') || 'Default', width: 120,
      render: (row: any) => row.is_default
        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><Star size={12} /> {t('common.yes', 'shared') || 'Yes'}</span>
        : <span className="text-xs text-text-muted">—</span>
    },
    {
      key: 'actions', label: t('common.actions', 'shared') || 'Actions', width: 220, align: 'right' as const,
      render: (row: any) => (
        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
          {!row.is_default && (
            <Button variant="outline" size="sm" onClick={() => setConfirmSetDefault(row)}
              title={t('common.set_default', 'shared') || 'Set as default'}>
              <Star size={14} />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setEditItem(row)}
            title={t('common.edit', 'shared') || 'Edit'}>
            <Pencil size={14} />
          </Button>
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(row)}
            title={t('common.delete', 'shared') || 'Delete'}>
            <Trash2 size={14} />
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('lookups.tabs.cities', 'hr') || 'Cities'}</h1>


      </div>

      <div className="max-w-xs">
        <label className="block text-sm font-medium mb-1">{t('employees.country', 'hr') || 'Country'}</label>
        <Input type="select" value={selectedCountry || ''} onChange={(v) => setSelectedCountry(Number(v))}
          options={countries.map((c: any) => ({ value: c.id, label: typeof c.name === 'string' ? c.name : (c.name?.ar || c.name?.en || '') }))}
          placeholder={t('common.select', 'shared') || 'Select...'} baseClasses={inputBaseClasses} searchable />
      </div>

      {selectedCountry ? (
        <>

          <div className="flex gap-2">
            <Input type="text" value={searchQuery} onChange={setSearchQuery}
              placeholder={t('common.search', 'shared') || 'Search...'}
              baseClasses={inputBaseClasses} className="w-60" />
            <Button onClick={() => setIsCreateOpen(true)}>{t('employee_form.add_city', 'hr') || 'Add City'}</Button>
          </div>

          <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}
            title={t('employee_form.add_city', 'hr') || 'Add City'}>
            <GenericCreateForm
              fields={[{ name: 'name', label: t('employees.city', 'hr') || 'City name', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'Default', required: false, type: 'checkbox' }]}
              schema={CityFormSchema.omit({ country_id: true })}
              onSubmit={async (data) => { try { return await create({ ...data, name: { ar: data.name }, country_id: selectedCountry }); } catch { toast.error(t('lookups.create_error', 'hr').replace('{name}', entity)); throw {}; } }}
              onSuccess={() => { toast.success(t('lookups.created', 'hr').replace('{name}', entity)); getAllByCountry(selectedCountry); setIsCreateOpen(false); }}
              onCancel={() => setIsCreateOpen(false)}
              submitLabel={t('employee_form.add_city', 'hr') || 'Add City'}
            />
          </Dialog>

          <Dialog isOpen={!!editItem} onClose={() => setEditItem(null)}
            title={t('common.edit', 'shared') + ' ' + entity}>
            <GenericCreateForm
              fields={[{ name: 'name', label: t('employees.city', 'hr') || 'City name', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'Default', required: false, type: 'checkbox' }]}
              schema={CityFormSchema.omit({ country_id: true })}
              defaultValues={editItem ? { name: typeof editItem.name === 'string' ? editItem.name : (editItem.name?.ar || editItem.name?.en || ''), is_default: editItem.is_default } : undefined}
              onSubmit={async (data) => { try { await update(editItem.id, { ...data, name: { ar: data.name } }); } catch { toast.error(t('lookups.update_error', 'hr').replace('{name}', entity)); throw {}; } }}
              onSuccess={() => { toast.success(t('lookups.updated', 'hr').replace('{name}', entity)); selectedCountry && getAllByCountry(selectedCountry); setEditItem(null); }}
              onCancel={() => setEditItem(null)}
              submitLabel={t('common.save', 'shared') || 'Save'}
            />
          </Dialog>

          {loading && <LoadingState />}
          {error && <ErrorState message={error} onRetry={() => selectedCountry && getAllByCountry(selectedCountry)} />}
          {!loading && !error && filtered.length === 0 && !loading && !error && (
            <EmptyState message={t('lookups.no_cities', 'hr') || 'No cities found'} />
          )}
          {!loading && !error && filtered.length > 0 && (
            <DataTable columns={columns} data={filtered} rowKey="id" loading={false}
              emptyMessage={t('lookups.no_cities', 'hr') || 'No cities found'} />
          )}
        </>
      ) : (
        <EmptyState message={t('lookups.select_country_first', 'hr') || 'Please select a country first'} icon={<MapPin size={24} />} />
      )}

      <ConfirmDialog isOpen={!!confirmDelete}
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
        onConfirm={handleSetDefaultConfirm}
        onCancel={() => setConfirmSetDefault(null)} />

    </div>
  );
}
