import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud, useFaculties } from '../../hooks';
import { FacultyFormSchema } from '../../../../../core/presentation/schemas/education/facultyForm.schema';
import type { University } from '../../../../../core/domain/entities/education/University';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { Dialog } from '../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { GenericCreateForm } from '../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import Input from '../../../../../core/presentation/layouts/ui/inputs/Input';
import { inputBaseClasses } from '../../../../../core/presentation/layouts/ui/inputs/styles';
import { LoadingState } from '../../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { EmptyState } from '../../../../../core/presentation/layouts/ui/state/EmptyState';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { Building2 } from 'lucide-react';
import { toast } from 'sonner';

export function FacultiesPage() {
  const { t } = useLanguage();
  const { entities: universities, getAll: loadUniversities } = useEntityCrud<University>('/shared-kernal/universities', '/shared-kernal/universities');
  const { entities: faculties, getAllByUniversity, create, remove, loading, error } = useFaculties();
  const [selectedUniversity, setSelectedUniversity] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const entity = t('lookups.tabs.faculties', 'hr') || 'Faculty';

  useEffect(() => { loadUniversities(); }, []);
  useEffect(() => { if (selectedUniversity) getAllByUniversity(selectedUniversity); }, [selectedUniversity]);

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

  const filtered = faculties.filter((f: any) => f.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('lookups.tabs.faculties', 'hr') || 'Faculties'}</h1>
      <div className="mb-4 max-w-xs">
        <label className="block text-sm font-medium mb-1">{t('employees.university', 'hr') || 'University'}</label>
        <Input type="select" value={selectedUniversity || ''} onChange={(v) => setSelectedUniversity(Number(v))}
          options={universities.map((u: any) => ({ value: u.id, label: u.name }))}
          placeholder={t('common.select') || 'Select...'} baseClasses={inputBaseClasses} searchable />
      </div>
      {selectedUniversity ? (
        <>
          <div className="flex gap-2">
            <Input type="text" value={searchQuery} onChange={setSearchQuery} placeholder={t('common.search') || 'Search'} baseClasses={inputBaseClasses} className="flex-1" />
            <Button onClick={() => setIsDialogOpen(true)}>{t('employee_form.add_faculty', 'hr') || 'Add Faculty'}</Button>
          </div>
          <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={t('employee_form.add_faculty', 'hr') || 'Add Faculty'}>
            <GenericCreateForm
              fields={[{ name: 'name', label: t('employees.faculty', 'hr') || 'Faculty name', required: true }]}
              schema={FacultyFormSchema.omit({ university_id: true })}
              onSubmit={async (data) => { try { return await create({ name: data.name, university_id: selectedUniversity }); } catch { toast.error(t('lookups.create_error', 'hr').replace('{name}', entity)); throw {}; } }}
              onSuccess={() => { toast.success(t('lookups.created', 'hr').replace('{name}', entity)); getAllByUniversity(selectedUniversity!); setIsDialogOpen(false); }}
              onCancel={() => setIsDialogOpen(false)}
              submitLabel={t('employee_form.add_faculty', 'hr') || 'Add Faculty'}
            />
          </Dialog>
          {loading && <LoadingState />}
          {error && <ErrorState message={error} onRetry={() => selectedUniversity && getAllByUniversity(selectedUniversity)} />}
          {!loading && !error && filtered.length === 0 && <EmptyState message={t('lookups.no_faculties', 'hr') || 'No faculties found'} />}
          {!loading && !error && filtered.length > 0 && (
            <div className="mt-4 border rounded overflow-hidden">
              <ul className="divide-y">
                {filtered.map((f: any) => (
                  <li key={f.id} className="p-3 flex justify-between items-center">
                    <span>{f.name}</span>
                    <Button variant="danger" size="sm" onClick={() => setConfirmDelete(f)}>
                      {t('common.delete') || 'Delete'}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <EmptyState message={t('lookups.select_university_first', 'hr') || 'Please select a university first'} icon={<Building2 size={24} />} />
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
