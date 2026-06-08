import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../hooks';
import { UniversityFormSchema } from '../../../../../core/presentation/schemas/education/universityForm.schema';
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
import { toast } from 'sonner';

export function UniversitiesPage() {
  const { t } = useLanguage();
  const { entities: universities, getAll, create, remove, loading, error } = useEntityCrud<University>('/shared-kernal/universities', '/shared-kernal/universities');
  const entity = t('lookups.tabs.universities', 'hr') || 'University';
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const filtered = universities.filter((u: any) => u.name?.toLowerCase().includes(searchQuery.toLowerCase()));

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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('lookups.tabs.universities', 'hr') || 'Universities'}</h1>
      <div className="flex gap-2">
        <Input type="text" value={searchQuery} onChange={setSearchQuery} placeholder={t('common.search') || 'Search'} baseClasses={inputBaseClasses} className="flex-1" />
        <Button onClick={() => setIsDialogOpen(true)}>{t('employee_form.add_university', 'hr') || 'Add University'}</Button>
      </div>
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={t('employee_form.add_university', 'hr') || 'Add University'}>
        <GenericCreateForm
          fields={[{ name: 'name', label: t('employees.university', 'hr') || 'University name', required: true }]}
          schema={UniversityFormSchema}
          onSubmit={async (data) => { try { return await create({ name: data.name }); } catch { toast.error(t('lookups.create_error', 'hr').replace('{name}', entity)); throw {}; } }}
          onSuccess={() => { toast.success(t('lookups.created', 'hr').replace('{name}', entity)); getAll(); setIsDialogOpen(false); }}
          onCancel={() => setIsDialogOpen(false)}
          submitLabel={t('employee_form.add_university', 'hr') || 'Add University'}
        />
      </Dialog>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={getAll} />}
      {!loading && !error && filtered.length === 0 && <EmptyState message={t('lookups.no_universities', 'hr') || 'No universities found'} />}
      {!loading && !error && filtered.length > 0 && (
        <div className="mt-4 border rounded overflow-hidden">
          <ul className="divide-y">
            {filtered.map((u: any) => (
              <li key={u.id} className="p-3 flex justify-between items-center">
                <span>{u.name}</span>
                <Button variant="danger" size="sm" onClick={() => setConfirmDelete(u)}>
                  {t('common.delete') || 'Delete'}
                </Button>
              </li>
            ))}
          </ul>
        </div>
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
