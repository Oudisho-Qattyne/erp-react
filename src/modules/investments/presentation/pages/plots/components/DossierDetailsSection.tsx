import { useEffect, useState } from 'react';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import type { Dossier } from '../../../../domain/entities/dossier';
import { LoadingState } from '../../../../../../core/presentation/layouts/ui/state/LoadingState';
import { SectionCard } from '../../../../../../core/presentation/layouts/ui/card/SectionCard';
import { InfoRow } from '../../../../../../core/presentation/layouts/ui/card/InfoRow';
import { FileText } from 'lucide-react';

interface Props {
  dossierId: string;
  plotId: string;
}

const statusStyles: Record<string, { color: string; bg: string }> = {
  active: { color: '#16a34a', bg: '#dcfce7' },
  cancelled: { color: '#dc2626', bg: '#fef2f2' },
  allocatable: { color: '#2563eb', bg: '#dbeafe' },
  draft: { color: '#ca8a04', bg: '#fefce8' },
};

export function DossierDetailsSection({ dossierId, plotId }: Props) {
  const { t } = useLanguage();
  const { getById, loadingMap } = useEntityCrud<Dossier>(
    `/investments/plots/${plotId}/dossiers`,
    `/investments/plots/${plotId}/dossiers`
  );
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dossierId || !plotId) return;
    getById(Number(dossierId))
      .then((res) => {
        if (res?.data) setDossier(res.data);
        else setError(t('dossier.not_found', 'investments') || 'Dossier not found');
      })
      .catch((err) => setError(err?.message || t('dossier.load_error', 'investments') || 'Failed to load dossier'));
  }, [dossierId, plotId]);

  if (!dossierId || !plotId) return null;

  const st = dossier?.status ? statusStyles[dossier.status] || statusStyles.draft : statusStyles.draft;

  return (
    <SectionCard title={t('dossier.section_title', 'investments') || 'Dossier'} icon={<FileText size={20} />}>
      {loadingMap['getById'] && !dossier ? (
        <div className="py-8"><LoadingState message={t('common.loading', 'shared') || 'Loading...'} /></div>
      ) : error || !dossier ? null : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoRow
            label={t('dossier.number', 'investments') || 'Dossier Number'}
            value={dossier.dossier_number}
          />
          <InfoRow
            label={t('dossier.date', 'investments') || 'Dossier Date'}
            value={dossier.dossier_date}
          />
          <InfoRow
            label={t('dossier.allocated_date', 'investments') || 'Allocated Date'}
            value={dossier.allocated_date || '—'}
          />
          <InfoRow
            label={t('dossier.status', 'investments') || 'Status'}
            value={
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
                style={{ color: st.color, background: st.bg }}>
                {t(`dossier.status_${dossier.status}`, 'investments') || dossier.status}
              </span>
            }
          />
          {dossier.notes && (
            <div className="lg:col-span-3">
              <InfoRow
                label={t('plots.notes', 'investments') || 'Notes'}
                value={dossier.notes}
              />
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}
