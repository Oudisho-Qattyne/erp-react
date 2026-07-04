import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud, useCities, useRegions } from '../../hooks';
import { RegionFormSchema } from '../../../../../core/presentation/schemas/regions/regionForm.schema';
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
import { EmptyState } from '../../../../../core/presentation/layouts/ui/state/EmptyState';
import { MapPin, Pencil, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';

export function RegionsPage() {
  const { t } = useLanguage();
  const { entities: countries, getAll: loadCountries } = useEntityCrud<Country>('/shared-kernal/countries', '/shared-kernal/countries');
  const { entities: cities, getAllByCountry } = useCities();
  const { entities: regions, getAllByCity, create, update, remove, loading, error } = useRegions();
  const entity = t('lookups.tabs.regions', 'hr') || 'Region';
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [confirmSetDefault, setConfirmSetDefault] = useState<any>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => { loadCountries(); }, []);
  useEffect(() => { if (selectedCountry) { getAllByCountry(selectedCountry); setSelectedCity(null); } }, [selectedCountry]);
  useEffect(() => { if (selectedCity) getAllByCity(selectedCity); }, [selectedCity]);

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setConfirmLoading(true);
    try {
      await remove(confirmDelete.id);
      toast.success(t('lookups.deleted', 'hr').replace('{name}', entity));
      setConfirmDelete(null);
    } catch {
      toast.error(t('lookups.delete_error', 'hr').replace('{name}', entity));
    }
    setConfirmLoading(false);
  };

  const handleSetDefaultConfirm = async () => {
    if (!confirmSetDefault) return;
    setConfirmLoading(true);
    try {
      await update(confirmSetDefault.id, { is_default: true });
      toast.success(t('lookups.set_default_success', 'hr').replace('{name}', entity));
      selectedCity && getAllByCity(selectedCity);
      setConfirmSetDefault(null);
    } catch {
      toast.error(t('lookups.set_default_error', 'hr').replace('{name}', entity));
    }
    setConfirmLoading(false);
  };

  const filtered = regions.filter((r: any) =>
    (typeof r.name === 'string' ? r.name : r.name?.ar || r.name?.en || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { key: 'name', label: t('employees.region', 'hr') || 'Region', width: 300,
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('lookups.tabs.regions', 'hr') || 'Regions'}</h1>
        
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">{t('employees.country', 'hr') || 'Country'}</label>
          <Input type="select" value={selectedCountry || ''} onChange={(v) => setSelectedCountry(Number(v))}
            options={countries.map((c: any) => ({ value: c.id, label: typeof c.name === 'string' ? c.name : (c.name?.ar || c.name?.en || ''), is_default:c.is_default }))}
            placeholder={t('common.select', 'shared') || 'Select...'} baseClasses={inputBaseClasses} searchable />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('employees.city', 'hr') || 'City'}</label>
          <Input type="select" value={selectedCity || ''} onChange={(v) => setSelectedCity(Number(v))}
            options={cities.map((c: any) => ({ value: c.id, label: typeof c.name === 'string' ? c.name : (c.name?.ar || c.name?.en || '') , is_default:c.is_default }))}
            placeholder={t('common.select', 'shared') || 'Select...'} disabled={!selectedCountry} baseClasses={inputBaseClasses} searchable />
        </div>
      </div>

      {selectedCity ? (
        <>
          <div className="flex gap-2">
            <Input type="text" value={searchQuery} onChange={setSearchQuery}
              placeholder={t('common.search', 'shared') || 'Search...'}
              baseClasses={inputBaseClasses} className="w-60" />
            <Button onClick={() => setIsCreateOpen(true)}>{t('employee_form.add_region', 'hr') || 'Add Region'}</Button>
          </div>

          <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}
            title={t('employee_form.add_region', 'hr') || 'Add Region'}>
            <GenericCreateForm
              fields={[{ name: 'name', label: t('employees.region', 'hr') || 'Region name', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'Default', required: false, type: 'checkbox' }]}
              schema={RegionFormSchema.omit({ city_id: true })}
              onSubmit={async (data) => { try { return await create({ ...data, name: { ar: data.name }, city_id: selectedCity }); } catch { toast.error(t('lookups.create_error', 'hr').replace('{name}', entity)); throw {}; } }}
              onSuccess={() => { toast.success(t('lookups.created', 'hr').replace('{name}', entity)); getAllByCity(selectedCity); setIsCreateOpen(false); }}
              onCancel={() => setIsCreateOpen(false)}
              submitLabel={t('employee_form.add_region', 'hr') || 'Add Region'}
            />
          </Dialog>

          <Dialog isOpen={!!editItem} onClose={() => setEditItem(null)}
            title={t('common.edit', 'shared') + ' ' + entity}>
            <GenericCreateForm
              fields={[{ name: 'name', label: t('employees.region', 'hr') || 'Region name', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'Default', required: false, type: 'checkbox' }]}
              schema={RegionFormSchema.omit({ city_id: true })}
              defaultValues={editItem ? { name: typeof editItem.name === 'string' ? editItem.name : (editItem.name?.ar || editItem.name?.en || ''), is_default: Boolean(editItem.is_default) } : undefined}
              onSubmit={async (data) => { try { await update(editItem.id, { ...data, name: { ar: data.name } }); } catch { toast.error(t('lookups.update_error', 'hr').replace('{name}', entity)); throw {}; } }}
              onSuccess={() => { toast.success(t('lookups.updated', 'hr').replace('{name}', entity)); selectedCity && getAllByCity(selectedCity); setEditItem(null); }}
              onCancel={() => setEditItem(null)}
              submitLabel={t('common.save', 'shared') || 'Save'}
            />
          </Dialog>

          {error && <ErrorState message={error} onRetry={() => selectedCity && getAllByCity(selectedCity)} />}
          {!error && !loading && filtered.length === 0 && (
            <EmptyState message={t('lookups.no_regions', 'hr') || 'No regions found'} />
          )}
          {!error && (filtered.length > 0 || loading) && (
            <DataTable columns={columns} data={filtered} rowKey="id" loading={loading}
              emptyMessage={t('lookups.no_regions', 'hr') || 'No regions found'} />
          )}
        </>
      ) : (
        <EmptyState message={t('lookups.select_city_first', 'hr') || 'Please select a city first'} icon={<MapPin size={24} />} />
      )}

      <ConfirmDialog isOpen={!!confirmDelete} type="danger"
        title={t('common.confirm_delete_title', 'shared').replace('{entity}', entity)}
        message={t('common.confirm_delete_message', 'shared').replace('{entity}', entity)}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        confirmLoading={confirmLoading}
        onConfirm={handleDeleteConfirm} onCancel={() => setConfirmDelete(null)} />

      <ConfirmDialog isOpen={!!confirmSetDefault} 
        title={t('common.set_default_title', 'shared')?.replace('{entity}', entity) || 'Set as default'}
        message={t('common.set_default_message', 'shared')?.replace('{entity}', entity) || `Are you sure you want to set this ${entity} as default?`}
        confirmLabel={t('common.set_default', 'shared') || 'Set as default'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        confirmLoading={confirmLoading}
        onConfirm={handleSetDefaultConfirm} onCancel={() => setConfirmSetDefault(null)} />
    </div>
  );
}
