import { useState, useEffect, useRef, useCallback } from 'react';
import { FormProvider } from 'react-hook-form';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { FormInput } from '../../../../core/presentation/layouts/ui/inputs/FormInput';
import Input from '../../../../core/presentation/layouts/ui/inputs/Input';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { useDynamicForm } from '../../../../core/presentation/hooks/useDynamicForm221';
import { useDialogClose } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import { useConfirmOnClose } from '../../../../core/presentation/layouts/ui/dialog/useConfirmOnClose';
import { getCreateRoleSchema, type RoleFormValues } from '../schemas/roleForm';
import { useManageRoles } from '../hooks/useManageRoles';
import type { Permissions, Permission } from '../../domain/entities/permissions';
import { getPermissionDisplayName } from '../utils/getPermissionDisplayName';
import { applyServerValidationErrors } from '../../../../core/presentation/utils/handleApiError';

const ROLE_EMPTY_DEFAULTS: RoleFormValues = {
  name: '',
  display_name: '',
  permissions: [],
};

interface RoleFormProps {
  defaultValues?: Partial<RoleFormValues>;
  onSubmit: (data: RoleFormValues) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export function RoleForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel,
  loading = false,
}: RoleFormProps) {
  const { t, language } = useLanguage();
  const { getPermissions } = useManageRoles();
  const [permissionsData, setPermissionsData] = useState<Permissions | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  const schema = getCreateRoleSchema(t);
  const { form: methods } = useDynamicForm({
    schema,
    defaultValues: { ...ROLE_EMPTY_DEFAULTS, ...defaultValues } as RoleFormValues,
    mode: 'onChange',
  });
  const { formState, watch, setValue } = methods;
  const { isValid, isSubmitting } = formState;
  const selectedPermissions = watch('permissions') || [];

  const { requestClose } = useDialogClose();
  useConfirmOnClose(() => methods.formState.isDirty);

  const handleCancel = () => {
    if (requestClose) {
      requestClose();
    } else {
      onCancel?.();
    }
  };

  useEffect(() => {
    getPermissions()
      .then((res) => setPermissionsData(res.data))
      .catch(() => {})
      .finally(() => setPermissionsLoading(false));
  }, []);

  const togglePermission = (permId: number) => {
    const updated = selectedPermissions.includes(permId)
      ? selectedPermissions.filter((id) => id !== permId)
      : [...selectedPermissions, permId];
    setValue('permissions', updated, { shouldValidate: true, shouldDirty: true });
  };

  const toggleGroup = useCallback((permIds: number[], currentlySelected: boolean) => {
    const updated = currentlySelected
      ? selectedPermissions.filter((id) => !permIds.includes(id))
      : [...selectedPermissions, ...permIds.filter((id) => !selectedPermissions.includes(id))];
    setValue('permissions', updated, { shouldValidate: true, shouldDirty: true });
  }, [selectedPermissions, setValue]);

  const actualSubmitLabel = submitLabel || t('role_form.save', 'users') || 'Save Role';
  const actualCancelLabel = cancelLabel || t('role_form.cancel', 'users') || 'Cancel';

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(async (data) => {
        try {
          await onSubmit(data);
        } catch (err: any) {
          applyServerValidationErrors(err, methods.setError);
          throw err;
        }
      })} className="space-y-6">
        <div className="bg-card rounded-lg p-4 border border-border">
          <h3 className="text-lg font-bold mb-4">{t('role_form.name', 'users') || 'Role Information'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              name="name"
              type="alpha"
              label={t('role_form.name', 'users') || 'Name'}
              required
            />
            <FormInput
              name="display_name"
              type="alpha"
              label={t('role_form.display_name', 'users') || 'Display Name'}
              required
            />
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <h3 className="text-lg font-bold mb-4">{t('role_form.permissions', 'users') || 'Permissions'}</h3>
          {permissionsLoading ? (
            <div className="py-8 text-center text-text-muted">
              {t('common.loading', 'shared') || 'Loading...'}
            </div>
          ) : permissionsData ? (
            <div className="space-y-6">
              {Object.entries(permissionsData).map(([moduleName, groups]) => (
                <div key={moduleName} className="border border-border rounded-lg p-4">
                  <h4 className="text-md font-bold mb-3 text-primary">{moduleName}</h4>
                  <div className="space-y-3">
                    {Object.entries(groups).map(([groupKey, perms]) => {
                      const permIds = perms.map(p => p.id);
                      const selectedCount = permIds.filter(id => selectedPermissions.includes(id)).length;
                      const allSelected = selectedCount === permIds.length;
                      const noneSelected = selectedCount === 0;

                      return (
                        <div key={groupKey}>
                          <label className="flex items-center gap-2 mb-2 cursor-pointer">
                            <GroupCheckbox
                              checked={allSelected}
                              indeterminate={!allSelected && !noneSelected}
                              onChange={() => toggleGroup(permIds, allSelected)}
                            />
                            <span className="text-sm font-semibold text-text-muted capitalize">{groupKey}</span>
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {perms.map((perm) => (
                              <label
                                key={perm.id}
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-primary-light/5 cursor-pointer"
                              >
                                <Input
                                  type="checkbox"
                                  value={selectedPermissions.includes(perm.id)}
                                  onChange={() => togglePermission(perm.id)}
                                />
                                <span className="text-sm text-text">{getPermissionDisplayName(perm, t, language)}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-danger">
              {t('common.error', 'shared') || 'Failed to load permissions'}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={handleCancel}>
              {actualCancelLabel}
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={!isValid || isSubmitting || loading}>
            {isSubmitting || loading ? (t('role_form.saving', 'users') || 'Saving...') : actualSubmitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

function GroupCheckbox({ checked, indeterminate, onChange }: { checked: boolean; indeterminate: boolean; onChange: () => void }) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary cursor-pointer"
    />
  );
}
