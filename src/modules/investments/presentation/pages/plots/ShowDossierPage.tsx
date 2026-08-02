import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Dossier } from '../../../domain/entities/dossier';
import type { Plot } from '../../../domain/entities/plot';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { LoadingState } from '../../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { DossierStatusHistoryModal } from './components/DossierStatusHistoryModal';
import { DossierDetailsSection } from './components/DossierDetailsSection';
import { PlotDetailsSection } from './components/PlotDetailsSection';
import { PartnersSection } from './components/PartnersSection';
import { FacilitiesSection } from './components/FacilitiesSection';
import { ContractsSection } from './components/ContractsSection';
import { RentContractSection } from './components/RentContractSection';

import { ArrowRight, History } from 'lucide-react';

export function ShowDossierPage() {
  const { t } = useLanguage();
  const { plotId, dossierId } = useParams<{ plotId: string; dossierId: string }>();
  const navigate = useNavigate();

  const { getById } = useEntityCrud<Dossier>(
    `/investments/plots/${plotId}/dossiers`,
    `/investments/plots/${plotId}/dossiers`
  );

  const { getById: getPlotById } = useEntityCrud<Plot>(
    `/investments/plots`,
    `/investments/plots`
  );

  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [plot, setPlot] = useState<Plot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);

  const plotStatus = plot?.status ?? null;
  const canShowContracts = plotStatus === 'allocated' && dossier?.status === 'active';

  useEffect(() => {
    if (!dossierId || !plotId) return;
    Promise.all([
      getById(Number(dossierId)),
      getPlotById(Number(plotId)),
    ])
      .then(([dossierRes, plotRes]) => {
        if (dossierRes?.data) setDossier(dossierRes.data);
        else setError(t('dossier.not_found', 'investments') || 'Dossier not found');
        if (plotRes?.data) setPlot(plotRes.data);
      })
      .catch(() => setError(t('dossier.load_error', 'investments') || 'Failed to load dossier'))
      .finally(() => setLoading(false));
  }, [dossierId, plotId]);

  const handleBack = () => navigate(`/investments/plots/${plotId}/edit`);

  if (error) return <div className="p-6"><ErrorState message={error} onRetry={() => handleBack()} /></div>;
  if (!loading && !dossier) return null;

  return (
    <div className="p-6 w-full mx-auto space-y-6">
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowRight size={16} /> {t('dossier.back_to_plot', 'investments') || 'Back to Plot'}
          </Button>
          <h1 className="text-2xl font-bold">
            {t('dossier.view_details', 'investments') || 'View Dossier Details'}
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)} requiredPermission="investments.plot-dossier-status-histories.list">
          <History size={16} className="mr-1 rtl:ml-1 rtl:mr-0" />
          {t('dossier.status_history', 'investments') || 'Status History'}
        </Button>
      </div>

      {plotId && dossierId &&
        (loading
          ? <div className="py-8"><LoadingState message={t('common.loading', 'shared') || 'Loading...'} /></div>
          : <DossierDetailsSection dossierId={dossierId} plotId={plotId} dossier={dossier} />
        )
      }

      {plotId &&
        (loading
          ? <div className="py-8"><LoadingState message={t('common.loading', 'shared') || 'Loading...'} /></div>
          : <PlotDetailsSection plotId={plotId} plot={plot} />
        )
      }
      {dossierId && plotId &&
        <PartnersSection plotId={plotId} dossierId={dossierId} />
      }
      {dossierId && plotId &&
        <FacilitiesSection plotId={plotId} dossierId={dossierId} />
      }
      {dossierId && plotId && canShowContracts &&
        <ContractsSection plotId={plotId} dossierId={dossierId} />
      }
      {dossierId && plotId &&
        <RentContractSection plotId={plotId} dossierId={dossierId} />
      }

      {plotId && dossierId && (
        <DossierStatusHistoryModal
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          plotId={plotId}
          dossierId={dossierId}
        />
      )}

    </div>
  );
}


