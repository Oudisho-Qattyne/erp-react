import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud, useFaculties, useSpecializations } from '../../hooks';
import { SpecializationFormSchema } from '../../../../../core/presentation/schemas/education/specializationForm.schema';
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
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export function SpecializationsPage() {
  const { t } = useLanguage();
  const { entities: universities, getAll: loadUniversities } = useEntityCrud<University>('/shared-kernal/universities', '/shared-kernal/universities');
  const { entities: faculties, getAllByUniversity } = useFaculties();
  const { entities: specializations, getAllByFaculty, create, remove, loading, error } = useSpecializations();
  const entity = t('lookups.tabs.specializations', 'hr') || 'Specialization';
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<number | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  useEffect(() => { loadUniversities(); }, []);
  useEffect(() => { if (selectedUniversity) { getAllByUniversity(selectedUniversity); setSelectedFaculty(null); } }, [selectedUniversity]);
  useEffect(() => { if (selectedFaculty) getAllByFaculty(selectedFaculty); }, [selectedFaculty]);

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

  const filtered = specializations.filter((s: any) => s.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('lookups.tabs.specializations', 'hr') || 'Specializations'}</h1>
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">{t('employees.university', 'hr') || 'University'}</label>
          <Input type="select" value={selectedUniversity || ''} onChange={(v) => setSelectedUniversity(Number(v))}
            options={universities.map((u: any) => ({ value: u.id, label: u.name }))}
            placeholder={t('common.select') || 'Select...'} baseClasses={inputBaseClasses} searchable />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('employees.faculty', 'hr') || 'Faculty'}</label>
          <Input type="select" value={selectedFaculty || ''} onChange={(v) => setSelectedFaculty(Number(v))}
            options={faculties.map((f: any) => ({ value: f.id, label: f.name }))}
            placeholder={t('common.select') || 'Select...'} disabled={!selectedUniversity} baseClasses={inputBaseClasses} searchable />
        </div>
      </div>
      {selectedFaculty ? (
        <>
          <div className="flex gap-2">
            <Input type="text" value={searchQuery} onChange={setSearchQuery} placeholder={t('common.search') || 'Search'} baseClasses={inputBaseClasses} className="flex-1" />
            <Button onClick={() => setIsDialogOpen(true)}>{t('employee_form.add_specialization', 'hr') || 'Add Specialization'}</Button>
          </div>
          <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={t('employee_form.add_specialization', 'hr') || 'Add Specialization'}>
            <GenericCreateForm
              fields={[{ name: 'name', label: t('employees.specialization', 'hr') || 'Specialization name', required: true }]}
              schema={SpecializationFormSchema.omit({ Faculty_id: true })}
              onSubmit={async (data) => { try { return await create({ name: data.name, faculty_id: selectedFaculty }); } catch { toast.error(t('lookups.create_error', 'hr').replace('{name}', entity)); throw {}; } }}
              onSuccess={() => { toast.success(t('lookups.created', 'hr').replace('{name}', entity)); getAllByFaculty(selectedFaculty!); setIsDialogOpen(false); }}
              onCancel={() => setIsDialogOpen(false)}
              submitLabel={t('employee_form.add_specialization', 'hr') || 'Add Specialization'}
            />
          </Dialog>
          {loading && <LoadingState />}
          {error && <ErrorState message={error} onRetry={() => selectedFaculty && getAllByFaculty(selectedFaculty)} />}
          {!loading && !error && filtered.length === 0 && <EmptyState message={t('lookups.no_specializations', 'hr') || 'No specializations found'} />}
          {!loading && !error && filtered.length > 0 && (
            <div className="mt-4 border rounded overflow-hidden">
              <ul className="divide-y">
                {filtered.map((s: any) => (
                  <li key={s.id} className="p-3 flex justify-between items-center">
                    <span>{s.name}</span>
                    <Button variant="danger" size="sm" onClick={() => setConfirmDelete(s)}>
                      {t('common.delete') || 'Delete'}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <EmptyState message={t('lookups.select_faculty_first', 'hr') || 'Please select a faculty first'} icon={<GraduationCap size={24} />} />
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
