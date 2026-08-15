import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../hooks';
import { organizationalLevelFormSchema } from '../../../../../core/presentation/schemas/organizationalLevels/organizationalLevel.Schema';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { Dialog } from '../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { GenericCreateForm } from '../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { LoadingState } from '../../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { toast } from 'sonner';
import { handleApiError } from '../../../../../core/presentation/utils/handleApiError';
import { AuditLog } from '../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { Pencil, Trash2, ChevronRight, ChevronDown, History } from 'lucide-react';
import type { OrganizationalLevels } from '../../../../../core/domain/entities/organizationalLevels/organizationalLevels';

type OrgLevelNode = OrganizationalLevels & { children: OrgLevelNode[] };

function buildTree(items: OrganizationalLevels[]): OrgLevelNode[] {
  const map = new Map<number, OrgLevelNode>();
  const roots: OrgLevelNode[] = [];
  items.forEach(item => map.set(item.id, { ...item, children: [], parent: item.parent }));
  items.forEach(item => {
    const node = map.get(item.id)!;
    if (item.parent_id && map.has(item.parent_id)) {
      map.get(item.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function flattenTree(nodes: OrgLevelNode[], depth: number, expanded: Set<number>): { node: OrgLevelNode; depth: number }[] {
  const result: { node: OrgLevelNode; depth: number }[] = [];
  for (const node of nodes) {
    result.push({ node, depth });
    if (node.children.length > 0 && expanded.has(node.id)) {
      result.push(...flattenTree(node.children, depth + 1, expanded));
    }
  }
  return result;
}

export function OrganizationalLevelsPage() {
  const { t } = useLanguage();
  const { entities: items, getAll, create, update, remove, loadingMap, errorMap } = useEntityCrud<OrganizationalLevels>('/hr/organizational-levels', '/hr/organizational-levels');
  const entity = t('lookups.tabs.organizational_levels', 'hr') || 'Organizational Levels';
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [auditItem, setAuditItem] = useState<any>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => { getAll(); }, []);

  const tree = useMemo(() => buildTree(items), [items]);
  const flatRows = useMemo(() => flattenTree(tree, 0, expanded), [tree, expanded]);

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await remove(confirmDelete.id);
      toast.success(t('lookups.deleted', 'hr').replace('{name}', entity));
      setConfirmDelete(null);
    } catch (err : any) {
      handleApiError(err, { module: "hr" });
      getAll();
    }
  };

  const parentOptions = items.map(item => ({
    value: item.id,
    label: typeof item.name === 'string' ? item.name : (item.name?.ar || item.name?.en || ''),
  }));

  const columns = [
    { key: 'id', label: 'ID', width: 80 },
    {
      key: 'name', label: t('organizational_unit.name', 'hr') || 'Name', width: 400,
      render: (row: any) => {
        const flatRow = flatRows.find(r => r.node.id === row.id);
        const depth = flatRow?.depth ?? 0;
        const hasChildren = row.children?.length > 0;
        const isExpanded = expanded.has(row.id);
        return (
          <div className="flex items-center gap-1" style={{ paddingLeft: `${depth * 24}px` }}>
            {hasChildren ? (
              <button onClick={(e) => { e.stopPropagation(); toggleExpand(row.id); }} className="p-0.5 hover:bg-muted rounded">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : <span className="w-5" />}
            <span>{typeof row.name === 'string' ? row.name : (row.name?.ar || row.name?.en || '')}</span>
          </div>
        );
      },
    },
    { key: 'parent_id', label: t('organizational_unit.parent', 'hr') || 'Parent', width: 200,
      render: (row: any) => {
        if (!row.parent_id) return <span className="text-text-muted">—</span>;
        const parent = items.find(i => i.id === row.parent_id);
        return parent ? (typeof parent.name === 'string' ? parent.name : (parent.name?.ar || parent.name?.en || '')) : `#${row.parent_id}`;
      },
    },
    { key: 'actions', label: t('common.actions', 'shared') || 'Actions', width: 200,
      render: (row: any) => (
        <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => setEditItem(row)}
            title={t('common.edit', 'shared') || 'Edit'} requiredPermission="hr.organizational-levels.update">
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)}
            title={t('common.delete', 'shared') || 'Delete'} requiredPermission="hr.organizational-levels.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)}
            title={t('lookups.edit_log', 'hr') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
            <History size={16} />
          </Button>
        </div>
      ) },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t('lookups.tabs.organizational_levels', 'hr') || 'Organizational Levels'}</h1>
        <div className="w-full flex gap-2">
          <Button onClick={() => setIsCreateOpen(true)} requiredPermission="hr.organizational-levels.create">{t('employee_form.add_org_unit', 'hr') || 'Add Organizational Unit'}</Button>
        </div>
      </div>

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}
        title={t('organizational_unit.dialog_title', 'hr') || 'Add New Organizational Unit'}>
        <GenericCreateForm
          fields={[
            { name: 'name', type: 'alpha', label: t('organizational_unit.name', 'hr') || 'Name', required: true },
            { name: 'parent_id', label: t('organizational_unit.parent', 'hr') || 'Parent', type: 'select', options: [{ value: null, label: t('organizational_unit.none', 'hr') || 'None' }, ...parentOptions] },
          ]}
          schema={organizationalLevelFormSchema}
          onSubmit={async (data) => { try { return await create({ ...data , parent_id:data.parent_id == 0 ? null : data.parent_id, name:  data.name  }); } catch (err : any) { handleApiError(err, { module: "hr" }); throw {}; } }}
          onSuccess={() => { toast.success(t('lookups.created', 'hr').replace('{name}', entity)); getAll(); setIsCreateOpen(false); }}
          onCancel={() => setIsCreateOpen(false)}
          submitLabel={t('employee_form.add_org_unit', 'hr') || 'Add Organizational Unit'}
        />
      </Dialog>

      <Dialog isOpen={!!editItem} onClose={() => setEditItem(null)}
        title={t('common.edit', 'shared') + ' ' + entity}>
        <GenericCreateForm
          fields={[
            { name: 'name', type: 'alpha', label: t('organizational_unit.name', 'hr') || 'Name', required: true },
            { name: 'parent_id', label: t('organizational_unit.parent', 'hr') || 'Parent', type: 'select', options: [{ value: null, label: t('organizational_unit.none', 'hr') || 'None' }, ...parentOptions] },
          ]}
          schema={organizationalLevelFormSchema}
          defaultValues={editItem ? { name: typeof editItem.name === 'string' ? editItem.name : (editItem.name?.ar || editItem.name?.en || ''), parent_id: editItem.parent_id  } : undefined}
          onSubmit={async (data) => { try { await update(editItem.id, { ...data, name: data.name }); } catch (err : any) { handleApiError(err, { module: "hr" }); throw {}; } }}
          onSuccess={() => { toast.success(t('lookups.updated', 'hr').replace('{name}', entity)); getAll(); setEditItem(null); }}
          onCancel={() => setEditItem(null)}
          submitLabel={t('common.save', 'shared') || 'Save'}
        />
      </Dialog>

      {errorMap['getAll'] && <ErrorState message={errorMap['getAll']} onRetry={() => getAll()} />}
      {!errorMap['getAll'] && (
        <DataTable columns={columns} data={flatRows.map(r => ({ ...r.node, _depth: r.depth }))} rowKey="id" loading={loadingMap['getAll']}
          emptyMessage={t('lookups.no_organizational_levels', 'hr') || 'No organizational levels found'} />
      )}

      <ConfirmDialog isOpen={!!confirmDelete} type="danger"
        title={t('common.confirm_delete_title', 'shared').replace('{entity}', entity)}
        message={t('common.confirm_delete_message', 'shared').replace('{entity}', entity)}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        confirmLoading={loadingMap['remove']}
        onConfirm={handleDeleteConfirm} onCancel={() => setConfirmDelete(null)} />

      <AuditLog
        isOpen={!!auditItem}
        onClose={() => setAuditItem(null)}
        model="organizational_level"
        modelId={auditItem?.id}
        module="hr"
        labels={{
          title: t('lookups.edit_log', 'hr') || 'Edit Log',
          event: t('lookups.event', 'hr') || 'Event',
          created_at: t('lookups.created_at', 'hr') || 'Created At',
          changed_by: t('lookups.changed_by', 'hr') || 'Changed By',
          changes: t('lookups.changes', 'hr') || 'Changes',
          field: t('lookups.field', 'hr') || 'Field',
          old_value: t('lookups.old_value', 'hr') || 'Old Value',
          new_value: t('lookups.new_value', 'hr') || 'New Value',
          no_records: t('lookups.no_edit_log', 'hr') || 'No edit logs found',
          subject_id: t('lookups.subject_id', 'hr') || 'ID',
        }}
        translateField={(key) => t(`lookups.${key}`, 'hr') || key}
      />
    </div>
  );
}
