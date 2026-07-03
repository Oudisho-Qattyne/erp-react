import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Plot } from '../../../domain/entities/plot';
import { PlotForm } from './components/PlotForm';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { LoadingState } from '../../../../../core/presentation/layouts/ui/state/LoadingState';
import { useStorage } from '../../../../../core/registry/storage/StorageProvider';

export function EditPlotPage() {
  const { t, direction } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, update } = useEntityCrud<Plot>('/investments/plots', '/investments/plots');
  const storage = useStorage();

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
      toast.error(t('plots.update_error', 'investments') || 'Failed to update plot');
      throw err;
    }
  };

  if (loading) return <div className="p-6"><LoadingState /></div>;
  if (!plot) return <div className="p-6 text-center text-danger">Plot not found</div>;

  return (
    <div className="p-6 w-full mx-auto space-y-6">
      <div className='relative w-full flex justify-between items-center'>

        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="rounded-full w-10 h-10 p-0">
            <ArrowLeft size={20} className={direction === 'rtl' ? 'rotate-180' : ''} />
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
          identifier:plot.identifier,
          area: plot.area,
          plot_area_id: plot.plot_area_id,
          plot_classification_id: plot.plot_classification_id,
          latitude: plot.latitude,
          longitude: plot.longitude,
          current_condition: plot.current_condition,
          notes: plot.notes,
          status: plot.status
        }}
        onSubmit={handleSubmit}
        onSuccess={() => {
          toast.success(t('plots.updated', 'investments') || 'Plot updated successfully');
          navigate('/investments/plots');
        }}
        onCancel={handleBack}
        submitLabel={t('common.save', 'shared') || 'Save'}
      />
      {storage?.FileExplorerDialogComponent && plot?.folder_id &&
        <storage.FileExplorerDialogComponent isOpen={FileExplorerOpen} onClose={() => { setFileExplorerOpen(false) }} folderId={plot.folder_id} />
      }
    </div>
  );
}
