import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Contract } from '../../../domain/entities/contract';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { LoadingState } from '../../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { SectionCard } from '../../../../../core/presentation/layouts/ui/card/SectionCard';
import { InfoRow } from '../../../../../core/presentation/layouts/ui/card/InfoRow';
import { ArrowLeft, FileSignature } from 'lucide-react';
import { InstallmentsSection } from './InstallmentsSection';
import { useInstallments } from '../../hooks/useInstallments';
import { DossierDetailsSection } from '../plots/components/DossierDetailsSection';
import { PlotDetailsSection } from '../plots/components/PlotDetailsSection';

export function ShowContractPage() {
  const { t } = useLanguage();
  const { id, plotId, dossierId } = useParams<{ id: string; plotId: string; dossierId: string }>();
  const navigate = useNavigate();

  const { getById } = useEntityCrud<Contract>(
    '/investments/contracts',
    '/investments/contracts'
  );

  const {
    setContract: setInstContract,
    installments,
    payNextUnpaidInstallment,
    updatePaymentDate,
    loading,
  } = useInstallments();

  const [contract, setContract] = useState<Contract | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContract = useCallback(async (contractId: number) => {
    const res = await getById(contractId);
    if (res?.data) {
      setContract(res.data);
      setInstContract(res.data);
    }
  }, [getById, setInstContract]);

  useEffect(() => {
    if (!id) return;
    getById(Number(id))
      .then((res) => {
        if (res?.data) {
          setContract(res.data);
          setInstContract(res.data);
        } else setError(t('contract.not_found', 'investments') || 'Contract not found');
      })
      .catch(() => setError(t('contract.load_error', 'investments') || 'Failed to load contract'))
      .finally(() => setInitialLoading(false));
  }, [id]);

  const handlePayNextUnpaid = useCallback(async (contractId: number, paymentDate: string) => {
    await payNextUnpaidInstallment(contractId, paymentDate);
    await loadContract(contractId);
  }, [payNextUnpaidInstallment, loadContract]);

  const handleUpdatePaymentDate = useCallback(async (installmentId: number, contractId: number, paymentDate: string) => {
    await updatePaymentDate(installmentId, contractId, paymentDate);
    await loadContract(contractId);
  }, [updatePaymentDate, loadContract]);

  if (initialLoading) return <div className="p-6"><LoadingState message={t('common.loading', 'shared') || 'Loading...'} /></div>;
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={() => {
    const plot = contract?.plot_id ?? contract?.plot?.id
    const dossier = contract?.dossier_id ?? contract?.dossier?.id
    if (plot && dossier) navigate(`investments/plots/${plot}/dossiers/${dossier}`)
    else window.location.reload()
  }} /></div>;
  if (!contract) return null;

  return (
    <div className="p-6 w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => {
            const plot = contract.plot_id ?? contract.plot?.id ?? contract.dossier.plot_id
            const dossier = contract.dossier_id ?? contract.dossier?.id
             if(plot && dossier) navigate(`/investments/plots/${plot}/dossiers/${dossier}`)
          }}>
            <ArrowLeft size={16} /> {t('common.back', 'shared') || 'Back'}
          </Button>
          <h1 className="text-2xl font-bold">
            {t('contract.section_title', 'investments') || 'Contract'} — {contract.contract_number}
          </h1>
        </div>
      </div>

      <SectionCard>
        <div className="relative w-full flex justify-between items-center mb-6 pb-4">
          <h2 className="text-lg font-bold text-text flex items-center gap-2 border-b border-border/50">
            <span className="text-primary"><FileSignature size={20} /></span>
            {t('contract.section_title', 'investments') || 'Contract'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoRow
            label={t('contract.contract_number', 'investments') || 'Contract Number'}
            value={contract.contract_number}
          />
          <InfoRow
            label={t('contract.contract_date', 'investments') || 'Contract Date'}
            value={contract.contract_date}
          />
          <InfoRow
            label={t('contract.unit_price_per_square_meter', 'investments') || 'Unit Price / m²'}
            value={contract.unit_price_per_square_meter}
          />
          <InfoRow
            label={t('contract.weighting_factor', 'investments') || 'Weighting Factor'}
            value={contract.weighting_factor}
          />
          <InfoRow
            label={t('contract.final_price_per_square_meter', 'investments') || 'Final Price / m²'}
            value={contract.final_price_per_square_meter}
          />
          <InfoRow
            label={t('contract.total_price', 'investments') || 'Total Price'}
            value={contract.total_price}
          />
          <InfoRow
            label={t('contract.payment_method', 'investments') || 'Payment Method'}
            value={t(`contract.payment_method_${contract.payment_method}`, 'investments') || contract.payment_method}
          />
        </div>
      </SectionCard>

      {plotId && dossierId && (
        <>
          <PlotDetailsSection plotId={plotId} />
          <DossierDetailsSection dossierId={dossierId} plotId={plotId} dossier={contract.dossier ?? null} />
        </>
      )}
      {
        contract.payment_method == "installment" &&
        <InstallmentsSection
          contractId={contract.id}
          installments={installments}
          payLoading={loading['payNextUnpaidInstallment']}
          updateLoading={loading['updatePaymentDate']}
          onPayNextUnpaid={handlePayNextUnpaid}
          onUpdatePaymentDate={handleUpdatePaymentDate}
        />
      }

    </div>
  );
}
