// src/modules/hr/presentation/components/OrganizationalUnitTreeSelect.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useEntityCrud } from '../hooks';
import type { OrganizationalLevels } from '../../../../core/domain/entities/organizationalLevels/organizationalLevels';
import { CustomSelect } from '../../../../core/presentation/layouts/ui/inputs/CustomSelect';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import { GenericCreateForm } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { organizationalLevelFormSchema } from '../../../../core/presentation/schemas/organizationalLevels/organizationalLevel.Schema';

export function OrganizationalUnitTreeSelect({
  value,
  onChange,
  label = 'الوحدة التنظيمية',
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
  const { getAll: loadOrgUnits, create } = useEntityCrud<OrganizationalLevels>(
    'hr/organizational-levels',
    'hr/organizational-levels'
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

  // Build path from root to a given unit ID
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
    onChange(result.id);
    setIsCreateDialogOpen(false);
  };

  const handleSelectAtLevel = (levelIndex: number, newUnitId: number) => {
    // Truncate path at this level: the new selection becomes the unit, and we discard any deeper units
    onChange(newUnitId);
  };

  if (loading) {
    return <div className="animate-pulse h-10 bg-muted rounded-md" />;
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium">
          {label} {required && '*'}
        </label>
      )}

      {/* Render levels based on the selected path */}
      {(() => {
        const levels: React.ReactNode[] = [];
        // For each step in the path, we need to render a select for the children of the current parent
        // We start with root (parentId = 0)
        let parentId = 0;
        for (let idx = 0; idx <= selectedPath.length; idx++) {
          const isLast = idx === selectedPath.length;
          const currentSelectedId = isLast ? undefined : selectedPath[idx].id;
          const children = getChildren(parentId);
          if (children.length === 0 && !currentSelectedId) break;

          const levelNumber = idx + 1;
          const selectLabel = levelNumber === 1 ? label : `المستوى ${levelNumber}`;

          levels.push(
            <div key={parentId} className="space-y-2">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">{selectLabel}</label>
                  <CustomSelect
                    options={children.map(c => ({ value: String(c.id), label: c.name as string }))}
                    value={currentSelectedId ? String(currentSelectedId) : ''}
                    onChange={(val) => {
                      const newId = val ? Number(val) : undefined;
                      if (newId) {
                        handleSelectAtLevel(levelNumber - 1, newId);
                      }
                    }}
                    placeholder="اختر..."
                    disabled={disabled}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCreateParentId(parentId);
                    setIsCreateDialogOpen(true);
                  }}
                  disabled={disabled}
                  className="mb-0.5"
                >
                  + جديد
                </Button>
              </div>
            </div>
          );

          // If this level has a selected unit, move to its children for next iteration
          if (currentSelectedId) {
            parentId = currentSelectedId;
          } else {
            break;
          }
        }
        return levels;
      })()}

      {error && <p className="text-danger text-xs">{error}</p>}

      <Dialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} title="إضافة وحدة تنظيمية جديدة" size="md">
        <GenericCreateForm
          schema={organizationalLevelFormSchema}
          defaultValues={{ parent_id: createParentId }}
          onSubmit={handleCreate}
          onSuccess={() => {}}
          onCancel={() => setIsCreateDialogOpen(false)}
          submitLabel="إضافة"
        />
      </Dialog>
    </div>
  );
}