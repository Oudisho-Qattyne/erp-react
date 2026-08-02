import { useEffect, useState } from 'react';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import type { Plot } from '../../../../domain/entities/plot';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { LoadingState } from '../../../../../../core/presentation/layouts/ui/state/LoadingState';
import { SectionCard } from '../../../../../../core/presentation/layouts/ui/card/SectionCard';
import { MapPin } from 'lucide-react';

interface Props {
  plotId: string;
  plot?: Plot | null;
}

export function PlotDetailsSection({ plotId, plot: plotProp }: Props) {
  const { t } = useLanguage();
  const { getById, loadingMap } = useEntityCrud<Plot>('/investments/plots', '/investments/plots');
  const [plot, setPlot] = useState<Plot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (plotProp) {
      setPlot(plotProp);
      return;
    }
    if (!plotId) return;
    getById(Number(plotId))
      .then((res) => {
        if (res?.data) setPlot(res.data);
        else setError(t('plots.not_found', 'investments') || 'Plot not found');
      })
      .catch((err) => setError(err?.message || t('plots.load_error', 'investments') || 'Failed to load plot'));
  }, [plotId, plotProp]);

  if (!plotId) return null;

  return (
    <SectionCard title={t('plots.section_title', 'investments') || 'Plot'} icon={<MapPin size={20} />}>
      {loadingMap['getById'] && !plot ? (
        <div className="py-8"><LoadingState message={t('common.loading', 'shared') || 'Loading...'} /></div>
      ) : error || !plot ? null : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-sm text-text-muted">{t('plots.code', 'investments') || 'Code'}</span>
            <p className="font-medium text-text">{plot.code || '—'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-text-muted">{t('plots.identifier', 'investments') || 'Identifier'}</span>
            <p className="font-medium text-text">{plot.identifier || '—'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-text-muted">{t('plots.area', 'investments') || 'Area'}</span>
            <p className="font-medium text-text">{plot.area ? `${plot.area} ㎡` : '—'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-text-muted">{t('plots.plot_area_id', 'investments') || 'Plot Area'}</span>
            <p className="font-medium text-text">{plot.plot_area?.name || plot.plot_area_name || '—'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-text-muted">{t('plots.plot_classification_id', 'investments') || 'Classification'}</span>
            <p className="font-medium text-text">{plot.plot_classification?.name || plot.plot_classification_name || '—'}</p>
          </div>
              <div className="space-y-1">
                  <span className="text-sm text-text-muted">{t('plots.current_condition', 'investments') || 'Current Condition'}</span>
                  <div className="font-medium text-text">
                    {plot?.service_conditions?.length
                      ? plot.service_conditions.map((sc, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span>{sc.name}</span>
                            {sc.note && <span className="text-xs text-text-muted">({sc.note})</span>}
                          </div>
                        ))
                      : '—'}
                  </div>
                </div>
              <div className="space-y-1">
                  <span className="text-sm text-text-muted">{t('plots.service_status_conditions', 'investments') || 'Service Status Conditions'}</span>
                  <div className="font-medium text-text">
                    {plot?.service_status_conditions?.length
                      ? plot.service_status_conditions.map((sc, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span>{sc.name}</span>
                            {sc.service_status && <span className="text-xs text-primary">[{sc.service_status}]</span>}
                            {sc.note && <span className="text-xs text-text-muted">({sc.note})</span>}
                          </div>
                        ))
                      : '—'}
                  </div>
                </div>
          <div className="space-y-1">
            <span className="text-sm text-text-muted">{t('plots.location', 'investments') || 'Location'}</span>
            <div className="flex items-center gap-2">
              <p className="font-medium text-text">
                {plot.latitude && plot.longitude ? `${plot.latitude}, ${plot.longitude}` : '—'}
              </p>
              {plot.latitude && plot.longitude && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto"
                  onClick={() => window.open(`https://www.google.com/maps?q=${plot.latitude},${plot.longitude}`, '_blank')}
                  title={t('plots.show_map', 'investments') || 'Show in Map'}
                >
                  <MapPin size={16} className="text-success" />
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-text-muted">{t('plots.added_by', 'investments') || 'Added By'}</span>
            <p className="font-medium text-text">{plot.user?.name || '—'}</p>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
