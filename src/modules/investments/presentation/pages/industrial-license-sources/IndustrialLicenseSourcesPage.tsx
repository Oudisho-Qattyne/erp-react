import { useState, useMemo } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import { getCreateIndustrialLicenseSourceFormSchema } from '../../schemas/industrialLicenseSourceForm.schema';
import type { IndustrialLicenseSource } from '../../../domain/entities/industrialLicenseSource';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { Dialog } from '../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { GenericCreateForm } from '../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import Input from '../../../../../core/presentation/layouts/ui/inputs/Input';
import { inputBaseClasses } from '../../../../../core/presentation/layouts/ui/inputs/styles';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { toast } from 'sonner';
import { handleApiError } from '../../../../../core/presentation/utils/handleApiError';
import { AuditLog } from '../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { Pencil, Trash2, Star, Check, X, History, Filter } from 'lucide-react';
import { FilterDialog, type FilterField } from '../../../../../core/presentation/layouts/ui/filter/FilterDialog';
import { getLocalizedName } from '../../../../../core/presentation/utils/helpes';

export function IndustrialLicenseSourcesPage() {
  const { t } = useLanguage();
  const { entities: items, create, update, remove, loadingMap, errorMap, list } = useEntityCrud<IndustrialLicenseSource>(
    '/investments/industrial-license-sources',
    '/investments/industrial-license-sources',
    { listState: true, defaultSortColumn: 'name', paginate: false, debounceMs: 300 }
  );
  const entityName = t('industrial_license_sources.title', 'investments') || 'Industrial License Source';
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<IndustrialLicenseSource | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<IndustrialLicenseSource | null>(null);
  const [confirmSetDefault, setConfirmSetDefault] = useState<IndustrialLicenseSource | null>(null);
  const [auditItem, setAuditItem] = useState<IndustrialLicenseSource | null>(null);

  const filterInitialValues = useMemo(
    () => Object.fromEntries(Object.entries(list.filter).filter(([k]) => !['search', 'sortColumn', 'sortOrder'].includes(k))),
    [list.filter]
  );

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await remove(confirmDelete.id);
      toast.success(t('industrial_license_sources.deleted', 'investments').replace('{name}', entityName));
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
    }
    setConfirmDelete(null);
  };

  const handleSetDefaultConfirm = async () => {
    if (!confirmSetDefault) return;
    try {
      await update(confirmSetDefault.id, { ...confirmSetDefault, is_default: true });
      toast.success(t('common.set_default_success', 'shared')?.replace('{name}', entityName) || `${entityName} set as default successfully`);
      list.refresh();
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
    }
    setConfirmSetDefault(null);
  };

  const columns = [
    {
      key: 'name',
      label: t('industrial_license_sources.name', 'investments') || 'Source Name',
      width: 250,
      sortable: true,
      render: (row: IndustrialLicenseSource) => getLocalizedName(row.name) 
    },
    {
      key: 'is_active',
      label: t('common.is_active', 'shared') || 'Active',
      width: 100,
      render: (row: IndustrialLicenseSource) => row.is_active
        ? <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><Check size={12} className="inline" /> {t('common.yes', 'shared') || 'Yes'}</span>
        : <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><X size={12} className="inline" /> {t('common.no', 'shared') || 'No'}</span>
    },
    {
      key: 'is_default',
      label: t('common.is_default', 'shared') || 'Default',
      width: 120,
      render: (row: IndustrialLicenseSource) => row.is_default
        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><Star size={12} /> {t('common.yes', 'shared') || 'Yes'}</span>
        : <span className="text-xs text-text-muted">—</span>
    },
    {
      key: 'created_at',
      label: t('common.created_at', 'shared') || 'Created At',
      width: 150,
      sortable: true,
    },
    {
      key: 'actions',
      label: t('common.actions', 'shared') || 'Actions',
      width: 200,
      render: (row: IndustrialLicenseSource) => (
        <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
          {!row.is_default && (
            <Button variant="ghost" size="sm" onClick={() => setConfirmSetDefault(row)}
              title={t('common.set_default', 'shared') || 'Set as default'} requiredPermission="investments.industrial-license-sources.update">
              <Star size={16} />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setEditItem(row)}
            title={t('common.edit', 'shared') || 'Edit'} requiredPermission="investments.industrial-license-sources.update">
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)}
            title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.industrial-license-sources.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)}
            title={t('industrial_license_sources.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
            <History size={16} />
          </Button>
        </div>
      )
    },
  ];

  const handleTranslateValues = (field: string, value: string) => {
    if (field === 'is_active' || field === 'is_default') {
      return value === 'true' ? (t('common.yes', 'shared') || 'Yes') : value === 'false' ? (t('common.no', 'shared') || 'No') : value;
    }
    return value;
  };

  const filterFields: FilterField[] = [
    { name: "is_active", label: t("common.is_active", "shared") || "Is Active?", type: "select", options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "true", label: t("common.yes", "shared") || "Yes" },
      { value: "false", label: t("common.no", "shared") || "No" },
    ]},
    { name: "is_default", label: t("common.is_default", "shared") || "Default", type: "select", options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "true", label: t("common.yes", "shared") || "Yes" },
      { value: "false", label: t("common.no", "shared") || "No" },
    ]},
  ];

  const handleApplyFilter = (values: Record<string, unknown>) => {
    const parsed: Record<string, any> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val === '' || val === undefined) { parsed[key] = undefined; continue; }
      parsed[key] = val;
    }
    list.setFilter(parsed);
    setIsFilterOpen(false);
  };

  const handleResetFilter = () => {
    list.resetFilter();
    setIsFilterOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t('industrial_license_sources.title', 'investments')}</h1>
        <div className="w-full flex gap-2">
          <Input type="text" value={list.filter.search ?? ''} onChange={list.setSearch}
            placeholder={t('common.search', 'shared') || 'Search...'}
            baseClasses={inputBaseClasses} className="w-60" />
            <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} leftIcon={<Filter size={14} />}>
              {t('common.filter', 'shared') || 'تصفية'}
            </Button>
            <Button onClick={() => setIsCreateOpen(true)} requiredPermission="investments.industrial-license-sources.create">{t('industrial_license_sources.add', 'investments')}</Button>
        </div>
      </div>

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('industrial_license_sources.add', 'investments')}>
        <GenericCreateForm
          fields={[
            { name: 'name', type: 'alpha', label: t('industrial_license_sources.name', 'investments'), required: true },
            { name: 'is_active', type: 'checkbox', label: t('common.is_active', 'shared') },
            { name: 'is_default', type: 'checkbox', label: t('common.is_default', 'shared') }
          ]}
          schema={getCreateIndustrialLicenseSourceFormSchema(t)}
          onSubmit={async (data) => {
            try {
              return await create(data);
    } catch (err: any) {
      handleApiError(err, { module: "investments" }); throw err;
    }
          }}
          onSuccess={() => { toast.success(t('industrial_license_sources.created', 'investments').replace('{name}', entityName)); list.refresh(); setIsCreateOpen(false); }}
          onCancel={() => setIsCreateOpen(false)}
          submitLabel={t('industrial_license_sources.add', 'investments')}
        />
      </Dialog>

      <Dialog isOpen={!!editItem} onClose={() => setEditItem(null)} title={t('common.edit', 'shared') + ' ' + entityName}>
        <GenericCreateForm
          fields={[
            { name: 'name', type: 'alpha', label: t('industrial_license_sources.name', 'investments'), required: true },
            { name: 'is_active', type: 'checkbox', label: t('common.is_active', 'shared') },
            { name: 'is_default', type: 'checkbox', label: t('common.is_default', 'shared') }
          ]}
          schema={getCreateIndustrialLicenseSourceFormSchema(t)}
          defaultValues={editItem ? { name: editItem.name, is_active: Boolean(editItem.is_active), is_default: Boolean(editItem.is_default) } : undefined}
          onSubmit={async (data) => {
            try {
              await update(editItem!.id, data);
    } catch (err: any) {
      handleApiError(err, { module: "investments" }); throw err;
    }
          }}
          onSuccess={() => { toast.success(t('common.updated', 'shared')?.replace('{name}', entityName) || `${entityName} updated successfully`); list.refresh(); setEditItem(null); }}
          onCancel={() => setEditItem(null)}
          submitLabel={t('common.save', 'shared') || 'Save'}
        />
      </Dialog>

      {errorMap['getAll'] && <ErrorState message={errorMap['getAll']} onRetry={() => list.refresh()} />}
      {!errorMap['getAll'] && (
        <DataTable columns={columns} data={items} rowKey="id" loading={loadingMap['getAll']}
          sortColumn={list.filter.sortColumn} sortOrder={list.filter.sortOrder} onSort={list.setSort}
          emptyMessage={t('industrial_license_sources.no_records', 'investments')} />
      )}

      <AuditLog
        isOpen={!!auditItem}
        onClose={() => setAuditItem(null)}
        model="industrial_license_source"
        modelId={auditItem?.id}
        module="investments"
        labels={{
          title: t('industrial_license_sources.edit_log', 'investments') || 'Edit Log',
          event: t('industrial_license_sources.event', 'investments') || 'Event',
          created_at: t('industrial_license_sources.created_at', 'investments') || 'Created At',
          changed_by: t('industrial_license_sources.changed_by', 'investments') || 'Changed By',
          changes: t('industrial_license_sources.changes', 'investments') || 'Changes',
          field: t('industrial_license_sources.field', 'investments') || 'Field',
          old_value: t('industrial_license_sources.old_value', 'investments') || 'Old Value',
          new_value: t('industrial_license_sources.new_value', 'investments') || 'New Value',
          no_records: t('industrial_license_sources.no_edit_log', 'investments') || 'No edit logs found',
          subject_id: t('industrial_license_sources.subject_id', 'investments') || 'License Source ID',
        }}
        translateField={(key) => t(`industrial_license_sources.${key}`, 'investments') || key}
        translateValues={handleTranslateValues}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        type="danger"
        title={t('common.confirm_delete_title', 'shared').replace('{entity}', entityName)}
        message={t('common.confirm_delete_message', 'shared').replace('{entity}', entityName)}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        confirmLoading={loadingMap['remove']}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        isOpen={!!confirmSetDefault}
        title={t('common.set_default_title', 'shared')?.replace('{entity}', entityName) || 'Set as default'}
        message={t('common.set_default_message', 'shared')?.replace('{entity}', entityName) || `Are you sure you want to set this ${entityName} as default?`}
        confirmLabel={t('common.set_default', 'shared') || 'Set as default'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        confirmLoading={loadingMap['remove']}
        onConfirm={handleSetDefaultConfirm}
        onCancel={() => setConfirmSetDefault(null)}
      />

      <FilterDialog
        isOpen={isFilterOpen}
        fields={filterFields}
        initialValues={filterInitialValues}
        onFilter={handleApplyFilter}
        onCancel={() => setIsFilterOpen(false)}
        onReset={handleResetFilter}
      />
    </div>
  );
}
