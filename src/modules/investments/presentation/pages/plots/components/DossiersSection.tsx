import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApiClient } from '../../../../../../core/presentation/context/api/ApiClinetProvider';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { FilterDialog } from '../../../../../../core/presentation/layouts/ui/filter/FilterDialog';
import { ConfirmDialog } from '../../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { ErrorState } from '../../../../../../core/presentation/layouts/ui/state/ErrorState';
import { LoadingState } from '../../../../../../core/presentation/layouts/ui/state/LoadingState';
import Input from '../../../../../../core/presentation/layouts/ui/inputs/Input';
import { FormInput } from '../../../../../../core/presentation/layouts/ui/inputs/FormInput';
import { inputBaseClasses } from '../../../../../../core/presentation/layouts/ui/inputs/styles';
import { getCreateDossierSchema, type DossierFormData } from '../../../schemas/dossier.schema';
import { toast } from 'sonner';
import { Plus, Eye, Trash2, CheckCircle, Search } from 'lucide-react';
import type { Dossier } from '../../../../domain/entities/dossier';
import type { PlotStatus } from '../../../../domain/valueObjects/plots/plotStatus';

interface Props {
  plotId: number;
  plotStatus: PlotStatus;
}

export function DossiersSection({ plotId, plotStatus }: Props) {
  const { t } = useLanguage();
  const apiClient = useApiClient();

  const canManage = plotStatus === 'allocated' || plotStatus === 'subscribed';

  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState<Dossier | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Dossier | null>(null);

  const [localSearch, setLocalSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchDossiers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { ...filterValues };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const res = await apiClient.get<{ data: Dossier[] }>(`/investments/plots/${plotId}/dossiers`, { params });
      setDossiers(res.data);
    } catch (err: any) {
      setError(err.message || t('dossier.load_error', 'investments') || 'Failed to load dossiers');
    } finally {
      setLoading(false);
    }
  }, [apiClient, plotId, filterValues, searchQuery]);

  useEffect(() => {
    if (plotId) fetchDossiers();
  }, [plotId, fetchDossiers]);

  const schema = useMemo(() => getCreateDossierSchema(t), [t]);

  const form = useForm<DossierFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      number: '',
      date: new Date().toISOString().split('T')[0],
      status: 'active',
    },
  });

  const handleAdd = async (data: DossierFormData) => {
    try {
      await apiClient.post(`/investments/plots/${plotId}/dossiers`, data);
      toast.success(t('dossier.created', 'investments') || 'Dossier created successfully');
      setShowAdd(false);
      form.reset();
      fetchDossiers();
    } catch (err: any) {
      toast.error(t('dossier.create_error', 'investments') || 'Failed to create dossier');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await apiClient.delete(`/investments/dossiers/${(confirmDelete as any).id}`);
      toast.success(t('dossier.deleted', 'investments') || 'Dossier deleted successfully');
      setConfirmDelete(null);
      fetchDossiers();
    } catch (err: any) {
      toast.error(t('dossier.delete_error', 'investments') || 'Failed to delete dossier');
    }
  };

  const handleAllocate = async (dossier: Dossier) => {
    try {
      await apiClient.post(`/investments/dossiers/${(dossier as any).id}/allocate`);
      toast.success(t('dossier.allocated', 'investments') || 'Dossier allocated successfully');
      fetchDossiers();
    } catch (err: any) {
      toast.error(t('dossier.allocate_error', 'investments') || 'Failed to allocate dossier');
    }
  };

  const filterFields = useMemo(() => [
    {
      name: 'status', label: t('dossier.status', 'investments') || 'Status', type: 'select' as const, options: [
        { value: 'draft', label: t('dossier.status_draft', 'investments') || 'Draft' },
        { value: 'canceled', label: t('dossier.status_canceled', 'investments') || 'Canceled' },
        { value: 'active', label: t('dossier.status_active', 'investments') || 'Active' },
      ]
    },
  ], [t]);

  const columns = useMemo(() => [
    {
      key: 'number',
      label: t('dossier.number', 'investments') || 'Dossier Number',
      width: 180,
      sortable: true,
    },
    {
      key: 'date',
      label: t('dossier.date', 'investments') || 'Dossier Date',
      width: 140,
      sortable: true,
    },
    {
      key: 'status',
      label: t('dossier.status', 'investments') || 'Status',
      width: 120,
      sortable: true,
      render: (row: Dossier) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            color: row.status === 'active' ? '#16a34a' : row.status === 'canceled' ? '#dc2626' : '#ca8a04',
            background: row.status === 'active' ? '#dcfce7' : row.status === 'canceled' ? '#fef2f2' : '#fefce8',
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
          <Button variant="ghost" size="sm" onClick={() => setShowView(row)}
            title={t('common.view', 'shared') || 'View'}>
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleAllocate(row)}
            title={t('dossier.allocate', 'investments') || 'Allocate'}>
            <CheckCircle size={16} className="text-success" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)}
            title={t('common.delete', 'shared') || 'Delete'}>
            <Trash2 size={16} className="text-danger" />
          </Button>
        </div>
      ),
    }] : []),
  ], [t, canManage]);

  if (!plotId) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('dossier.title', 'investments') || 'Dossiers'}</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={t('common.search', 'shared') || 'Search...'}
              className="pr-8"
              baseClasses={inputBaseClasses}
            />
            <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setSearchQuery(localSearch)}>
              <Search size={16} />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)}>
            {t('common.filter', 'shared') || 'Filter'}
          </Button>
          {canManage && (
            <Button size="sm" onClick={() => { form.reset({ number: '', date: new Date().toISOString().split('T')[0], status: 'draft' }); setShowAdd(true); }}>
              <Plus size={16} className="mr-1" />
              {t('dossier.add', 'investments') || 'Add Dossier'}
            </Button>
          )}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={() => fetchDossiers()} />}

      {!error && (
        <DataTable
          columns={columns}
          data={dossiers}
          rowKey={'id' as any}
          loading={loading}
          emptyMessage={t('dossier.no_records', 'investments') || 'No dossiers found'}
        />
      )}

      {loading && dossiers.length === 0 && !error && <LoadingState />}

      <Dialog isOpen={showAdd} onClose={() => { setShowAdd(false); form.reset() }} title={t('dossier.add', 'investments') || 'Add Dossier'}>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4">
            <FormInput
              name="number"
              label={t('dossier.number', 'investments') || 'Dossier Number'}
              placeholder={t('dossier.number_placeholder', 'investments') || 'Enter dossier number'}
            />
            <FormInput
              name="date"
              label={t('dossier.date', 'investments') || 'Dossier Date'}
              type="date"
            />
            <FormInput
              name="status"
              label={t('dossier.status', 'investments') || 'Status'}
              type="select"
              options={[
                { value: 'draft', label: t('dossier.status_draft', 'investments') || 'Draft' },
                { value: 'canceled', label: t('dossier.status_canceled', 'investments') || 'Canceled' },
                { value: 'active', label: t('dossier.status_active', 'investments') || 'Active' },
              ]}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => { setShowAdd(false); form.reset() }}>
                {t('common.cancel', 'shared') || 'Cancel'}
              </Button>
              <Button type="submit">
                {t('common.save', 'shared') || 'Save'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </Dialog>

      <Dialog isOpen={!!showView} onClose={() => setShowView(null)} title={t('dossier.view', 'investments') || 'View Dossier'}>
        {showView && (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-text-muted">{t('dossier.number', 'investments') || 'Dossier Number'}</label>
              <p className="font-medium">{showView.number}</p>
            </div>
            <div>
              <label className="text-sm text-text-muted">{t('dossier.date', 'investments') || 'Dossier Date'}</label>
              <p className="font-medium">{showView.date}</p>
            </div>
            <div>
              <label className="text-sm text-text-muted">{t('dossier.status', 'investments') || 'Status'}</label>
              <p className="font-medium">{t(`dossier.status_${showView.status}`, 'investments') || showView.status}</p>
            </div>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        type="danger"
        title={t('dossier.delete_title', 'investments') || 'Delete Dossier'}
        message={t('dossier.delete_message', 'investments') || 'Are you sure you want to delete this dossier?'}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      <FilterDialog
        isOpen={isFilterOpen}
        fields={filterFields}
        initialValues={filterValues}
        onFilter={(values) => { setFilterValues(values); setIsFilterOpen(false) }}
        onCancel={() => setIsFilterOpen(false)}
        onReset={() => { setFilterValues({}); setIsFilterOpen(false) }}
      />
    </div>
  );
}
