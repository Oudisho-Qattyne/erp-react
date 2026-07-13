import { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApiClient } from '../../../../../../core/presentation/context/api/ApiClinetProvider';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { AuthContext, useAuth } from '../../../../../../core/infrastructure/auth/AuthProvider';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { ConfirmDialog } from '../../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { ErrorState } from '../../../../../../core/presentation/layouts/ui/state/ErrorState';
import { LoadingState } from '../../../../../../core/presentation/layouts/ui/state/LoadingState';
import { FormInput } from '../../../../../../core/presentation/layouts/ui/inputs/FormInput';
import { getCreateDossierSchema, type DossierFormData } from '../../../schemas/dossier.schema';
import { toast } from 'sonner';
import { Plus, Eye, Trash2, CheckCircle, Pencil, XCircle } from 'lucide-react';
import type { Dossier } from '../../../../domain/entities/dossier';
import type { PlotStatus } from '../../../../domain/valueObjects/plots/plotStatus';

interface Props {
  plotId: number;
  plotStatus: PlotStatus;
}

export function DossiersSection({ plotId, plotStatus }: Props) {
  const { t } = useLanguage();
  const apiClient = useApiClient();
  const navigate = useNavigate();
  const {hasPermission} = useAuth()

  const canManage = plotStatus === 'allocated' || plotStatus === 'subscribed';

  const [showAdd, setShowAdd] = useState(false);
  const [editDossier, setEditDossier] = useState<Dossier | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Dossier | null>(null);

  const [confirmAllocateNewDossier, setConfirmAllocatedNewDossier] = useState<DossierFormData | null>(null)
  const [confirmAllocate, setConfirmAllocate] = useState<Dossier | null>(null)
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

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

  const form = useForm<DossierFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dossier_number: '',
      dossier_date: new Date().toISOString().split('T')[0],
      status: plotStatus == "allocated" ? "active" : 'allocatable',
    },
  });

  const addDossier = async (data : DossierFormData) => {
    try {
      await create(data as any);
      toast.success(t('dossier.created', 'investments') || 'Dossier created successfully');
      setShowAdd(false);
      form.reset();
      if(confirmAllocateNewDossier){
        setConfirmAllocatedNewDossier(null)
      }
      getAll(fetchUrl());
    } catch (err: any) {
      toast.error(err?.message || t('dossier.create_error', 'investments') || 'Failed to create dossier');
    }
  }
  const handleAdd = async (data: DossierFormData) => {
    const allocatedDossier = dossiers.find(d => d.status == "active")
    if ((plotStatus == "allocated" || data.status == "active") && allocatedDossier) {
      setConfirmAllocatedNewDossier(data)
      return
    }
    await addDossier(data)
    
  };

  const handleEdit = async (data: DossierFormData) => {
    if (!editDossier) return;
    try {
      await update(editDossier.id, data as any);
      toast.success(t('dossier.updated', 'investments') || 'Dossier updated successfully');
      setEditDossier(null);
      form.reset();
      getAll(fetchUrl());
    } catch (err: any) {
      toast.error(err?.message || t('dossier.update_error', 'investments') || 'Failed to update dossier');
    }
  };

  const handleFormSubmit = async (data: DossierFormData) => {
    if (editDossier) {
      await handleEdit(data);
    } else {
      await handleAdd(data);
    }
  };

  const openEdit = (dossier: Dossier) => {
    const normalizeDate = (dateStr: string) => {
      if (!dateStr) return new Date().toISOString().split('T')[0];
      const isoMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
      if (isoMatch) return isoMatch[1];
      const parts = dateStr.split('-');
      if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateStr;
    };
    form.reset({
      dossier_number: dossier.dossier_number,
      dossier_date: normalizeDate(dossier.dossier_date),
      status: dossier.status,
    });
    setEditDossier(dossier);
  };

  const closeFormDialog = () => {
    setShowAdd(false);
    setEditDossier(null);
    form.reset();
  };

  const isEditing = !!editDossier;

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await remove((confirmDelete as any).id);
      toast.success(t('dossier.deleted', 'investments') || 'Dossier deleted successfully');
      setConfirmDelete(null);
      getAll(fetchUrl());
    } catch (err: any) {
      toast.error(err?.message || t('dossier.delete_error', 'investments') || 'Failed to delete dossier');
    }
  };

  const handleAllocate = async (dossier: Dossier) => {
    try {
      await update(dossier.id, { status: "active" });
      toast.success(t('dossier.allocated', 'investments') || 'Dossier allocated successfully');
      getAll(fetchUrl());
    } catch (err: any) {
      toast.error(err?.message || t('dossier.allocate_error', 'investments') || 'Failed to allocate dossier');
    }
  };

  

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
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)}
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
  ], [t, canManage, handleAllocate]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('dossier.title', 'investments') || 'Dossiers'}</h2>
        <div className="flex items-center gap-2">
          {canManage && (
            <Button size="sm" onClick={() => { form.reset({ dossier_number: '', dossier_date: new Date().toISOString().split('T')[0], status: 'allocatable' }); form.setValue('status' , plotStatus == "allocated" ? "active" : "allocatable"); setShowAdd(true); }}
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
          rowKey={'id' as any}
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
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormInput
              name="dossier_number"
              label={t('dossier.number', 'investments') || 'Dossier Number'}
              placeholder={t('dossier.number_placeholder', 'investments') || 'Enter dossier number'}
            />
            <FormInput
              name="dossier_date"
              label={t('dossier.date', 'investments') || 'Dossier Date'}
              type="date"
            />
            <FormInput
              name="status"
              disabled={plotStatus == "allocated"}
              label={t('dossier.status', 'investments') || 'Status'}
              type="select"
              options={isEditing ? [
                { value: 'draft', label: t('dossier.status_draft', 'investments') || 'Draft' },
                { value: 'active', label: t('dossier.status_active', 'investments') || 'Allocated' },
                { value: 'allocatable', label: t('dossier.status_allocatable', 'investments') || 'Allocatable' },
                { value: 'cancelled', label: t('dossier.status_cancelled', 'investments') || 'Cancelled' },
                
              ] : [
                { value: 'draft', label: t('dossier.status_draft', 'investments') || 'Draft' },
                { value: 'active', label: t('dossier.status_active', 'investments') || 'Allocated' },
                { value: 'allocatable', label: t('dossier.status_allocatable', 'investments') || 'Allocatable' },
                { value: 'cancelled', label: t('dossier.status_cancelled', 'investments') || 'Cancelled' },
              ]}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={closeFormDialog}>
                {t('common.cancel', 'shared') || 'Cancel'}
              </Button>
              <Button type="submit" isLoading={loadingMap[isEditing ? 'update' : 'create']}>
                {t('common.save', 'shared') || 'Save'}
              </Button>
            </div>
          </form>
        </FormProvider>
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
        message={t('dossier.allocate_new_message', 'investments') || 'Are you sure you want to unallocate the previous allocated dossier?'}
        confirmLabel={t('dossier.allocate', 'investments') || 'Allocate'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        onConfirm={() => {if(confirmAllocateNewDossier) addDossier(confirmAllocateNewDossier)}}
        onCancel={() => setConfirmAllocatedNewDossier(null)}
        confirmLoading={loadingMap['create']}
      />

      <ConfirmDialog
        isOpen={!!confirmAllocate}
        title={t('dossier.allocate_title', 'investments') || 'Allocate Dossier'}
        message={t('dossier.allocate_message', 'investments') || 'Are you sure you want to allocate this dossier?'}
        confirmLabel={t('dossier.allocate', 'investments') || 'Allocate'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        onConfirm={async () => { if (confirmAllocate) { await handleAllocate(confirmAllocate); setConfirmAllocate(null); } }}
        onCancel={() => setConfirmAllocate(null)}
        confirmLoading={loadingMap['update']}
      />
    </div>
  );
}
