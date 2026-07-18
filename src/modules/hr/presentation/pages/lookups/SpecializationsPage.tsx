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
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { LoadingState } from '../../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { EmptyState } from '../../../../../core/presentation/layouts/ui/state/EmptyState';
import { GraduationCap, Pencil, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';

export function SpecializationsPage() {
  const { t } = useLanguage();
  const { entities: universities, getAll: loadUniversities } = useEntityCrud<University>('/shared-kernal/universities', '/shared-kernal/universities');
  const { entities: faculties, getAllByUniversity } = useFaculties();
  const { entities: specializations, getAllByFaculty, create, update, remove, loadingMap, errorMap } = useSpecializations();
  const entity = t('lookups.tabs.specializations', 'hr') || 'Specialization';
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<number | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [confirmSetDefault, setConfirmSetDefault] = useState<any>(null);

  useEffect(() => { loadUniversities(); }, []);
  useEffect(() => { if (selectedUniversity) { getAllByUniversity(selectedUniversity); setSelectedFaculty(null); } }, [selectedUniversity]);
  useEffect(() => { if (selectedFaculty) getAllByFaculty(selectedFaculty); }, [selectedFaculty]);

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await remove(confirmDelete.id);
      toast.success(t('lookups.deleted', 'hr').replace('{name}', entity));
      setConfirmDelete(null);
    } catch (err : any) {
      toast.error(err?.message || t('lookups.delete_error', 'hr').replace('{name}', entity));
    }
  };

  const handleSetDefaultConfirm = async () => {
    if (!confirmSetDefault) return;
    try {
      await update(confirmSetDefault.id, { is_default: true });
      toast.success(t('lookups.set_default_success', 'hr').replace('{name}', entity));
      selectedFaculty && getAllByFaculty(selectedFaculty);
      setConfirmSetDefault(null);
    } catch (err : any) {
      toast.error(err?.message || t('lookups.set_default_error', 'hr').replace('{name}', entity));
    }
  };

  const filtered = specializations.filter((s: any) =>
    (typeof s.name === 'string' ? s.name : s.name?.ar || s.name?.en || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { key: 'name', label: t('employees.specialization', 'hr') || 'Specialization', width: 300,
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
        <h1 className="text-2xl font-bold">{t('lookups.tabs.specializations', 'hr') || 'Specializations'}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">{t('employees.university', 'hr') || 'University'}</label>
          <Input type="select" value={selectedUniversity || ''} onChange={(v) => setSelectedUniversity(Number(v))}
            options={universities.map((u: any) => ({ value: u.id, label: typeof u.name === 'string' ? u.name : (u.name?.ar || u.name?.en || ''), is_default:u.is_default }))}
            placeholder={t('common.select', 'shared') || 'Select...'} baseClasses={inputBaseClasses} searchable />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('employees.faculty', 'hr') || 'Faculty'}</label>
          <Input type="select" value={selectedFaculty || ''} onChange={(v) => setSelectedFaculty(Number(v))}
            options={faculties.map((f: any) => ({ value: f.id, label: typeof f.name === 'string' ? f.name : (f.name?.ar || f.name?.en || '') , is_default:f.is_default}))}
            placeholder={t('common.select', 'shared') || 'Select...'} disabled={!selectedUniversity} baseClasses={inputBaseClasses} searchable />
        </div>
      </div>

      {selectedFaculty ? (
        <>
          <div className="flex gap-2">
          <Input type="text" value={searchQuery} onChange={setSearchQuery}
            placeholder={t('common.search', 'shared') || 'Search...'}
            baseClasses={inputBaseClasses} className="w-60" />
            <Button onClick={() => setIsCreateOpen(true)}>{t('employee_form.add_specialization', 'hr') || 'Add Specialization'}</Button>
          </div>

          <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}
            title={t('employee_form.add_specialization', 'hr') || 'Add Specialization'}>
            <GenericCreateForm
              fields={[{ name: 'name', type: 'alpha', label: t('employees.specialization', 'hr') || 'Specialization name', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'Default', required: false, type: 'checkbox' }]}
              schema={SpecializationFormSchema.omit({ Faculty_id: true })}
              onSubmit={async (data) => { try { return await create({ ...data, name: data.name, faculty_id: selectedFaculty }); } catch (err : any) { toast.error(err?.message || t('lookups.create_error', 'hr').replace('{name}', entity)); throw {}; } }}
              onSuccess={() => { toast.success(t('lookups.created', 'hr').replace('{name}', entity)); getAllByFaculty(selectedFaculty); setIsCreateOpen(false); }}
              onCancel={() => setIsCreateOpen(false)}
              submitLabel={t('employee_form.add_specialization', 'hr') || 'Add Specialization'}
            />
          </Dialog>

          <Dialog isOpen={!!editItem} onClose={() => setEditItem(null)}
            title={t('common.edit', 'shared') + ' ' + entity}>
            <GenericCreateForm
              fields={[{ name: 'name', type: 'alpha', label: t('employees.specialization', 'hr') || 'Specialization name', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'Default', required: false, type: 'checkbox' }]}
              schema={SpecializationFormSchema.omit({ Faculty_id: true })}
              defaultValues={editItem ? { name: typeof editItem.name === 'string' ? editItem.name : (editItem.name?.ar || editItem.name?.en || ''), is_default: Boolean(editItem.is_default) } : undefined}
              onSubmit={async (data) => { try { await update(editItem.id, { ...data, name: data.name }); } catch (err : any) { toast.error(err?.message || t('lookups.update_error', 'hr').replace('{name}', entity)); throw {}; } }}
              onSuccess={() => { toast.success(t('lookups.updated', 'hr').replace('{name}', entity)); selectedFaculty && getAllByFaculty(selectedFaculty); setEditItem(null); }}
              onCancel={() => setEditItem(null)}
              submitLabel={t('common.save', 'shared') || 'Save'}
            />
          </Dialog>

          {errorMap['getAll'] && <ErrorState message={errorMap['getAll']} onRetry={() => selectedFaculty && getAllByFaculty(selectedFaculty)} />}
          {!errorMap['getAll'] && !loadingMap['getAll'] && filtered.length === 0 && (
            <EmptyState message={t('lookups.no_specializations', 'hr') || 'No specializations found'} />
          )}
          {!errorMap['getAll'] && (filtered.length > 0 || loadingMap['getAll']) && (
            <DataTable columns={columns} data={filtered} rowKey="id" loading={loadingMap['getAll']}
              emptyMessage={t('lookups.no_specializations', 'hr') || 'No specializations found'} />
          )}
        </>
      ) : (
        <EmptyState message={t('lookups.select_faculty_first', 'hr') || 'Please select a faculty first'} icon={<GraduationCap size={24} />} />
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
