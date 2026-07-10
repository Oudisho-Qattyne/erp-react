import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { useAuth } from '../../../../../../core/infrastructure/auth/AuthProvider';
import { useDossierPartners } from '../../../hooks/useDossierPartners';
import type { Investor } from '../../../../domain/entities/investor';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { InvestorPickerDialog } from './InvestorPickerDialog';
import { SectionCard } from '../../../../../../core/presentation/layouts/ui/card/SectionCard';
import { Users, Plus, Trash2 } from 'lucide-react';

interface PartnersSectionProps {
  plotId: string;
  dossierId: string;
}

export function PartnersSection({ plotId, dossierId }: PartnersSectionProps) {
  const { t } = useLanguage();
  const { hasPermission } = useAuth();
  const partnersHook = useDossierPartners();

  const [isInvestorPickerOpen, setIsInvestorPickerOpen] = useState(false);
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<(string | number)[]>([]);

  useEffect(() => {
    if (dossierId) partnersHook.getPartners(Number(plotId), Number(dossierId));
  }, [dossierId]);

  const handlePartnerPicked = (investors: Investor[]) => {
    const ids = investors.map((p) => p.id)
    partnersHook.addPartners(Number(plotId), Number(dossierId), ids)
    setIsInvestorPickerOpen(false)
  }

  const handleRemoveSelected = () => {
    if (selectedPartnerIds.length > 0) {
      partnersHook.deletePartners(Number(plotId), Number(dossierId), selectedPartnerIds.map(Number))
      setSelectedPartnerIds([])
    }
  }

  const partnerColumns = [
    { key: "id", label: "#", width: 60 },
    { key: "full_name", label: t("investors.full_name", "investments") || "Full Name", width: 200 },
    { key: "national_id", label: t("investors.national_id", "investments") || "National ID", width: 150 },
    { key: "phone", label: t("investors.phone", "investments") || "Phone", width: 140 },
    { key: "nationality", label: t("investors.nationality", "investments") || "Nationality", width: 130 },
  ]

  if (!hasPermission("investments.plot-dossier.list-partners")) return null;

  return (
    <>
      <SectionCard
        title={t('dossier.partners', 'investments') || 'Partners'}
        icon={<Users size={20} />}
      >
        <div className="flex items-center justify-between mb-4">
          <div />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsInvestorPickerOpen(true)} leftIcon={<Plus size={16} />} requiredPermission="investments.plot-dossier.add-partner">
              {t('dossier.add_investors', 'investments') || 'Add Investors'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRemoveSelected} disabled={selectedPartnerIds.length === 0} leftIcon={<Trash2 size={16} />} requiredPermission="investments.plot-dossier.remove-partner">
              {t('dossier.remove_selected', 'investments') || 'Remove Selected'}
            </Button>
          </div>
        </div>
        <DataTable
          columns={partnerColumns}
          data={partnersHook.partners}
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
        initialSelected={partnersHook.partners}
      />
    </>
  );
}
