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
import { LoadingState } from '../../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { EmptyState } from '../../../../../core/presentation/layouts/ui/state/EmptyState';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

export function RegionsPage() {
  const { t } = useLanguage();
  const { entities: countries, getAll: loadCountries } = useEntityCrud<Country>('/shared-kernal/countries', '/shared-kernal/countries');
  const { entities: cities, getAllByCountry } = useCities();
  const { entities: regions, getAllByCity, create, remove, loading, error } = useRegions();
  const entity = t('lookups.tabs.regions', 'hr') || 'Region';
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  useEffect(() => { loadCountries(); }, []);
  useEffect(() => { if (selectedCountry) { getAllByCountry(selectedCountry); setSelectedCity(null); } }, [selectedCountry]);
  useEffect(() => { if (selectedCity) getAllByCity(selectedCity); }, [selectedCity]);

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

  const filtered = regions.filter((r: any) => r.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('lookups.tabs.regions', 'hr') || 'Regions'}</h1>
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">{t('employees.country', 'hr') || 'Country'}</label>
          <Input type="select" value={selectedCountry || ''} onChange={(v) => setSelectedCountry(Number(v))}
            options={countries.map((c: any) => ({ value: c.id, label: c.name }))}
            placeholder={t('common.select') || 'Select...'} baseClasses={inputBaseClasses} searchable />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('employees.city', 'hr') || 'City'}</label>
          <Input type="select" value={selectedCity || ''} onChange={(v) => setSelectedCity(Number(v))}
            options={cities.map((c: any) => ({ value: c.id, label: c.name }))}
            placeholder={t('common.select') || 'Select...'} disabled={!selectedCountry} baseClasses={inputBaseClasses} searchable />
        </div>
      </div>
      {selectedCity ? (
        <>
          <div className="flex gap-2">
            <Input type="text" value={searchQuery} onChange={setSearchQuery} placeholder={t('common.search') || 'Search'} baseClasses={inputBaseClasses} className="flex-1" />
            <Button onClick={() => setIsDialogOpen(true)}>{t('employee_form.add_region', 'hr') || 'Add Region'}</Button>
          </div>
          <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={t('employee_form.add_region', 'hr') || 'Add Region'}>
            <GenericCreateForm
              fields={[{ name: 'name', label: t('employees.region', 'hr') || 'Region name', required: true }]}
              schema={RegionFormSchema.omit({ city_id: true })}
              onSubmit={async (data) => { try { return await create({ name: { ar: data.name }, city_id: selectedCity }); } catch { toast.error(t('lookups.create_error', 'hr').replace('{name}', entity)); throw {}; } }}
              onSuccess={() => { toast.success(t('lookups.created', 'hr').replace('{name}', entity)); getAllByCity(selectedCity!); setIsDialogOpen(false); }}
              onCancel={() => setIsDialogOpen(false)}
              submitLabel={t('employee_form.add_region', 'hr') || 'Add Region'}
            />
          </Dialog>
          {loading && <LoadingState />}
          {error && <ErrorState message={error} onRetry={() => selectedCity && getAllByCity(selectedCity)} />}
          {!loading && !error && filtered.length === 0 && <EmptyState message={t('lookups.no_regions', 'hr') || 'No regions found'} />}
          {!loading && !error && filtered.length > 0 && (
            <div className="mt-4 border rounded overflow-hidden">
              <ul className="divide-y">
                {filtered.map((r: any) => (
                  <li key={r.id} className="p-3 flex justify-between items-center">
                    <span>{r.name}</span>
                    <Button variant="danger" size="sm" onClick={() => setConfirmDelete(r)}>
                      {t('common.delete') || 'Delete'}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <EmptyState message={t('lookups.select_city_first', 'hr') || 'Please select a city first'} icon={<MapPin size={24} />} />
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        type="danger"
        title={t('common.confirm_delete_title', 'shared').replace('{entity}', entity)}
        message={t('common.confirm_delete_message', 'shared').replace('{entity}', entity)}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
