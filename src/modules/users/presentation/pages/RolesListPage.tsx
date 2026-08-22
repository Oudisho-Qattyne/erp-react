import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { DataTable, type ColumnDef } from '../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import { ConfirmDialog } from '../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import type { Role } from '../../domain/entities/role';
import { useManageRoles } from '../hooks/useManageRoles';
import { RoleForm } from '../components/RoleForm';
import type { RoleFormValues } from '../schemas/roleForm';
import { LoadingState } from '../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../core/presentation/layouts/ui/state/ErrorState';

export function RolesListPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleFilter, setRoleFilter] = useState<{ page?: number; per_page?: number }>({});
  const [rolePagination, setRolePagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    hasMore: false,
  });

  const { getAll, create, remove, loading, error } = useManageRoles();
  const isLoading = loading['getAll'];
  const listError = error['getAll'];
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const fetchRoles = async () => {
    try {
      const res = await getAll(roleFilter);
      setRoles(res.data);
      setRolePagination({
        currentPage: res.pagination?.currentPage || 1,
        lastPage: res.pagination?.lastPage || 1,
        total: Number(res.pagination?.total) || 0,
        hasMore: res.pagination?.hasMore || false,
      });
    } catch {
      // error is tracked by the hook
    }
  };

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;
    try {
      await remove(roleToDelete.id);
      setRoles((prev) => prev.filter((r) => r.id !== roleToDelete.id));
    } catch {
      // error is tracked by the hook
    }
    setRoleToDelete(null);
  };

  const handleCreateRole = async (data: RoleFormValues) => {
    await create(data);
    setIsAddDialogOpen(false);
    fetchRoles();
  };

  const columns: ColumnDef<Role>[] = [
    {
      key: 'name',
      label: t('roles.name', 'users') || 'Name',
      width: 180,
    },
    {
      key: 'display_name',
      label: t('roles.display_name', 'users') || 'Display Name',
      width: 200,
    },
    {
      key: 'number_of_users',
      label: t('roles.number_of_users', 'users') || 'Users Count',
      width: 140,
    },
    {
      key: 'created_at',
      label: t('roles.created_at', 'users') || 'Created At',
      width: 160,
    },
    {
      key: 'actions',
      label: '',
      width: 120,
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/users/roles/${row.id}` , '_blank')}
            title={t('common.view', 'shared') || 'View'}
            requiredPermission="users.roles.view"
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/users/roles/${row.id}/edit`)}
            title={t('common.edit', 'shared') || 'Edit'}
            requiredPermission="users.roles.edit"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRoleToDelete(row)}
            title={t('common.delete', 'shared') || 'Delete'}
            requiredPermission="users.roles.delete"
            className="text-danger hover:text-danger"
          >
            <Trash2 size={16} />
          </Button>
        </div> 
      ),
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('roles.title', 'users') || 'Roles'}</h1>
        <Button variant="primary" onClick={() => setIsAddDialogOpen(true)} requiredPermission="users.roles.add">
          + {t('roles.add', 'users') || 'Add Role'}
        </Button>
      </div>

      {listError && <ErrorState message={listError} onRetry={fetchRoles} />}
      {!listError && (
        <DataTable
          columns={columns}
          data={roles}
          rowKey="id"
          loading={isLoading}
          emptyMessage={t('roles.no_data', 'users') || 'No roles found'}
          pagination={{
            page: rolePagination.currentPage,
            totalPages: rolePagination.lastPage,
            totalItems: rolePagination.total,
            onPageChange: (page) => setRoleFilter((prev) => ({ ...prev, page })),
            itemsPerPage: roleFilter.per_page,
            onItemsPerPageChange: (size) => setRoleFilter({ per_page: size, page: 1 }),
            itemsPerPageOptions: [10, 25, 50, 100],
          }}
        />
      )}

      <Dialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} title={t('roles.add', 'users') || 'Add Role'} size="2xl">
        <RoleForm
          onSubmit={handleCreateRole}
          onCancel={() => setIsAddDialogOpen(false)}
          loading={loading['create']}
        />
      </Dialog>

      <ConfirmDialog
        isOpen={!!roleToDelete}
        type="danger"
        title={t('roles.confirm_delete_title', 'users') || 'Delete Role'}
        message={
          t('roles.confirm_delete_message', 'users') ||
          'Are you sure you want to delete this role? This action cannot be undone.'
        }
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        confirmLoading={loading['remove']}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setRoleToDelete(null)}
      />
    </div>
  );
}
