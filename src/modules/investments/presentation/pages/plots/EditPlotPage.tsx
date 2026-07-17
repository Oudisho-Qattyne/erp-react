import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Plot } from '../../../domain/entities/plot';
import { PlotForm } from './components/PlotForm';
import { DossiersSection } from './components/DossiersSection';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { LoadingState } from '../../../../../core/presentation/layouts/ui/state/LoadingState';
import { useStorage } from '../../../../../core/registry/storage/StorageProvider';

export function EditPlotPage() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, update } = useEntityCrud<Plot>('/investments/plots', '/investments/plots');
  const storage = useStorage();
  const entityName = t('plots.title', 'investments') || 'Plot';

  const [plot, setPlot] = useState<Plot | null>(null);
  const [loading, setLoading] = useState(true);
  const [FileExplorerOpen, setFileExplorerOpen] = useState<boolean>(false)

  useEffect(() => {
    if (id) {
      getById(Number(id)).then(res => {
        if (res?.data) setPlot(res.data);
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleBack = () => navigate('/investments/plots');

  const handleSubmit = async (data: any) => {
    try {
      return await update(Number(id), data);
    } catch (err: any) {
      toast.error(err?.message || (t('plots.update_error', 'investments') || 'Failed to update plot').replace('{name}', entityName));
      throw err;
    }
  };

  if (loading) return <div className="p-6"><LoadingState message={t('common.loading', 'shared') || 'Loading...'} /></div>;
  if (!plot) return <div className="p-6 text-center text-danger">Plot not found</div>;

  return (
    <div className="p-6 w-full mx-auto space-y-6">
      <div className='relative w-full flex justify-between items-center'>

        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowRight size={16} /> {t('plots.back_to_list', 'investments') || 'Back to Plots'}
          </Button>
          <h1 className="text-2xl font-bold">{(t('common.edit', 'shared') || 'Edit') + ' ' + (t('plots.title', 'investments') || 'Plot')}</h1>
        </div>
        {storage?.FileExplorerDialogComponent && plot?.folder_id && (
          <Button variant="outline" onClick={() => setFileExplorerOpen(true)} requiredPermission="storage.storage.view">
            {t('plots.folder', 'investments') || 'مجلد المقسم'}
          </Button>
        )}
      </div>

      <PlotForm
        isCreate={false}
        plot={plot}
        defaultValues={{
          code: plot.code,
          identifier: plot.identifier,
          area: plot.area,
          plot_area_id: plot.plot_area_id,
          plot_classification_id: plot.plot_classification_id,
          latitude: plot.latitude,
          longitude: plot.longitude,
          service_conditions:null,
          status: plot.status
        }}
        onSubmit={handleSubmit}
        onSuccess={() => {
          toast.success((t('plots.updated', 'investments') || 'Plot updated successfully').replace('{name}', entityName));
          navigate('/investments/plots');
        }}
        onCancel={handleBack}
        submitLabel={t('common.save', 'shared') || 'Save'}
      />
      {storage?.FileExplorerDialogComponent && plot?.folder_id &&
        <storage.FileExplorerDialogComponent isOpen={FileExplorerOpen} onClose={() => { setFileExplorerOpen(false) }} folderId={plot.folder_id} />
      }
      {
        plot.status != "unsold" && plot.status != "announced" &&
        <DossiersSection plotId={Number(id)} plotStatus={plot.status}  />
      }
    </div>
  );
}
