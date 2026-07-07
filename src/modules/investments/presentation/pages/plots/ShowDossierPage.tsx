import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Dossier } from '../../../domain/entities/dossier';
import type { DossierStatusHistory } from '../../../domain/entities/dossierStatusHistory';
import type { Investor } from '../../../domain/entities/investor';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { LoadingState } from '../../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { DossierStatusHistoryModal } from './components/DossierStatusHistoryModal';
import { InvestorPickerDialog } from './components/InvestorPickerDialog';
import { ArrowRight, History, Trash2, Plus, Users, FileText } from 'lucide-react';
import { SectionCard } from '../../../../../core/presentation/layouts/ui/card/SectionCard';
import { InfoRow } from '../../../../../core/presentation/layouts/ui/card/InfoRow';

export function ShowDossierPage() {
  const { t } = useLanguage();
  const { plotId, dossierId } = useParams<{ plotId: string; dossierId: string }>();
  const navigate = useNavigate();

  const { getById } = useEntityCrud<Dossier>(
    `/investments/plots/${plotId}/dossiers`,
    `/investments/plots/${plotId}/dossiers`
  );

  const { getAll: getHistory } = useEntityCrud<DossierStatusHistory>(
    `/investments/plots/${plotId}/dossiers/${dossierId}/status-history`,
    `/investments/plots/${plotId}/dossiers/${dossierId}/status-history`
  );

  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [histories, setHistories] = useState<DossierStatusHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [selectedPartners, setSelectedPartners] = useState<Investor[]>([]);
  const [isInvestorPickerOpen, setIsInvestorPickerOpen] = useState(false);
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<(string | number)[]>([]);

  useEffect(() => {
    if (!dossierId) return;
    getById(Number(dossierId))
      .then((res) => {
        if (res?.data) setDossier(res.data);
        else setError(t('dossier.not_found', 'investments') || 'Dossier not found');
      })
      .catch(() => setError(t('dossier.load_error', 'investments') || 'Failed to load dossier'))
      .finally(() => setLoading(false));
  }, [dossierId]);

  const handleOpenHistory = useCallback(async () => {
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await getHistory();
      if (res?.data) setHistories(res.data);
      else setHistories([]);
    } catch {
      setHistories([]);
      setHistoryError(t('dossier.load_error', 'investments') || 'Failed to load status history');
    } finally {
      setHistoryLoading(false);
    }
  }, [getHistory, t]);

  const handleBack = () => navigate(`/investments/plots/${plotId}/edit`);

  const handlePartnerPicked = (investors: Investor[]) => {
    setSelectedPartners((prev) => {
      const existingIds = new Set(prev.map((p) => p.id))
      const newOnes = investors.filter((p) => !existingIds.has(p.id))
      return [...prev, ...newOnes]
    })
    setIsInvestorPickerOpen(false)
  }

  const handleRemoveSelected = () => {
    const removeIds = new Set(selectedPartnerIds)
    setSelectedPartners((prev) => prev.filter((p) => !removeIds.has(p.id)))
    setSelectedPartnerIds([])
  }

  const partnerColumns = [
    { key: "id", label: "#", width: 60 },
    { key: "full_name", label: t("investors.full_name", "investments") || "Full Name", width: 200 },
    { key: "national_id", label: t("investors.national_id", "investments") || "National ID", width: 150 },
    { key: "phone", label: t("investors.phone", "investments") || "Phone", width: 140 },
    { key: "nationality", label: t("investors.nationality", "investments") || "Nationality", width: 130 },
  ]

  if (loading) return <div className="p-6"><LoadingState /></div>;
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={() => handleBack()} /></div>;
  if (!dossier) return null;

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
        <Button variant="outline" size="sm" onClick={handleOpenHistory} requiredPermission="investments.plot-dossier-status-histories.list">
          <History size={16} className="mr-1 rtl:ml-1 rtl:mr-0" />
          {t('dossier.status_history', 'investments') || 'Status History'}
        </Button>
      </div>

      <SectionCard
        title={t('dossier.view_details', 'investments') || 'Dossier Details'}
        icon={<FileText size={20} />}
      >
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
                style={{
                  color: dossier.status === 'active' ? '#16a34a' : dossier.status === 'allocatable' ? '#2563eb' : '#ca8a04',
                  background: dossier.status === 'active' ? '#dcfce7' : dossier.status === 'allocatable' ? '#dbeafe' : '#fefce8',
                }}>
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
      </SectionCard>

      <SectionCard
        title={t('dossier.partners', 'investments') || 'Partners'}
        icon={<Users size={20} />}
      >
        <div className="flex items-center justify-between mb-4">
          <div />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsInvestorPickerOpen(true)} leftIcon={<Plus size={16} />}>
              {t('dossier.add_investors', 'investments') || 'Add Investors'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRemoveSelected} disabled={selectedPartnerIds.length === 0} leftIcon={<Trash2 size={16} />}>
              {t('dossier.remove_selected', 'investments') || 'Remove Selected'}
            </Button>
          </div>
        </div>
        <DataTable
          columns={partnerColumns}
          data={selectedPartners}
          rowKey="id"
          selectable
          selectedRows={selectedPartnerIds}
          onSelectionChange={setSelectedPartnerIds}
          emptyMessage={t('dossier.no_partners', 'investments') || 'No partners added'}
        />
      </SectionCard>

      <InvestorPickerDialog
        isOpen={isInvestorPickerOpen}
        onClose={() => setIsInvestorPickerOpen(false)}
        onConfirm={handlePartnerPicked}
        multiple
        initialSelected={selectedPartners}
      />

      <DossierStatusHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        histories={histories}
        loading={historyLoading}
        error={historyError}
        onRetry={handleOpenHistory}
      />
    </div>
  );
}


// "permissions": [
//   "investments.plot-dossier.list",
//   "investments.plot-dossier.view",
//   "investments.plot-dossier.create",
//   "investments.plot-dossier.update",
//   "investments.plot-dossier.delete",
//   "investments.plot-dossier-status-histories.list",
//   "investments.plot-dossier-status-histories.view",
//   "investments.plot-dossier-status-histories.create",
//   "investments.plot-dossier-status-histories.update",
//   "investments.plot-dossier-status-histories.delete",
// ]