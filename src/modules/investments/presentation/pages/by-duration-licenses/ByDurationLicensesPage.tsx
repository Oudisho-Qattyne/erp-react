import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import { getCreateByDurationLicenseFormSchema } from '../../schemas/byDurationLicenseForm.schema';
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
import type { ByDurationLicense } from '../../../domain/entities/byDurationLicense';

export function ByDurationLicensesPage() {
  const { t } = useLanguage();
  const { entities: items, getAll, create, update, remove, loadingMap, errorMap } = useEntityCrud<ByDurationLicense>('/investments/by-duration-licenses', '/investments/by-duration-licenses');
  const entityName = t('by_duration_licenses.title', 'investments') || 'By Duration License';
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [extraFilters, setExtraFilters] = useState<Record<string, string>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<ByDurationLicense | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ByDurationLicense | null>(null);
  const [confirmSetDefault, setConfirmSetDefault] = useState<ByDurationLicense | null>(null);
  const [auditItem, setAuditItem] = useState<ByDurationLicense | null>(null);

  const listParams = useCallback(
    () => ({
      search: searchQuery || undefined,
      sortBy: sortColumn,
      sortOrder,
      isActive: extraFilters.is_active === 'true' ? true : extraFilters.is_active === 'false' ? false : undefined,
      isDefault: extraFilters.is_default === 'true' ? true : extraFilters.is_default === 'false' ? false : undefined,
    }),
    [searchQuery, sortColumn, sortOrder, extraFilters]
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
      toast.success(t('by_duration_licenses.deleted', 'investments').replace('{name}', entityName));
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
      getAll(undefined, listParams());
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
    }
    setConfirmSetDefault(null);
  };

  const handleTranslateValues = (field: string, value: string) => {
    if (field === 'is_active' || field === 'is_default') {
      return value === 'true' ? (t('common.yes', 'shared') || 'Yes') : value === 'false' ? (t('common.no', 'shared') || 'No') : value;
    }
    return value;
  };

  const columns = [
    {
      key: 'name',
      label: t('by_duration_licenses.name', 'investments') || 'Name',
      width: 250,
      sortable: true,
      render: (row: ByDurationLicense) => getLocalizedName(row.name)
    },
    {
      key: 'is_active',
      label: t('common.is_active', 'shared') || 'Is Active?',
      width: 120,
      render: (row: ByDurationLicense) => row.is_active
        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><Check size={12} /> {t('common.yes', 'shared') || 'Yes'}</span>
        : <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><X size={12} /> {t('common.no', 'shared') || 'No'}</span>
    },
    {
      key: 'is_default',
      label: t('common.is_default', 'shared') || 'Default',
      width: 120,
      render: (row: ByDurationLicense) => row.is_default
        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><Star size={12} /> {t('common.yes', 'shared') || 'Yes'}</span>
        : <span className="text-xs text-text-muted">—</span>
    },
    {
      key: 'actions',
      label: t('common.actions', 'shared') || 'Actions',
      width: 200,
      render: (row: ByDurationLicense) => (
        <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
          {!row.is_default && (
            <Button variant="ghost" size="sm" onClick={() => setConfirmSetDefault(row)}
              title={t('common.set_default', 'shared') || 'Set as default'} requiredPermission="investments.by-duration-licenses.update">
              <Star size={16} />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setEditItem(row)}
            title={t('common.edit', 'shared') || 'Edit'} requiredPermission="investments.by-duration-licenses.update">
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)}
            title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.by-duration-licenses.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)}
            title={t('by_duration_licenses.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
            <History size={16} />
          </Button>
        </div>
      )
    },
  ];

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
    const parsed: Record<string, string> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val !== "" && val !== undefined) parsed[key] = String(val);
    }
    setExtraFilters(parsed);
    setIsFilterOpen(false);
  };

  const handleResetFilter = () => {
    setExtraFilters({});
    setIsFilterOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t('by_duration_licenses.title', 'investments')}</h1>
        <div className="w-full flex gap-2">
          <Input type="text" value={searchQuery} onChange={setSearchQuery}
            placeholder={t('common.search', 'shared') || 'Search...'}
            baseClasses={inputBaseClasses} className="w-60" />
            <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} leftIcon={<Filter size={14} />}>
              {t('common.filter', 'shared') || 'تصفية'}
            </Button>
            <Button onClick={() => setIsCreateOpen(true)} requiredPermission="investments.by-duration-licenses.create">{t('by_duration_licenses.add', 'investments')}</Button>
        </div>
      </div>

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('by_duration_licenses.add', 'investments')}>
        <GenericCreateForm
          fields={[
            { name: 'name', type: 'alpha', label: t('by_duration_licenses.name', 'investments'), required: true },
            { name: 'is_active', type: 'checkbox', label: t('common.is_active', 'shared') },
            { name: 'is_default', type: 'checkbox', label: t('common.is_default', 'shared') }
          ]}
          schema={getCreateByDurationLicenseFormSchema(t)}
          onSubmit={async (data) => {
            try {
              return await create(data);
    } catch (err: any) {
      handleApiError(err, { module: "investments" }); throw err;
    }
          }}
          onSuccess={() => { toast.success(t('by_duration_licenses.created', 'investments').replace('{name}', entityName)); getAll(undefined, listParams()); setIsCreateOpen(false); }}
          onCancel={() => setIsCreateOpen(false)}
          submitLabel={t('by_duration_licenses.add', 'investments')}
        />
      </Dialog>

      <Dialog isOpen={!!editItem} onClose={() => setEditItem(null)} title={t('common.edit', 'shared') + ' ' + entityName}>
        <GenericCreateForm
          fields={[
            { name: 'name', type: 'alpha', label: t('by_duration_licenses.name', 'investments'), required: true },
            { name: 'is_active', type: 'checkbox', label: t('common.is_active', 'shared') },
            { name: 'is_default', type: 'checkbox', label: t('common.is_default', 'shared') }
          ]}
          schema={getCreateByDurationLicenseFormSchema(t)}
          defaultValues={editItem ? { name: editItem.name, is_active: Boolean(editItem.is_active), is_default: Boolean(editItem.is_default) } : undefined}
          onSubmit={async (data) => {
            try {
              await update(editItem!.id, data);
    } catch (err: any) {
      handleApiError(err, { module: "investments" }); throw err;
    }
          }}
          onSuccess={() => { toast.success(t('common.updated', 'shared')?.replace('{name}', entityName) || `${entityName} updated successfully`); getAll(undefined, listParams()); setEditItem(null); }}
          onCancel={() => setEditItem(null)}
          submitLabel={t('common.save', 'shared') || 'Save'}
        />
      </Dialog>

      {errorMap['getAll'] && <ErrorState message={errorMap['getAll']} onRetry={() => getAll(undefined, listParams())} />}
      {!errorMap['getAll'] && (
        <DataTable columns={columns} data={items} rowKey="id" loading={loadingMap['getAll']}
          sortColumn={sortColumn} sortOrder={sortOrder} onSort={handleSort}
          emptyMessage={t('by_duration_licenses.no_records', 'investments')} />
      )}

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

      <AuditLog
        isOpen={!!auditItem}
        onClose={() => setAuditItem(null)}
        model="by_duration_license"
        modelId={auditItem?.id}
        module="investments"
        labels={{
          title: t('by_duration_licenses.edit_log', 'investments') || 'Edit Log',
          event: t('by_duration_licenses.event', 'investments') || 'Event',
          created_at: t('by_duration_licenses.created_at', 'investments') || 'Created At',
          changed_by: t('by_duration_licenses.changed_by', 'investments') || 'Changed By',
          changes: t('by_duration_licenses.changes', 'investments') || 'Changes',
          field: t('by_duration_licenses.field', 'investments') || 'Field',
          old_value: t('by_duration_licenses.old_value', 'investments') || 'Old Value',
          new_value: t('by_duration_licenses.new_value', 'investments') || 'New Value',
          no_records: t('by_duration_licenses.no_edit_log', 'investments') || 'No edit logs found',
          subject_id: t('by_duration_licenses.subject_id', 'investments') || 'By Duration License ID',
        }}
        translateField={(key) => t(`by_duration_licenses.${key}`, 'investments') || key}
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

      <FilterDialog
        isOpen={isFilterOpen}
        fields={filterFields}
        initialValues={extraFilters}
        onFilter={handleApplyFilter}
        onCancel={() => setIsFilterOpen(false)}
        onReset={handleResetFilter}
      />
    </div>
  );
}
