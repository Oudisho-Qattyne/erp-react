import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { useManageRoles } from '../hooks/useManageRoles';
import { RoleForm } from '../components/RoleForm';
import type { RoleFormValues } from '../schemas/roleForm';
import type { Permissions } from '../../domain/entities/permissions';

function extractPermissionIds(permissions: Permissions): number[] {
  const ids: number[] = [];
  for (const groups of Object.values(permissions)) {
    for (const perms of Object.values(groups)) {
      for (const perm of perms) {
        ids.push(perm.id);
      }
    }
  }
  return ids;
}

export function EditRolePage() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getById, update, loading, error } = useManageRoles();

  const [defaultValues, setDefaultValues] = useState<Partial<RoleFormValues> | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getById(Number(id))
      .then((res) => {
        setDefaultValues({
          name: res.data.name,
          display_name: res.data.display_name,
          permissions: extractPermissionIds((res.data as any).permissions || {}),
        });
      })
      .catch((err: any) => {
        setPageError(err?.message || t('edit_role.load_error', 'users') || 'Error loading role data');
      })
      .finally(() => setPageLoading(false));
  }, [id]);

  const handleUpdate = async (data: RoleFormValues) => {
    if (!id) return;
    await update(Number(id), data);
    navigate(`/users/roles/${id}`);
  };

  if (pageLoading) {
    return (
      <div className="p-4 py-8 text-center">
        {t('common.loading', 'shared') || 'Loading...'}
      </div>
    );
  }

  if (pageError || !defaultValues) {
    return (
      <div className="p-4">
        <div className="py-8 text-center text-danger">{pageError || t('edit_role.not_found', 'users') || 'Role not found'}</div>
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => navigate('/users/roles')}>
            <ArrowRight size={16} /> {t('edit_role.back_to_list', 'users') || 'Back to List'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/users/roles')}
          leftIcon={<ArrowRight size={18} />}
          className="text-text-muted hover:text-text"
        >
          {t('edit_role.back', 'users') || 'Back'}
        </Button>
        <h1 className="text-xl font-bold">{t('edit_role.title', 'users') || 'Edit Role'}</h1>
      </div>

      <RoleForm
        defaultValues={defaultValues}
        onSubmit={handleUpdate}
        onCancel={() => navigate('/users/roles')}
        submitLabel={t('edit_role.submit', 'users') || 'Update Role'}
        loading={loading['update']}
      />
    </div>
  );
}