// "permissions": [
//         "hr.employees.list",
//         "hr.employees.view",
//         "hr.employees.create",
//         "hr.employees.update",
//         "hr.employees.delete",
//         "hr.employees.view-eligible-leave-types",
//         "hr.organizational-levels.list",
//         "hr.organizational-levels.view",
//         "hr.organizational-levels.create",
//         "hr.organizational-levels.update",
//         "hr.organizational-levels.delete",
//         "hr.chronic-diseases.list",
//         "hr.chronic-diseases.view",
//         "hr.chronic-diseases.create",
//         "hr.chronic-diseases.update",
//         "hr.chronic-diseases.delete",
//         "hr.leave-types.list",
//         "hr.leave-types.view",
//         "hr.leave-types.create",
//         "hr.leave-types.update",
//         "hr.leave-types.delete",
//         "hr.leave-balance.adjust",
//         "hr.leave-balance.list",
//         "hr.leave-requests.list",
//         "hr.leave-requests.manage",
//         "hr.job-statuses.list",
//         "hr.job-statuses.view",
//         "hr.job-statuses.create",
//         "hr.job-statuses.update",
//         "hr.job-statuses.delete",
//         "hr.employee-statuses.list",
//         "hr.employee-statuses.view",
//         "hr.employee-statuses.create",
//         "hr.employee-statuses.update",
//         "hr.employee-statuses.delete",
//         "investments.plot-areas.list",
//         "investments.plot-areas.view",
//         "investments.plot-areas.create",
//         "investments.plot-areas.update",
//         "investments.plot-areas.delete",
//         "investments.plot-classifications.list",
//         "investments.plot-classifications.view",
//         "investments.plot-classifications.create",
//         "investments.plot-classifications.update",
//         "investments.plot-classifications.delete",
//         "investments.plots.list",
//         "investments.plots.view",
//         "investments.plots.create",
//         "investments.plots.update",
//         "investments.plots.delete",
//         "investments.plots.set-unsold",
//         "investments.plots.set-announced",
//         "investments.plots.set-subscribed",
//         "investments.plots.set-allocated",
//         "investments.plots.set-separated",
//         "investments.investors.list",
//         "investments.investors.view",
//         "investments.investors.create",
//         "investments.investors.update",
//         "investments.investors.delete",
//         "investments.industry-categories.list",
//         "investments.industry-categories.view",
//         "investments.industry-categories.create",
//         "investments.industry-categories.update",
//         "investments.industry-categories.delete",
//         "investments.industry-types.list",
//         "investments.industry-types.view",
//         "investments.industry-types.create",
//         "investments.industry-types.update",
//         "investments.industry-types.delete",
//         "investments.plot-dossier.list",
//         "investments.plot-dossier.view",
//         "investments.plot-dossier.create",
//         "investments.plot-dossier.update",
//         "investments.plot-dossier.delete",
//         "investments.plot-dossier-status-histories.list",
//         "investments.plot-dossier-status-histories.view",
//         "investments.plot-dossier-status-histories.create",
//         "investments.plot-dossier-status-histories.update",
//         "investments.plot-dossier-status-histories.delete",
//         "investments.plot-dossier.list-partners",
//         "investments.plot-dossier.add-partner",
//         "investments.plot-dossier.remove-partner",
//         "investments.industrial-decision-types.list",
//         "investments.industrial-decision-types.view",
//         "investments.industrial-decision-types.create",
//         "investments.industrial-decision-types.update",
//         "investments.industrial-decision-types.delete",
//         "investments.industrial-license-sources.list",
//         "investments.industrial-license-sources.view",
//         "investments.industrial-license-sources.create",
//         "investments.industrial-license-sources.update",
//         "investments.industrial-license-sources.delete",
//         "investments.facilities.list",
//         "investments.facilities.view",
//         "investments.facilities.create",
//         "investments.facilities.update",
//         "investments.facilities.delete",
//         "investments.facility-industrial-licenses.list",
//         "investments.facility-industrial-licenses.view",
//         "investments.facility-industrial-licenses.create",
//         "investments.facility-industrial-licenses.update",
//         "investments.facility-industrial-licenses.delete",
//         "storage.storage.view",
//         "storage.folder.create",
//         "storage.folder.rename",
//         "storage.folder.move",
//         "storage.folder.delete",
//         "storage.file.upload",
//         "storage.file.download",
//         "storage.file.rename",
//         "storage.file.move",
//         "storage.file.delete",
//         "users.users.view",
//         "users.users.add",
//         "users.users.edit",
//         "users.users.export",
//         "users.roles.view",
//         "users.roles.add",
//         "users.roles.edit",
//         "users.roles.delete",
//         "users.settings.change",
//         "users.users.link-to-employee",
//         "shared.audit-logs.view"
//       ]