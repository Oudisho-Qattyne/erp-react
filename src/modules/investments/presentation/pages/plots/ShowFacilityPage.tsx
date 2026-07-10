import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Facility } from '../../../domain/entities/facility';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { LoadingState } from '../../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { SectionCard } from '../../../../../core/presentation/layouts/ui/card/SectionCard';
import { InfoRow } from '../../../../../core/presentation/layouts/ui/card/InfoRow';
import { FacilityIndustrialLicensesSection } from './components/FacilityIndustrialLicensesSection';
import { ArrowRight, Factory } from 'lucide-react';

export function ShowFacilityPage() {
  const { t } = useLanguage();
  const { plotId, dossierId, facilityId } = useParams<{ plotId: string; dossierId: string; facilityId: string }>();
  const navigate = useNavigate();

  const { getById } = useEntityCrud<Facility>(`/investments/facilities`, `/investments/facilities`);

  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!facilityId) return;
    getById(Number(facilityId))
      .then((res) => {
        if (res?.data) setFacility(res.data);
        else setError(t('facilities.not_found', 'investments') || 'Facility not found');
      })
      .catch(() => setError(t('facilities.load_error', 'investments') || 'Failed to load facility'))
      .finally(() => setLoading(false));
  }, [facilityId]);

  const handleBack = () => navigate(`/investments/plots/${plotId}/dossiers/${dossierId}`);

  if (loading) return <div className="p-6"><LoadingState /></div>;
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={() => window.location.reload()} /></div>;
  if (!facility) return null;

  return (
    <div className="p-6 w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowRight size={16} /> {t('facilities.back_to_dossier', 'investments') || 'Back to Dossier'}
          </Button>
          <h1 className="text-2xl font-bold">
            {t('facilities.view', 'investments') || 'View Facility'}
          </h1>
        </div>
      </div>

      <SectionCard
        title={facility.name}
        icon={<Factory size={20} />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoRow label={t('facilities.name', 'investments') || 'Name'} value={facility.name} />
          <InfoRow label={t('facilities.city', 'investments') || 'City'} value={facility.city} />
          <InfoRow label={t('facilities.address', 'investments') || 'Address'} value={facility.address} />
          <InfoRow label={t('facilities.first_phone_number', 'investments') || 'Phone'} value={facility.first_phone_number} />
          <InfoRow label={t('facilities.second_phone_number', 'investments') || 'Phone 2'} value={facility.second_phone_number || '—'} />
          <InfoRow label={t('facilities.email', 'investments') || 'Email'} value={facility.email || '—'} />
          <InfoRow label={t('facilities.number_of_workers', 'investments') || 'Workers'} value={facility.number_of_workers ?? '—'} />
          <InfoRow label={t('facilities.capital_in_syp', 'investments') || 'Capital (SYP)'} value={facility.capital_in_syp ?? '—'} />
          <InfoRow label={t('facilities.capital_in_usd', 'investments') || 'Capital (USD)'} value={facility.capital_in_usd ?? '—'} />
          <InfoRow label={t('facilities.value_of_machines_in_syp', 'investments') || 'Machinery Value (SYP)'} value={facility.value_of_machines_in_syp ?? '—'} />
          <InfoRow label={t('facilities.value_of_machines_in_usd', 'investments') || 'Machinery Value (USD)'} value={facility.value_of_machines_in_usd ?? '—'} />
          <InfoRow label={t('facilities.daily_production_capacity', 'investments') || 'Daily Capacity'} value={facility.daily_production_capacity ?? '—'} />
          <InfoRow label={t('facilities.monthly_production_capacity', 'investments') || 'Monthly Capacity'} value={facility.monthly_production_capacity ?? '—'} />
          <InfoRow label={t('facilities.yearly_production_capacity', 'investments') || 'Annual Capacity'} value={facility.yearly_production_capacity ?? '—'} />
          <InfoRow label={t('facilities.electrical_power_capacity', 'investments') || 'Power Capacity'} value={facility.electrical_power_capacity || '—'} />
          <InfoRow label={t('facilities.yearly_estimated_water_consumption', 'investments') || 'Water Consumption'} value={facility.yearly_estimated_water_consumption ?? '—'} />
        </div>
      </SectionCard>
      {
        facilityId &&
        <FacilityIndustrialLicensesSection facilityId={facilityId} />
      }
    </div>
  );
}
