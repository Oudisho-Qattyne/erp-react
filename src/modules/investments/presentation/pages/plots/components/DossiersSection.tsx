import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { ConfirmDialog } from '../../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { ErrorState } from '../../../../../../core/presentation/layouts/ui/state/ErrorState';
import { LoadingState } from '../../../../../../core/presentation/layouts/ui/state/LoadingState';
import { GenericCreateForm } from '../../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { getCreateDossierSchema, type DossierFormData } from '../../../schemas/dossier.schema';
import { buildDossierDefaultValues, buildDossierFormFields } from '../../../forms/dossierFormConfig';
import { toast } from 'sonner';
import { handleApiError } from '../../../../../../core/presentation/utils/handleApiError';
import { Plus, Eye, Trash2, CheckCircle, Pencil } from 'lucide-react';
import type { Dossier } from '../../../../domain/entities/dossier';
import type { PlotStatus } from '../../../../domain/valueObjects/plots/plotStatus';

interface Props {
  plotId: number;
  plotStatus: PlotStatus;
}

interface Deferred {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

export function DossiersSection({ plotId, plotStatus }: Props) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const canManage = plotStatus === 'allocated' || plotStatus === 'subscribed';

  const [showAdd, setShowAdd] = useState(false);
  const [editDossier, setEditDossier] = useState<Dossier | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Dossier | null>(null);
  const [confirmAllocateNewDossier, setConfirmAllocatedNewDossier] = useState<DossierFormData | null>(null);
  const [confirmAllocate, setConfirmAllocate] = useState<Dossier | null>(null);
  const [confirmEditAllocate, setConfirmEditAllocate] = useState<DossierFormData | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const pendingSubmitRef = useRef<Deferred | null>(null);

  const { entities: dossiers, getAll, create, remove, loadingMap, errorMap, pagination, update } = useEntityCrud<Dossier>(
    `/investments/plots/${plotId}/dossiers`,
    `/investments/plots/${plotId}/dossiers`
  );

