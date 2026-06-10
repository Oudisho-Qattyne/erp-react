import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud, useCities } from '../../hooks';
import { CityFormSchema } from '../../../../../core/presentation/schemas/regions/cityForm.schema';
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

export function CitiesPage() {
  const { t } = useLanguage();
  const { entities: countries, getAll: loadCountries } = useEntityCrud<Country>('/shared-kernal/countries', '/shared-kernal/countries');
  const { entities: cities, getAllByCountry, create, remove, loading, error } = useCities();
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const entity = t('lookups.tabs.cities', 'hr') || 'City';
  const filtered = cities.filter((c: any) => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));

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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('lookups.tabs.cities', 'hr') || 'Cities'}</h1>
      <div className="mb-4 max-w-xs">
        <label className="block text-sm font-medium mb-1">{t('employees.country', 'hr') || 'Country'}</label>
        <Input type="select" value={selectedCountry || ''} onChange={(v) => setSelectedCountry(Number(v))}
          options={countries.map((c: any) => ({ value: c.id, label: c.name }))}
          placeholder={t('common.select') || 'Select...'} baseClasses={inputBaseClasses} searchable />
      </div>
      {selectedCountry ? (
        <>
          <div className="flex gap-2">
            <Input type="text" value={searchQuery} onChange={setSearchQuery} placeholder={t('common.search') || 'Search'} baseClasses={inputBaseClasses} className="flex-1" />
            <Button onClick={() => setIsDialogOpen(true)}>{t('employee_form.add_city', 'hr') || 'Add City'}</Button>
          </div>
          <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={t('employee_form.add_city', 'hr') || 'Add City'}>
            <GenericCreateForm
              fields={[{ name: 'name', label: t('employees.city', 'hr') || 'City name', required: true }]}
              schema={CityFormSchema.omit({ country_id: true })}
              onSubmit={async (data) => { try { return await create({ name: { ar: data.name }, country_id: selectedCountry }); } catch { toast.error(t('lookups.create_error', 'hr').replace('{name}', entity)); throw {}; } }}
              onSuccess={() => { toast.success(t('lookups.created', 'hr').replace('{name}', entity)); getAllByCountry(selectedCountry!); setIsDialogOpen(false); }}
              onCancel={() => setIsDialogOpen(false)}
              submitLabel={t('employee_form.add_city', 'hr') || 'Add City'}
            />
          </Dialog>
          {loading && <LoadingState />}
          {error && <ErrorState message={error} onRetry={() => selectedCountry && getAllByCountry(selectedCountry)} />}
          {!loading && !error && filtered.length === 0 && <EmptyState message={t('lookups.no_cities', 'hr') || 'No cities found'} />}
          {!loading && !error && filtered.length > 0 && (
            <div className="mt-4 border rounded overflow-hidden">
              <ul className="divide-y">
                {filtered.map((c: any) => (
                  <li key={c.id} className="p-3 flex justify-between items-center">
                    <span>{c.name}</span>
                    <Button variant="danger" size="sm" onClick={() => setConfirmDelete(c)}>
                      {t('common.delete') || 'Delete'}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <EmptyState message={t('lookups.select_country_first', 'hr') || 'Please select a country first'} icon={<MapPin size={24} />} />
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
