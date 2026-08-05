import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Users, Calendar } from 'lucide-react';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { SectionCard } from '../../../../core/presentation/layouts/ui/card/SectionCard';
import { ProfileHeader } from '../../../../core/presentation/layouts/ui/card/ProfileHeader';
import { LoadingState } from '../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../core/presentation/layouts/ui/state/ErrorState';
import type { DetailedRole } from '../../domain/entities/role';
import { useManageRoles } from '../hooks/useManageRoles';
import { getPermissionDisplayName } from '../utils/getPermissionDisplayName';
import { handleApiError } from '../../../../core/presentation/utils/handleApiError';

export function ShowRolePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { getById } = useManageRoles();

  const [role, setRole] = useState<DetailedRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getById(Number(id))
      .then((res) => setRole(res.data))
      .catch((err: any) => setError(handleApiError(err, { module: "users", silent: true })))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState message={t('common.loading', 'shared') || 'Loading...'} />;

  if (error || !role) {
    return (
      <ErrorState
        message={error || t('show_role.not_found', 'users') || 'Role not found'}
        onRetry={() => navigate('/users/roles')}
        retryLabel={t('show_role.back_to_list', 'users') || 'Back to List'}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 p-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/users/roles')}
          leftIcon={<ArrowRight size={18} />}
          className="text-text-muted hover:text-text"
        >
          {t('show_role.back', 'users') || 'Back'}
        </Button>
        <Button variant="primary" onClick={() => navigate(`/users/roles/${id}/edit`)} requiredPermission="users.roles.edit">
          {t('show_role.edit', 'users') || 'Edit Role'}
        </Button>
      </div>

      <ProfileHeader avatar={<Shield size={40} className="text-primary opacity-80" />}>
        <h1 className="text-2xl md:text-3xl font-bold text-text">{role.display_name}</h1>
        <p className="text-text-muted text-base">{role.name}</p>
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-sm text-text-muted/80">
          <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-lg border border-border/50">
            <Users size={14} className="text-primary" />
            <span>{t('show_role.users_count', 'users').replace('{count}', String(role.number_of_users))}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-lg border border-border/50">
            <Calendar size={14} className="text-primary" />
            <span>{t('show_role.created_at', 'users').replace('{date}', role.created_at)}</span>
          </div>
        </div>
      </ProfileHeader>

      <SectionCard
        title={t('show_role.permissions', 'users') || 'Permissions'}
        icon={<Shield size={20} />}
        empty={!role.permissions || Object.keys(role.permissions).length === 0}
        emptyMessage={t('show_role.no_permissions', 'users') || 'No permissions assigned'}
        emptyIcon={<Shield size={24} />}
      >
        <div className="space-y-6">
          {Object.entries(role.permissions!).map(([moduleName, groups]) => (
            <div key={moduleName} className="border border-border/60 rounded-xl p-5">
              <h3 className="text-md font-bold text-text mb-4">{moduleName}</h3>
              <div className="space-y-4">
                {Object.entries(groups).map(([groupKey, perms]) => (
                  <div key={groupKey}>
                    <h4 className="text-sm font-semibold text-text-muted mb-2 capitalize">{groupKey}</h4>
                    <div className="flex flex-wrap gap-2">
                      {perms.map((perm) => (
                        <span
                          key={perm.id}
                          className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20"
                        >
                          {getPermissionDisplayName(perm, t, language)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