  const fetchUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('per_page', String(perPage));
    return `/investments/plots/${plotId}/dossiers?${params.toString()}`;
  }, [plotId, page, perPage]);

  useEffect(() => {
    if (plotId) getAll(fetchUrl());
  }, [plotId, getAll, fetchUrl]);

  const schema = useMemo(() => getCreateDossierSchema(t), [t]);

  const runCreate = async (data: DossierFormData): Promise<unknown> => {
    try {
      const res = await create(data as unknown as Parameters<typeof create>[0]);
      toast.success(t('dossier.created', 'investments') || 'Dossier created successfully');
      return res;
    } catch (err) {
      handleApiError(err, { module: 'investments' });
      throw err;
    }
  };

  const runUpdate = async (
    dossierId: number,
    data: DossierFormData,
    successKey: 'updated' | 'allocated' = 'updated'
  ): Promise<unknown> => {
    try {
      const res = await update(dossierId, data as unknown as Parameters<typeof update>[1]);
      toast.success(t(`dossier.${successKey}`, 'investments') || 'Dossier updated successfully');
      return res;
    } catch (err) {
      handleApiError(err, { module: 'investments' });
      throw err;
    }
  };

  const onSubmitCreate = async (data: DossierFormData): Promise<unknown> => {
    const allocatedDossier = dossiers.find((d) => d.status === 'active');
    if ((plotStatus === 'allocated' || data.status === 'active') && allocatedDossier) {
      setConfirmAllocatedNewDossier(data);
      return new Promise<unknown>((resolve, reject) => {
        pendingSubmitRef.current = { resolve, reject };
      });
    }
    return runCreate(data);
  };

  const onSubmitEdit = async (data: DossierFormData): Promise<unknown> => {
    if (!editDossier) return;
    if (data.status === 'active' && editDossier.status !== 'active') {
      setConfirmEditAllocate(data);
      return new Promise<unknown>((resolve, reject) => {
        pendingSubmitRef.current = { resolve, reject };
      });
    }
    return runUpdate(editDossier.id, data);
  };

  const handleConfirmCreate = async () => {
    const data = confirmAllocateNewDossier;
    const pending = pendingSubmitRef.current;
    setConfirmAllocatedNewDossier(null);
    pendingSubmitRef.current = null;
    if (!data || !pending) return;
    try {
      pending.resolve(await runCreate(data));
    } catch (err) {
      pending.reject(err);
    }
  };

  const handleCancelCreateConfirm = () => {
    setConfirmAllocatedNewDossier(null);
    const pending = pendingSubmitRef.current;
    pendingSubmitRef.current = null;
    if (pending) pending.reject(new Error('cancelled'));
  };

  const handleConfirmEditAllocate = async () => {
    const data = confirmEditAllocate;
    const pending = pendingSubmitRef.current;
    setConfirmEditAllocate(null);
    pendingSubmitRef.current = null;
    if (!editDossier || !data || !pending) return;
    try {
      pending.resolve(await runUpdate(editDossier.id, data, 'allocated'));
    } catch (err) {
      pending.reject(err);
    }
  };

  const handleCancelEditAllocateConfirm = () => {
    setConfirmEditAllocate(null);
    const pending = pendingSubmitRef.current;
    pendingSubmitRef.current = null;
    if (pending) pending.reject(new Error('cancelled'));
  };

  const handleCreateSuccess = () => {
    setShowAdd(false);
    window.location.reload();
  };

  const handleEditSuccess = () => {
    setEditDossier(null);
    window.location.reload();
  };

  const closeFormDialog = () => {
    setShowAdd(false);
    setEditDossier(null);
  };

  const isEditing = !!editDossier;

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await remove((confirmDelete as unknown as { id: number }).id);
      toast.success(t('dossier.deleted', 'investments') || 'Dossier deleted successfully');
      setConfirmDelete(null);
      window.location.reload();
    } catch (err: unknown) {
      handleApiError(err, { module: 'investments' });
    }
  };

  const handleAllocate = useCallback(async (dossier: Dossier) => {
    try {
      await update(dossier.id, { status: 'active' } as unknown as Parameters<typeof update>[1]);
      toast.success(t('dossier.allocated', 'investments') || 'Dossier allocated successfully');
      window.location.reload();
    } catch (err: unknown) {
      handleApiError(err, { module: 'investments' });
    }
  }, [update, t]);

  const columns = useMemo(() => [
    {
      key: 'dossier_number',
      label: t('dossier.number', 'investments') || 'Dossier Number',
      width: 180,
      sortable: true,
    },
    {
      key: 'dossier_date',
      label: t('dossier.date', 'investments') || 'Dossier Date',
      width: 140,
      sortable: true,
    },
    {
      key: 'allocated_date',
      label: t('dossier.allocated_date', 'investments') || 'Allocated Date',
      width: 140,
      sortable: true,
      render: (row: Dossier) => row.allocated_date || '—',
    },
    {
      key: 'status',
      label: t('dossier.status', 'investments') || 'Status',
      width: 120,
      sortable: true,
      render: (row: Dossier) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            color: row.status === 'active' ? '#16a34a' : row.status === 'cancelled' ? '#dc2626' : row.status === 'allocatable' ? '#2563eb' : '#ca8a04',
            background: row.status === 'active' ? '#dcfce7' : row.status === 'cancelled' ? '#fef2f2' : row.status === 'allocatable' ? '#dbeafe' : '#fefce8',
          }}>
          {t(`dossier.status_${row.status}`, 'investments') || row.status}
        </span>
      ),
    },
    ...(canManage ? [{
      key: 'actions' as const,
      label: t('common.actions', 'shared') || 'Actions',
      width: 140,
      render: (row: Dossier) => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/investments/plots/${plotId}/dossiers/${row.id}`)}
            title={t('common.view', 'shared') || 'View'}
            requiredPermission="investments.plot-dossier.view">
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setEditDossier(row)}
            title={t('common.edit', 'shared') || 'Edit'}
            requiredPermission="investments.plot-dossier.update">
            <Pencil size={16} />
          </Button>
          <Button disabled={row.status == 'active'} variant="ghost" size="sm" onClick={() => setConfirmAllocate(row)}
            title={t('dossier.allocate', 'investments') || 'Allocate'}
            requiredPermission="investments.plot-dossier.update">
            <CheckCircle size={16} className="text-success" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)}
            title={t('common.delete', 'shared') || 'Delete'}
            requiredPermission="investments.plot-dossier.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
        </div>
      ),
    }] : []),
  ], [t, canManage, navigate, plotId]);

  const fields = useMemo(() => buildDossierFormFields(t, { plotStatus }), [t, plotStatus]);

  const createDefaultValues = useMemo(() => buildDossierDefaultValues(), []);
  const editDefaultValues = editDossier ? buildDossierDefaultValues(editDossier) : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('dossier.title', 'investments') || 'Dossiers'}</h2>
        <div className="flex items-center gap-2">
          {canManage && (
            <Button size="sm" onClick={() => setShowAdd(true)}
              requiredPermission="investments.plot-dossier.create">
              <Plus size={16} className="mr-1" />
              {t('dossier.add', 'investments') || 'Add Dossier'}
            </Button>
          )}
        </div>
      </div>

      {errorMap['getAll'] && <ErrorState message={errorMap['getAll']} onRetry={() => getAll(fetchUrl())} />}

      {!errorMap['getAll'] && (
        <DataTable
          columns={columns}
          data={dossiers}
          rowKey="id"
          loading={loadingMap['getAll']}
          emptyMessage={t('dossier.no_records', 'investments') || 'No dossiers found'}
          pagination={{
            page: pagination?.currentPage || 1,
            totalPages: pagination?.lastPage || 1,
            totalItems: pagination?.total || 0,
            onPageChange: (newPage: number) => setPage(newPage),
            itemsPerPage: perPage,
            onItemsPerPageChange: (size: number) => { setPerPage(size); setPage(1) },
            itemsPerPageOptions: [10, 25, 50, 100],
          }}
        />
      )}

      {loadingMap['getAll'] && dossiers.length === 0 && !errorMap['getAll'] && <LoadingState message={t('common.loading', 'shared') || 'Loading...'} />}

      <Dialog isOpen={showAdd || !!editDossier} onClose={closeFormDialog} title={isEditing ? (t('dossier.edit', 'investments') || 'Edit Dossier') : (t('dossier.add', 'investments') || 'Add Dossier')}>
        {editDossier ? (
          <GenericCreateForm
            key={`edit-dossier-${editDossier.id}`}
            schema={schema}
            fields={fields}
            defaultValues={editDefaultValues}
            onSubmit={onSubmitEdit}
            onSuccess={handleEditSuccess}
            onCancel={closeFormDialog}
            submitLabel={t('common.save', 'shared') || 'Save'}
          />
        ) : (
          <GenericCreateForm
            key="create-dossier"
            schema={schema}
            fields={fields}
            defaultValues={createDefaultValues}
            onSubmit={onSubmitCreate}
            onSuccess={handleCreateSuccess}
            onCancel={closeFormDialog}
            submitLabel={t('common.save', 'shared') || 'Save'}
          />
        )}
      </Dialog>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        type="danger"
        title={t('dossier.delete_title', 'investments') || 'Delete Dossier'}
        message={t('dossier.delete_message', 'investments') || 'Are you sure you want to delete this dossier?'}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmLoading={loadingMap['remove']}
      />

      <ConfirmDialog
        isOpen={!!confirmAllocateNewDossier}
        type="alert"
        title={t('dossier.allocate_new_title', 'investments') || 'Allocate New Dossier'}
        message={(t('dossier.allocate_new_message', 'investments') || 'Are you sure you want to unallocate the previous allocated dossier?') + ' ' + (t('dossier.allocate_unallocate_warning', 'investments') || '(if there is another allocated dossier it will be unallocated)')}
        confirmLabel={t('dossier.allocate', 'investments') || 'Allocate'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        onConfirm={handleConfirmCreate}
        onCancel={handleCancelCreateConfirm}
        confirmLoading={loadingMap['create']}
      />

      <ConfirmDialog
        isOpen={!!confirmAllocate}
        type="alert"
        title={t('dossier.allocate_title', 'investments') || 'Allocate Dossier'}
        message={(t('dossier.allocate_message', 'investments') || 'Are you sure you want to allocate this dossier?') + ' ' + (t('dossier.allocate_unallocate_warning', 'investments') || '(if there is another allocated dossier it will be unallocated)')}
        confirmLabel={t('dossier.allocate', 'investments') || 'Allocate'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        onConfirm={async () => { if (confirmAllocate) { await handleAllocate(confirmAllocate); setConfirmAllocate(null); } }}
        onCancel={() => setConfirmAllocate(null)}
        confirmLoading={loadingMap['update']}
      />

      <ConfirmDialog
        isOpen={!!confirmEditAllocate}
        type="alert"
        title={t('dossier.allocate_title', 'investments') || 'Allocate Dossier'}
        message={(t('dossier.allocate_message', 'investments') || 'Are you sure you want to allocate this dossier?') + ' ' + (t('dossier.allocate_unallocate_warning', 'investments') || '(if there is another allocated dossier it will be unallocated)')}
        confirmLabel={t('dossier.allocate', 'investments') || 'Allocate'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        onConfirm={handleConfirmEditAllocate}
        onCancel={handleCancelEditAllocateConfirm}
        confirmLoading={loadingMap['update']}
      />
    </div>
  );
}