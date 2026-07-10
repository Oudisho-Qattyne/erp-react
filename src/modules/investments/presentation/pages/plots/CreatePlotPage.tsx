import React from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Plot } from '../../../domain/entities/plot';
import { PlotForm } from './components/PlotForm';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';

export function CreatePlotPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { create } = useEntityCrud<Plot>('/investments/plots', '/investments/plots');
  const entityName = t('plots.title', 'investments') || 'Plot';

  const handleBack = () => navigate('/investments/plots');

  const handleSubmit = async (data: any) => {
    try {
      return await create(data);
    } catch (err: any) {
      toast.error((t('plots.create_error', 'investments') || 'Failed to create plot').replace('{name}', entityName));
      throw err;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowRight size={16} /> {t('plots.back_to_list', 'investments') || 'Back to Plots'}
        </Button>
        <h1 className="text-2xl font-bold">{t('plots.add', 'investments') || 'Add Plot'}</h1>
      </div>

      <PlotForm
        isCreate={true}
        defaultValues={{
          created_at: new Date().toISOString().split('T')[0]
        }}
        onSubmit={handleSubmit}
        onSuccess={() => {
          toast.success((t('plots.created', 'investments') || 'Plot created successfully').replace('{name}', entityName));
          navigate('/investments/plots');
        }}
        onCancel={handleBack}
        submitLabel={t('plots.add', 'investments') || 'Add Plot'}
      />
    </div>
  );
}
