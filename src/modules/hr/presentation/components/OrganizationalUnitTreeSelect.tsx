// src/modules/hr/presentation/components/OrganizationalUnitTreeSelect.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useEntityCrud } from '../hooks';
import type { OrganizationalLevels } from '../../../../core/domain/entities/organizationalLevels/organizationalLevels';
import { CustomSelect } from '../../../../core/presentation/layouts/ui/inputs/CustomSelect';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import { GenericCreateForm } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { organizationalLevelFormSchema } from '../../../../core/presentation/schemas/organizationalLevels/organizationalLevel.Schema';
import { Plus } from 'lucide-react';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';

export function OrganizationalUnitTreeSelect({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error,
}: {
  value?: number;
  onChange: (value: number | undefined) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}) {
  const { t } = useLanguage();

  const { getAll: loadOrgUnits, create } = useEntityCrud<OrganizationalLevels>(
    '/hr/organizational-levels',
    '/hr/organizational-levels'
  );
  const [allUnits, setAllUnits] = useState<OrganizationalLevels[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createParentId, setCreateParentId] = useState<number>(0);

  const loadData = useCallback(async () => {
    const res = await loadOrgUnits();
    setAllUnits(res.data);
    setLoading(false);
  }, [loadOrgUnits]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshUnits = useCallback(async () => {
    setLoading(true);
    await loadData();
  }, [loadData]);

  const unitMap = useMemo(() => {
    const map = new Map<number, OrganizationalLevels>();
    allUnits.forEach(u => map.set(u.id, u));
    return map;
  }, [allUnits]);

  const getChildren = useCallback((parentId: number) => {
    return allUnits.filter(u => (u.parent_id ?? 0) === parentId);
  }, [allUnits]);

  const getPathToId = useCallback((id?: number): OrganizationalLevels[] => {
    if (!id) return [];
    const path: OrganizationalLevels[] = [];
    let current = unitMap.get(id);
    while (current) {
      path.unshift(current);
      if (!current.parent_id || current.parent_id === 0) break;
      current = unitMap.get(current.parent_id);
    }
    return path;
  }, [unitMap]);

  const selectedPath = useMemo(() => getPathToId(value), [value, getPathToId]);

  const handleCreate = async (data: any) => {
    const result = await create(data);
    await refreshUnits();
    onChange(result.data.id);
    setIsCreateDialogOpen(false);
    return result
  };

  const handleSelectAtLevel = (levelIndex: number, newUnitId: number) => {
    onChange(newUnitId);
  };

  if (loading) {
    return <div className="animate-pulse h-10 bg-muted rounded-md" />;
  }

  // Build levels based on the selected path
  const levels: React.ReactNode[] = [];
  let parentId = 0;
  for (let idx = 0; idx <= selectedPath.length; idx++) {
    const isLast = idx === selectedPath.length;
    const currentSelectedId = isLast ? undefined : selectedPath[idx].id;
    const children = getChildren(parentId);
    const levelNumber = idx + 1;
    const selectLabel = levelNumber === 1 && label ? label : `${t('organizational_unit.level', 'hr') || 'المستوى'} ${levelNumber}`;

    // If there are no children and this is not the first level (i.e., we have a parent selected),
    // we will still show an empty select with a create button to add a child under the parent.
    if (children.length === 0 && idx > 0) {
      // Show an empty select (no options) + create button for the current parentId
      levels.push(
        <div key={`empty-${parentId}`} className="space-y-2">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">{selectLabel}</label>
              <CustomSelect
                options={[]}
                value=""
                onChange={() => { }}
                placeholder={t('organizational_unit.no_children', 'hr') || 'لا توجد وحدات فرعية'}
                disabled={disabled}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => {
                setCreateParentId(parentId);
                setIsCreateDialogOpen(true);
              }}
              disabled={disabled}
              className="shrink-0 h-9.5"
            >
              {disabled ? '' : t('organizational_unit.add', 'hr') || 'إضافة'}
            </Button>
          </div>
        </div>
      );
      break; // Stop after adding the empty level
    }

    // Normal level with existing children
    levels.push(
      <div key={parentId} className="space-y-2">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{selectLabel}</label>
            <CustomSelect
              options={children.map(c => ({ value: c.id, label: c.name as string }))}
              value={currentSelectedId ?? ''}
              onChange={(val) => {
                const newId = val ? Number(val) : (parentId === 0 ? undefined : parentId);
                onChange(newId);
              }}
              placeholder={t('organizational_unit.choose', 'hr') || 'اختر...'}
              disabled={disabled}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => {
              setCreateParentId(parentId);
              setIsCreateDialogOpen(true);
            }}
            disabled={disabled}
            className="shrink-0 h-9.5"
          >
            {disabled ? '' : t('organizational_unit.add', 'hr') || 'إضافة'}
          </Button>
        </div>
      </div>
    );

    // Move to the selected child if any
    if (currentSelectedId) {
      parentId = currentSelectedId;
    } else {
      break;
    }
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium">
          {label} {required && '*'}
        </label>
      )}

      {levels}

      {error && <p className="text-danger text-xs">{error}</p>}

      <Dialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} title={t('organizational_unit.dialog_title', 'hr') || 'إضافة وحدة تنظيمية جديدة'} size="md">
        <GenericCreateForm
          schema={organizationalLevelFormSchema}
          fields={[{ name: 'name', label: t('organizational_unit.name', 'hr') || 'الاسم', required: true }]}
          defaultValues={{ parent_id: createParentId }}
          onSubmit={handleCreate}
          onSuccess={() => { }}
          onCancel={() => setIsCreateDialogOpen(false)}
          submitLabel={t('organizational_unit.add', 'hr') || 'إضافة'}
        />
      </Dialog>
    </div>
  );
}